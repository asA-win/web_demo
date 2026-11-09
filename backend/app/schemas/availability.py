from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class TimeSlot(BaseModel):
    time: str # e.g. "12:00", "13:00", "18:00", "19:00", etc.
    available: bool
    remaining_tables: int
    reason: Optional[str] = None

class AvailabilityResponse(BaseModel):
    date: date
    guest_count: int
    seating_preference: Optional[str] = "Any"
    slots: List[TimeSlot]
