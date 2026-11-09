from app.routers.auth import router as auth_router
from app.routers.menu import router as menu_router
from app.routers.tables import router as tables_router
from app.routers.availability import router as availability_router
from app.routers.reservations import router as reservations_router
from app.routers.enquiries import router as enquiries_router
from app.routers.dashboard import router as dashboard_router
from app.routers.settings import router as settings_router
from app.routers.websocket import router as websocket_router

__all__ = [
    "auth_router",
    "menu_router",
    "tables_router",
    "availability_router",
    "reservations_router",
    "enquiries_router",
    "dashboard_router",
    "settings_router",
    "websocket_router",
]
