from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.settings import RestaurantSetting
from app.schemas.settings import SettingsUpdate, SettingsResponse
from app.core.security import get_current_admin_user
from app.core.websocket_manager import manager

router = APIRouter(prefix="/api/settings", tags=["Restaurant Settings"])

@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(RestaurantSetting).first()
    if not settings:
        settings = RestaurantSetting()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=SettingsResponse)
async def update_settings(
    settings_in: SettingsUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    settings = db.query(RestaurantSetting).first()
    if not settings:
        settings = RestaurantSetting()
        db.add(settings)

    update_data = settings_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(settings, k, v)

    db.commit()
    db.refresh(settings)

    await manager.broadcast_to_public("SETTINGS_UPDATED", {"restaurant_name": settings.restaurant_name})
    return settings
