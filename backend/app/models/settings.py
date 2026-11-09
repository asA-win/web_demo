from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.database import Base

class RestaurantSetting(Base):
    __tablename__ = "restaurant_settings"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_name = Column(String(150), default="Layali Dubai — Royal Lounge & Dining", nullable=False)
    tagline = Column(String(255), default="Haute Emirati & Mediterranean Culinary Symphony", nullable=False)
    description = Column(Text, nullable=True)
    phone = Column(String(50), default="+971 4 888 3456", nullable=False)
    email = Column(String(150), default="reservations@layalidubai.ae", nullable=False)
    address = Column(Text, default="Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, United Arab Emirates", nullable=False)
    google_maps_url = Column(Text, default="https://maps.google.com/?q=Downtown+Dubai", nullable=False)
    opening_time = Column(String(10), default="12:00", nullable=False)
    closing_time = Column(String(10), default="01:00", nullable=False)
    slot_duration_minutes = Column(Integer, default=120, nullable=False)
    max_guests_per_booking = Column(Integer, default=16, nullable=False)
    booking_policy = Column(Text, default="Reservations can be cancelled or modified up to 2 hours in advance without penalty. Smart casual attire required.", nullable=True)
    is_accepting_reservations = Column(Boolean, default=True, nullable=False)
    announcement_banner = Column(Text, default="Experience our exclusive Ramadan & Eid Royal Tasting Menu with terrace views of the Dubai Fountain.", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
