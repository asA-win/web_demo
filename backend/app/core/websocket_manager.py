import json
import logging
from typing import Dict, List, Set
from fastapi import WebSocket

logger = logging.getLogger("websocket_manager")

class ConnectionManager:
    def __init__(self):
        # Admin sockets
        self.admin_connections: Set[WebSocket] = set()
        # General public sockets (for menu changes, etc.)
        self.public_connections: Set[WebSocket] = set()
        # Reservation-specific sockets: reference -> set of WebSockets
        self.reservation_connections: Dict[str, Set[WebSocket]] = {}

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admin_connections.add(websocket)
        logger.info(f"Admin WebSocket connected. Total admins: {len(self.admin_connections)}")

    def disconnect_admin(self, websocket: WebSocket):
        self.admin_connections.discard(websocket)
        logger.info(f"Admin WebSocket disconnected. Total admins: {len(self.admin_connections)}")

    async def connect_public(self, websocket: WebSocket):
        await websocket.accept()
        self.public_connections.add(websocket)
        logger.info(f"Public WebSocket connected. Total public: {len(self.public_connections)}")

    def disconnect_public(self, websocket: WebSocket):
        self.public_connections.discard(websocket)
        logger.info(f"Public WebSocket disconnected. Total public: {len(self.public_connections)}")

    async def connect_reservation(self, booking_ref: str, websocket: WebSocket):
        await websocket.accept()
        if booking_ref not in self.reservation_connections:
            self.reservation_connections[booking_ref] = set()
        self.reservation_connections[booking_ref].add(websocket)
        logger.info(f"Reservation WebSocket connected for {booking_ref}")

    def disconnect_reservation(self, booking_ref: str, websocket: WebSocket):
        if booking_ref in self.reservation_connections:
            self.reservation_connections[booking_ref].discard(websocket)
            if not self.reservation_connections[booking_ref]:
                del self.reservation_connections[booking_ref]
        logger.info(f"Reservation WebSocket disconnected for {booking_ref}")

    async def broadcast_to_admins(self, event_type: str, data: dict):
        """Send message to all connected admin dashboards."""
        message = json.dumps({"event": event_type, "data": data}, default=str)
        dead_connections = set()
        for conn in list(self.admin_connections):
            try:
                await conn.send_text(message)
            except Exception as e:
                logger.warning(f"Error sending to admin socket: {e}")
                dead_connections.add(conn)
        for dead in dead_connections:
            self.admin_connections.discard(dead)

    async def broadcast_to_public(self, event_type: str, data: dict):
        """Send message to all public clients (e.g., menu update)."""
        message = json.dumps({"event": event_type, "data": data}, default=str)
        dead_connections = set()
        for conn in list(self.public_connections):
            try:
                await conn.send_text(message)
            except Exception as e:
                logger.warning(f"Error sending to public socket: {e}")
                dead_connections.add(conn)
        for dead in dead_connections:
            self.public_connections.discard(dead)

    async def notify_reservation_status(self, booking_ref: str, data: dict):
        """Send update to a specific customer watching their booking."""
        if booking_ref in self.reservation_connections:
            message = json.dumps({"event": "RESERVATION_STATUS_UPDATED", "data": data}, default=str)
            dead_connections = set()
            for conn in list(self.reservation_connections[booking_ref]):
                try:
                    await conn.send_text(message)
                except Exception as e:
                    logger.warning(f"Error sending to reservation socket {booking_ref}: {e}")
                    dead_connections.add(conn)
            for dead in dead_connections:
                self.reservation_connections[booking_ref].discard(dead)

manager = ConnectionManager()
