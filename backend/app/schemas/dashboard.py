from pydantic import BaseModel
from typing import List
from app.schemas.reservation import ReservationResponse
from app.schemas.enquiry import EnquiryResponse

class DashboardStatsResponse(BaseModel):
    total_bookings: int
    today_bookings: int
    pending_reservations: int
    confirmed_reservations: int
    cancelled_reservations: int
    total_enquiries: int
    pending_enquiries: int
    total_tables: int
    total_menu_items: int
    recent_reservations: List[ReservationResponse] = []
    recent_enquiries: List[EnquiryResponse] = []
