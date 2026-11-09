from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import date, time, datetime
from app.schemas.table import TableResponse

class ReservationCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150)
    customer_email: EmailStr
    customer_phone: str = Field(..., min_length=7, max_length=30)
    reservation_date: date
    reservation_time: str = Field(..., pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    guest_count: int = Field(..., ge=1, le=50)
    seating_preference: Optional[str] = "Any"
    special_requests: Optional[str] = None

class ReservationStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(pending|confirmed|completed|cancelled|rejected)$")
    table_id: Optional[int] = None
    admin_notes: Optional[str] = None

class ReservationCancelRequest(BaseModel):
    customer_email: EmailStr
    cancellation_reason: Optional[str] = "Customer requested cancellation"

class ReservationResponse(BaseModel):
    id: int
    booking_reference: str
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    reservation_date: date
    reservation_time: time
    guest_count: int
    seating_preference: Optional[str]
    special_requests: Optional[str]
    status: str
    table_id: Optional[int]
    table: Optional[TableResponse] = None
    cancellation_reason: Optional[str]
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
