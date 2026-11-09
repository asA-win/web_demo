import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
from app.core.websocket_manager import manager
from app.core.security import decode_access_token

logger = logging.getLogger("websocket_router")
router = APIRouter(tags=["WebSockets"])

@router.websocket("/ws/admin")
async def websocket_admin_endpoint(websocket: WebSocket, token: Optional[str] = Query(None)):
    # Authenticate token if present
    if token:
        payload = decode_access_token(token)
        if not payload or payload.get("role") not in ["admin", "manager"]:
            await websocket.close(code=4003, reason="Unauthorized admin access")
            return

    await manager.connect_admin(websocket)
    try:
        while True:
            # Keep connection alive & handle incoming pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)
    except Exception as e:
        logger.error(f"WebSocket error in admin connection: {e}")
        manager.disconnect_admin(websocket)

@router.websocket("/ws/public")
async def websocket_public_endpoint(websocket: WebSocket):
    await manager.connect_public(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect_public(websocket)
    except Exception as e:
        logger.error(f"WebSocket error in public connection: {e}")
        manager.disconnect_public(websocket)

@router.websocket("/ws/reservation/{booking_reference}")
async def websocket_reservation_endpoint(websocket: WebSocket, booking_reference: str):
    clean_ref = booking_reference.strip().upper()
    await manager.connect_reservation(clean_ref, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect_reservation(clean_ref, websocket)
    except Exception as e:
        logger.error(f"WebSocket error in reservation connection for {clean_ref}: {e}")
        manager.disconnect_reservation(clean_ref, websocket)
