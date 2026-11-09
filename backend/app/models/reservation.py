from datetime import datetime, date, time
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(30), unique=True, index=True, nullable=False)
    customer_name = Column(String(150), index=True, nullable=False)
    customer_email = Column(String(255), index=True, nullable=False)
    customer_phone = Column(String(50), index=True, nullable=False)
    reservation_date = Column(Date, index=True, nullable=False)
    reservation_time = Column(Time, index=True, nullable=False)
    guest_count = Column(Integer, nullable=False)
    seating_preference = Column(String(100), default="Any", nullable=True) # "Burj View Terrace", "Royal Majlis VIP", "Main Dining Hall", "Any"
    special_requests = Column(Text, nullable=True)
    status = Column(String(30), default="pending", index=True, nullable=False) # pending, confirmed, completed, cancelled, rejected
    table_id = Column(Integer, ForeignKey("restaurant_tables.id", ondelete="SET NULL"), nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    table = relationship("RestaurantTable", back_populates="reservations")
