from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base

class CustomerEnquiry(Base):
    __tablename__ = "customer_enquiries"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(150), index=True, nullable=False)
    customer_email = Column(String(255), index=True, nullable=False)
    customer_phone = Column(String(50), nullable=True)
    subject = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="pending", index=True, nullable=False) # pending, read, replied, archived
    admin_reply = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
