import json

import structlog
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = structlog.get_logger()
router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, project_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)
        logger.info("websocket_connected", project_id=project_id)

    def disconnect(self, project_id: str, websocket: WebSocket) -> None:
        if project_id in self.active_connections:
            self.active_connections[project_id].remove(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
        logger.info("websocket_disconnected", project_id=project_id)

    async def broadcast(self, project_id: str, message: dict, exclude: WebSocket | None = None) -> None:
        connections = self.active_connections.get(project_id, [])
        for connection in connections:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except Exception:
                    logger.warning("websocket_send_failed", project_id=project_id)


manager = ConnectionManager()


@router.websocket("/ws/project/{project_id}")
async def project_websocket(websocket: WebSocket, project_id: str) -> None:
    await manager.connect(project_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await manager.broadcast(project_id, message, exclude=websocket)
    except WebSocketDisconnect:
        manager.disconnect(project_id, websocket)
    except Exception as exc:
        logger.error("websocket_error", error=str(exc), project_id=project_id)
        manager.disconnect(project_id, websocket)
