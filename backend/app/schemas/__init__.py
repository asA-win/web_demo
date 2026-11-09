from app.schemas.auth import LoginRequest, Token, UserResponse, UserCreate
from app.schemas.menu import MenuCategoryCreate, MenuCategoryUpdate, MenuCategoryResponse, MenuItemCreate, MenuItemUpdate, MenuItemResponse
from app.schemas.table import TableCreate, TableUpdate, TableResponse
from app.schemas.reservation import ReservationCreate, ReservationStatusUpdate, ReservationCancelRequest, ReservationResponse
from app.schemas.availability import AvailabilityResponse, TimeSlot
from app.schemas.enquiry import EnquiryCreate, EnquiryStatusUpdate, EnquiryResponse
from app.schemas.settings import SettingsUpdate, SettingsResponse
from app.schemas.dashboard import DashboardStatsResponse

__all__ = [
    "LoginRequest", "Token", "UserResponse", "UserCreate",
    "MenuCategoryCreate", "MenuCategoryUpdate", "MenuCategoryResponse",
    "MenuItemCreate", "MenuItemUpdate", "MenuItemResponse",
    "TableCreate", "TableUpdate", "TableResponse",
    "ReservationCreate", "ReservationStatusUpdate", "ReservationCancelRequest", "ReservationResponse",
    "AvailabilityResponse", "TimeSlot",
    "EnquiryCreate", "EnquiryStatusUpdate", "EnquiryResponse",
    "SettingsUpdate", "SettingsResponse",
    "DashboardStatsResponse"
]
