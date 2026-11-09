from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class TableBase(BaseModel):
    table_number: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    capacity: int = Field(..., ge=1, le=50)
    minimum_guests: int = Field(1, ge=1)
    location: str = "Main Dining Hall"
    is_active: bool = True

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    name: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1, le=50)
    minimum_guests: Optional[int] = Field(None, ge=1)
    location: Optional[str] = None
    is_active: Optional[bool] = None

class TableResponse(TableBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
