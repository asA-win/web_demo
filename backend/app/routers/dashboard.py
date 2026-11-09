from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.reservation import Reservation
from app.models.enquiry import CustomerEnquiry
from app.models.table import RestaurantTable
from app.models.menu import MenuItem
from app.schemas.dashboard import DashboardStatsResponse
from app.core.security import get_current_admin_user

router = APIRouter(prefix="/api/dashboard", tags=["Admin Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    today = date.today()

    total_bookings = db.query(Reservation).count()
    today_bookings = db.query(Reservation).filter(Reservation.reservation_date == today).count()
    pending_reservations = db.query(Reservation).filter(Reservation.status == "pending").count()
    confirmed_reservations = db.query(Reservation).filter(Reservation.status == "confirmed").count()
    cancelled_reservations = db.query(Reservation).filter(Reservation.status == "cancelled").count()

    total_enquiries = db.query(CustomerEnquiry).count()
    pending_enquiries = db.query(CustomerEnquiry).filter(CustomerEnquiry.status == "pending").count()

    total_tables = db.query(RestaurantTable).count()
    total_menu_items = db.query(MenuItem).count()

    recent_reservations = db.query(Reservation).options(
        joinedload(Reservation.table)
    ).order_by(Reservation.created_at.desc()).limit(10).all()

    recent_enquiries = db.query(CustomerEnquiry).order_by(
        CustomerEnquiry.created_at.desc()
    ).limit(10).all()

    return DashboardStatsResponse(
        total_bookings=total_bookings,
        today_bookings=today_bookings,
        pending_reservations=pending_reservations,
        confirmed_reservations=confirmed_reservations,
        cancelled_reservations=cancelled_reservations,
        total_enquiries=total_enquiries,
        pending_enquiries=pending_enquiries,
        total_tables=total_tables,
        total_menu_items=total_menu_items,
        recent_reservations=recent_reservations,
        recent_enquiries=recent_enquiries
    )
