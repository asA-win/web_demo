import random
import string
from datetime import datetime, date, time, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.reservation import Reservation
from app.models.table import RestaurantTable
from app.models.settings import RestaurantSetting
from app.schemas.reservation import (
    ReservationCreate,
    ReservationResponse,
    ReservationStatusUpdate,
    ReservationCancelRequest
)
from app.core.security import get_current_admin_user
from app.core.websocket_manager import manager
from app.routers.availability import parse_time_str, time_diff_minutes

router = APIRouter(prefix="/api/reservations", tags=["Reservations"])

def generate_booking_reference() -> str:
    digits = ''.join(random.choices(string.digits, k=4))
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    return f"LYL-{digits}-{letters}"

@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    booking_in: ReservationCreate,
    db: Session = Depends(get_db)
):
    # 1. Validate date not in the past
    today = date.today()
    if booking_in.reservation_date < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation date cannot be in the past."
        )

    # 2. Parse time
    slot_time = parse_time_str(booking_in.reservation_time)
    if booking_in.reservation_date == today:
        slot_dt = datetime.combine(today, slot_time)
        if slot_dt < datetime.now() + timedelta(minutes=30):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reservations must be booked at least 30 minutes in advance."
            )

    # 3. Check settings
    settings = db.query(RestaurantSetting).first()
    if settings:
        if not settings.is_accepting_reservations:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Online reservations are currently paused. Please call the restaurant directly."
            )
        if booking_in.guest_count > settings.max_guests_per_booking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum online party size is {settings.max_guests_per_booking} guests. Please call for private group dining."
            )
    slot_duration = settings.slot_duration_minutes if settings else 120

    # 4. Check table availability & find the best matching table
    # Find active tables that can fit the guest count
    table_query = db.query(RestaurantTable).filter(
        RestaurantTable.is_active == True,
        RestaurantTable.capacity >= booking_in.guest_count
    )

    if booking_in.seating_preference and booking_in.seating_preference != "Any":
        preferred_tables = table_query.filter(RestaurantTable.location == booking_in.seating_preference).order_by(RestaurantTable.capacity.asc()).all()
        candidate_tables = preferred_tables if preferred_tables else table_query.order_by(RestaurantTable.capacity.asc()).all()
    else:
        candidate_tables = table_query.order_by(RestaurantTable.capacity.asc()).all()

    if not candidate_tables:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No restaurant tables can accommodate the requested party size."
        )

    # Find existing reservations that overlap with this date & time
    overlapping_reservations = db.query(Reservation).filter(
        Reservation.reservation_date == booking_in.reservation_date,
        Reservation.status.in_(["pending", "confirmed"])
    ).all()

    busy_table_ids = set()
    for res in overlapping_reservations:
        if time_diff_minutes(res.reservation_time, slot_time) < slot_duration:
            if res.table_id:
                busy_table_ids.add(res.table_id)

    # Assign the best available table (closest capacity match)
    assigned_table = None
    for tbl in candidate_tables:
        if tbl.id not in busy_table_ids:
            assigned_table = tbl
            break

    if not assigned_table:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No tables are available for the selected date, time, and party size. Please choose an alternative time slot."
        )

    # 5. Generate unique booking reference
    booking_ref = None
    for _ in range(10):
        ref = generate_booking_reference()
        if not db.query(Reservation).filter(Reservation.booking_reference == ref).first():
            booking_ref = ref
            break

    if not booking_ref:
        booking_ref = f"LYL-{int(datetime.utcnow().timestamp())}"

    # 6. Create reservation in database
    reservation = Reservation(
        booking_reference=booking_ref,
        customer_name=booking_in.customer_name.strip(),
        customer_email=booking_in.customer_email.strip().lower(),
        customer_phone=booking_in.customer_phone.strip(),
        reservation_date=booking_in.reservation_date,
        reservation_time=slot_time,
        guest_count=booking_in.guest_count,
        seating_preference=booking_in.seating_preference,
        special_requests=booking_in.special_requests.strip() if booking_in.special_requests else None,
        status="pending",
        table_id=assigned_table.id
    )

    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    # Eager load table relationship
    db.refresh(reservation, ["table"])

    # 7. WebSocket Real-time Broadcast to Admin Dashboard!
    res_data = {
        "id": reservation.id,
        "booking_reference": reservation.booking_reference,
        "customer_name": reservation.customer_name,
        "customer_email": reservation.customer_email,
        "customer_phone": reservation.customer_phone,
        "reservation_date": str(reservation.reservation_date),
        "reservation_time": str(reservation.reservation_time),
        "guest_count": reservation.guest_count,
        "seating_preference": reservation.seating_preference,
        "status": reservation.status,
        "table_name": assigned_table.name if assigned_table else None,
        "created_at": str(reservation.created_at)
    }

    await manager.broadcast_to_admins("NEW_RESERVATION", res_data)
    await manager.broadcast_to_public("AVAILABILITY_CHANGED", {"date": str(reservation.reservation_date)})

    return reservation

@router.get("/lookup", response_model=ReservationResponse)
def lookup_reservation(
    booking_reference: str = Query(..., description="Unique booking reference e.g. LYL-1234-AB"),
    contact: str = Query(..., description="Email or phone number used during booking"),
    db: Session = Depends(get_db)
):
    """Allow customer to view their booking status."""
    clean_ref = booking_reference.strip().upper()
    clean_contact = contact.strip().lower()

    res = db.query(Reservation).options(joinedload(Reservation.table)).filter(
        Reservation.booking_reference == clean_ref,
        (Reservation.customer_email == clean_contact) | (Reservation.customer_phone == contact.strip())
    ).first()

    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found. Please check your reference code and email or phone number."
        )

    return res

@router.post("/{booking_reference}/cancel", response_model=ReservationResponse)
async def cancel_reservation_by_customer(
    booking_reference: str,
    cancel_data: ReservationCancelRequest,
    db: Session = Depends(get_db)
):
    """Allow customer to cancel their reservation subject to policy."""
    clean_ref = booking_reference.strip().upper()
    clean_email = cancel_data.customer_email.strip().lower()

    reservation = db.query(Reservation).options(joinedload(Reservation.table)).filter(
        Reservation.booking_reference == clean_ref,
        Reservation.customer_email == clean_email
    ).first()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found or email does not match.")

    if reservation.status == "cancelled":
        raise HTTPException(status_code=400, detail="This reservation is already cancelled.")

    if reservation.status == "completed":
        raise HTTPException(status_code=400, detail="Completed reservations cannot be cancelled.")

    # Check policy: at least 2 hours before reservation time
    res_dt = datetime.combine(reservation.reservation_date, reservation.reservation_time)
    if res_dt < datetime.now() + timedelta(hours=2):
        raise HTTPException(
            status_code=400,
            detail="Reservations can only be cancelled up to 2 hours before the dining time. Please call the restaurant directly."
        )

    reservation.status = "cancelled"
    reservation.cancellation_reason = cancel_data.cancellation_reason
    db.commit()
    db.refresh(reservation)

    payload = {
        "booking_reference": reservation.booking_reference,
        "status": "cancelled",
        "cancellation_reason": reservation.cancellation_reason,
        "customer_name": reservation.customer_name
    }

    # Notify admin dashboard & notify any customer websocket viewing this booking
    await manager.broadcast_to_admins("RESERVATION_CANCELLED", payload)
    await manager.notify_reservation_status(clean_ref, payload)
    await manager.broadcast_to_public("AVAILABILITY_CHANGED", {"date": str(reservation.reservation_date)})

    return reservation

# --- Admin Endpoints ---

@router.get("", response_model=List[ReservationResponse])
def get_all_reservations(
    status_filter: Optional[str] = Query(None, alias="status"),
    date_filter: Optional[date] = Query(None, alias="date"),
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    """Admin endpoint to view and filter all reservations."""
    query = db.query(Reservation).options(joinedload(Reservation.table))

    if status_filter:
        query = query.filter(Reservation.status == status_filter)
    if date_filter:
        query = query.filter(Reservation.reservation_date == date_filter)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Reservation.booking_reference.ilike(search_term)) |
            (Reservation.customer_name.ilike(search_term)) |
            (Reservation.customer_email.ilike(search_term)) |
            (Reservation.customer_phone.ilike(search_term))
        )

    return query.order_by(Reservation.reservation_date.desc(), Reservation.reservation_time.desc()).offset(offset).limit(limit).all()

@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation_by_id(
    reservation_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    res = db.query(Reservation).options(joinedload(Reservation.table)).filter(Reservation.id == reservation_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return res

@router.patch("/{reservation_id}/status", response_model=ReservationResponse)
async def update_reservation_status(
    reservation_id: int,
    status_in: ReservationStatusUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    """Admin confirm, reject, complete or cancel a reservation."""
    reservation = db.query(Reservation).options(joinedload(Reservation.table)).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    reservation.status = status_in.status
    if status_in.table_id is not None:
        reservation.table_id = status_in.table_id
    if status_in.admin_notes is not None:
        reservation.admin_notes = status_in.admin_notes

    db.commit()
    db.refresh(reservation)

    payload = {
        "id": reservation.id,
        "booking_reference": reservation.booking_reference,
        "customer_name": reservation.customer_name,
        "status": reservation.status,
        "table_id": reservation.table_id,
        "table_name": reservation.table.name if reservation.table else None,
        "admin_notes": reservation.admin_notes
    }

    # Broadcast to admin & customer
    await manager.broadcast_to_admins("RESERVATION_UPDATED", payload)
    await manager.notify_reservation_status(reservation.booking_reference, payload)
    await manager.broadcast_to_public("AVAILABILITY_CHANGED", {"date": str(reservation.reservation_date)})

    return reservation

@router.delete("/{reservation_id}", status_code=status.HTTP_200_OK)
async def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    ref = reservation.booking_reference
    db.delete(reservation)
    db.commit()

    await manager.broadcast_to_admins("RESERVATION_DELETED", {"id": reservation_id, "booking_reference": ref})
    return {"message": "Reservation deleted successfully"}
