from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime, time, timedelta
from typing import List, Optional
from app.database import get_db
from app.models.table import RestaurantTable
from app.models.reservation import Reservation
from app.models.settings import RestaurantSetting
from app.schemas.availability import AvailabilityResponse, TimeSlot

router = APIRouter(prefix="/api/availability", tags=["Availability"])

STANDARD_SLOTS = [
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"
]

def parse_time_str(t_str: str) -> time:
    parts = [int(p) for p in t_str.split(":")]
    return time(hour=parts[0], minute=parts[1])

def time_diff_minutes(t1: time, t2: time) -> int:
    dt1 = datetime.combine(date.today(), t1)
    dt2 = datetime.combine(date.today(), t2)
    return abs(int((dt1 - dt2).total_seconds() / 60))

@router.get("/check", response_model=AvailabilityResponse)
def check_availability(
    reservation_date: date = Query(..., description="Date for reservation YYYY-MM-DD"),
    guest_count: int = Query(..., ge=1, le=50, description="Number of guests"),
    seating_preference: Optional[str] = Query("Any", description="Seating preference"),
    db: Session = Depends(get_db)
):
    # Check if date is in the past
    today = date.today()
    if reservation_date < today:
        raise HTTPException(status_code=400, detail="Cannot check availability for past dates.")

    # Check restaurant settings
    settings = db.query(RestaurantSetting).first()
    if settings and not settings.is_accepting_reservations:
        return AvailabilityResponse(
            date=reservation_date,
            guest_count=guest_count,
            seating_preference=seating_preference,
            slots=[TimeSlot(time=s, available=False, remaining_tables=0, reason="Online reservations temporarily paused") for s in STANDARD_SLOTS]
        )

    if settings and guest_count > settings.max_guests_per_booking:
        return AvailabilityResponse(
            date=reservation_date,
            guest_count=guest_count,
            seating_preference=seating_preference,
            slots=[TimeSlot(time=s, available=False, remaining_tables=0, reason=f"Parties over {settings.max_guests_per_booking} must contact restaurant directly.") for s in STANDARD_SLOTS]
        )

    slot_duration = settings.slot_duration_minutes if settings else 120

    # Fetch active tables that can accommodate guest_count
    table_query = db.query(RestaurantTable).filter(
        RestaurantTable.is_active == True,
        RestaurantTable.capacity >= guest_count
    )

    if seating_preference and seating_preference != "Any":
        preferred_tables = table_query.filter(RestaurantTable.location == seating_preference).all()
        # If preferred tables exist, use them; otherwise use all eligible tables
        eligible_tables = preferred_tables if preferred_tables else table_query.all()
    else:
        eligible_tables = table_query.all()

    if not eligible_tables:
        return AvailabilityResponse(
            date=reservation_date,
            guest_count=guest_count,
            seating_preference=seating_preference,
            slots=[TimeSlot(time=s, available=False, remaining_tables=0, reason="No tables with this capacity") for s in STANDARD_SLOTS]
        )

    # Fetch all active reservations for this date
    existing_reservations = db.query(Reservation).filter(
        Reservation.reservation_date == reservation_date,
        Reservation.status.in_(["pending", "confirmed"])
    ).all()

    slots_result = []

    current_dt = datetime.now()

    for slot_str in STANDARD_SLOTS:
        slot_t = parse_time_str(slot_str)

        # If booking for today, ensure slot is at least 30 minutes in the future
        if reservation_date == today:
            slot_full_dt = datetime.combine(today, slot_t)
            if slot_full_dt < current_dt + timedelta(minutes=30):
                slots_result.append(TimeSlot(
                    time=slot_str,
                    available=False,
                    remaining_tables=0,
                    reason="Booking time passed for today"
                ))
                continue

        # Check which eligible tables are free for this slot
        # A table is busy if an existing reservation on that table overlaps within slot_duration
        busy_table_ids = set()
        unassigned_reservations_count = 0

        for res in existing_reservations:
            diff = time_diff_minutes(res.reservation_time, slot_t)
            if diff < slot_duration:
                if res.table_id:
                    busy_table_ids.add(res.table_id)
                else:
                    unassigned_reservations_count += 1

        available_tables = [t for t in eligible_tables if t.id not in busy_table_ids]
        remaining_count = max(0, len(available_tables) - unassigned_reservations_count)

        is_available = remaining_count > 0
        reason = None if is_available else "Fully booked for this time slot"

        slots_result.append(TimeSlot(
            time=slot_str,
            available=is_available,
            remaining_tables=remaining_count,
            reason=reason
        ))

    return AvailabilityResponse(
        date=reservation_date,
        guest_count=guest_count,
        seating_preference=seating_preference,
        slots=slots_result
    )
