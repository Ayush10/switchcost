"""
WebSocket endpoint for streaming live analysis progress to the frontend.
"""
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

ws_router = APIRouter()

# Active WebSocket connections per analysis
connections: dict[str, list[WebSocket]] = {}


async def broadcast_to_task(task_id: str, message: dict):
    """Send a message to all WebSocket connections watching a task/analysis."""
    if task_id in connections:
        dead = []
        for ws in connections[task_id]:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            connections[task_id].remove(ws)


@ws_router.websocket("/ws/analyze/{analysis_id}")
async def analysis_websocket(websocket: WebSocket, analysis_id: str):
    """WebSocket endpoint for live analysis progress streaming."""
    await websocket.accept()

    if analysis_id not in connections:
        connections[analysis_id] = []
    connections[analysis_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event": "pong"})
    except WebSocketDisconnect:
        if analysis_id in connections:
            connections[analysis_id].remove(websocket)
            if not connections[analysis_id]:
                del connections[analysis_id]
