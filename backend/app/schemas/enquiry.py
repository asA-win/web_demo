from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class EnquiryCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150)
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    subject: Optional[str] = None
    message: str = Field(..., min_length=5)

class EnquiryStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(pending|read|replied|archived)$")
    admin_reply: Optional[str] = None

class EnquiryResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str]
    subject: Optional[str]
    message: str
    status: str
    admin_reply: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
