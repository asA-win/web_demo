from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class SettingsUpdate(BaseModel):
    restaurant_name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    google_maps_url: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    slot_duration_minutes: Optional[int] = None
    max_guests_per_booking: Optional[int] = None
    booking_policy: Optional[str] = None
    is_accepting_reservations: Optional[bool] = None
    announcement_banner: Optional[str] = None

class SettingsResponse(BaseModel):
    id: int
    restaurant_name: str
    tagline: str
    description: Optional[str]
    phone: str
    email: str
    address: str
    google_maps_url: str
    opening_time: str
    closing_time: str
    slot_duration_minutes: int
    max_guests_per_booking: int
    booking_policy: Optional[str]
    is_accepting_reservations: bool
    announcement_banner: Optional[str]
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
