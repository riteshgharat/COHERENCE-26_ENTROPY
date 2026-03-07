"""
Collaboration API – create/join/leave collab sessions + live save WebSocket.
"""

import secrets
from uuid import UUID
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.collab import CollabSession, CollabMember
from app.models.workflow import Workflow
from app.schemas.collab_schema import (
    CollabSessionCreate,
    CollabJoinRequest,
    CollabLeaveRequest,
    CollabSessionResponse,
    CollabSessionListResponse,
)
from app.utils.logger import get_logger

router = APIRouter(prefix="/collab", tags=["Collaboration"])
log = get_logger("api.collab")


# ── In-memory WebSocket connection store ──

_ws_rooms: dict[str, set[WebSocket]] = {}


async def _broadcast_to_room(room: str, message: dict, exclude: WebSocket | None = None):
    """Send a JSON message to all WebSocket clients in a room."""
    import json

    conns = _ws_rooms.get(room, set())
    payload = json.dumps(message)
    dead = []
    for ws in conns:
        if ws is exclude:
            continue
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        conns.discard(ws)


# ── REST Endpoints ──


@router.post("/sessions", response_model=CollabSessionResponse, status_code=201)
def create_session(payload: CollabSessionCreate, db: Session = Depends(get_db)):
    """Create a new collaboration session for a workflow."""
    wf = db.query(Workflow).filter(Workflow.id == payload.workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    invite_code = secrets.token_urlsafe(16)

    session = CollabSession(
        workflow_id=payload.workflow_id,
        name=payload.name or f"Collab on {wf.name}",
        invite_code=invite_code,
        created_by=payload.username,
    )
    db.add(session)
    db.flush()

    # Auto-add creator as first member
    member = CollabMember(
        session_id=session.id,
        username=payload.username,
        color="#3b82f6",
        is_online=True,
    )
    db.add(member)
    db.commit()
    db.refresh(session)

    log.info(f"Created collab session '{session.name}' for workflow {wf.id}")
    return session


@router.get("/sessions/by-workflow/{workflow_id}", response_model=CollabSessionListResponse)
def get_sessions_for_workflow(workflow_id: UUID, db: Session = Depends(get_db)):
    """List all active collab sessions for a workflow."""
    sessions = (
        db.query(CollabSession)
        .filter(CollabSession.workflow_id == workflow_id, CollabSession.is_active == True)
        .all()
    )
    return CollabSessionListResponse(sessions=sessions, total=len(sessions))


@router.get("/sessions/{session_id}", response_model=CollabSessionResponse)
def get_session(session_id: UUID, db: Session = Depends(get_db)):
    """Get a specific collab session."""
    session = db.query(CollabSession).filter(CollabSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/join/{invite_code}", response_model=CollabSessionResponse)
def get_session_by_invite(invite_code: str, db: Session = Depends(get_db)):
    """Look up a session by invite code."""
    session = (
        db.query(CollabSession)
        .filter(CollabSession.invite_code == invite_code, CollabSession.is_active == True)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Invalid or expired invite code")
    return session


@router.post("/sessions/{session_id}/join", response_model=CollabSessionResponse)
def join_session(session_id: UUID, payload: CollabJoinRequest, db: Session = Depends(get_db)):
    """Join an existing collab session."""
    session = db.query(CollabSession).filter(CollabSession.id == session_id).first()
    if not session or not session.is_active:
        raise HTTPException(status_code=404, detail="Session not found or inactive")

    existing = (
        db.query(CollabMember)
        .filter(CollabMember.session_id == session_id, CollabMember.username == payload.username)
        .first()
    )
    if existing:
        existing.is_online = True
        existing.last_seen_at = datetime.utcnow()
        if payload.color:
            existing.color = payload.color
    else:
        member = CollabMember(
            session_id=session_id,
            username=payload.username,
            color=payload.color or "#3b82f6",
            is_online=True,
        )
        db.add(member)

    db.commit()
    db.refresh(session)
    log.info(f"User '{payload.username}' joined session {session_id}")
    return session


@router.post("/sessions/{session_id}/leave", response_model=CollabSessionResponse)
def leave_session(session_id: UUID, payload: CollabLeaveRequest, db: Session = Depends(get_db)):
    """Mark a user as offline in a session."""
    member = (
        db.query(CollabMember)
        .filter(CollabMember.session_id == session_id, CollabMember.username == payload.username)
        .first()
    )
    if member:
        member.is_online = False
        db.commit()

    session = db.query(CollabSession).filter(CollabSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.refresh(session)
    return session


@router.delete("/sessions/{session_id}", status_code=204)
def end_session(session_id: UUID, db: Session = Depends(get_db)):
    """End (deactivate) a collaboration session."""
    session = db.query(CollabSession).filter(CollabSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_active = False
    db.commit()


# ── WebSocket for Live Workflow Saves ──


@router.websocket("/ws/{workflow_id}")
async def collab_websocket(websocket: WebSocket, workflow_id: str):
    """
    WebSocket endpoint for live workflow save notifications.
    When any collaborator saves, the update is broadcast to all others.
    """
    await websocket.accept()
    room = f"collab-{workflow_id}"

    if room not in _ws_rooms:
        _ws_rooms[room] = set()
    _ws_rooms[room].add(websocket)

    log.info(f"WebSocket joined room {room}")

    try:
        while True:
            data = await websocket.receive_json()

            # Handle different message types
            msg_type = data.get("type")

            if msg_type == "workflow_save":
                # A user saved — broadcast to all other clients
                await _broadcast_to_room(
                    room,
                    {
                        "type": "workflow_updated",
                        "workflow_id": workflow_id,
                        "flow_data": data.get("flow_data"),
                        "saved_by": data.get("username", "unknown"),
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                    exclude=websocket,
                )

            elif msg_type == "user_joined":
                await _broadcast_to_room(
                    room,
                    {
                        "type": "user_joined",
                        "username": data.get("username"),
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                    exclude=websocket,
                )

            elif msg_type == "user_left":
                await _broadcast_to_room(
                    room,
                    {
                        "type": "user_left",
                        "username": data.get("username"),
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                    exclude=websocket,
                )

            elif msg_type == "activity":
                # Activity log: "User X added node", "User Y deleted edge"
                await _broadcast_to_room(
                    room,
                    {
                        "type": "activity",
                        "username": data.get("username"),
                        "action": data.get("action"),
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                    exclude=websocket,
                )

    except WebSocketDisconnect:
        log.info(f"WebSocket left room {room}")
    except Exception as e:
        log.error(f"WebSocket error in room {room}: {e}")
    finally:
        _ws_rooms.get(room, set()).discard(websocket)
        if room in _ws_rooms and not _ws_rooms[room]:
            del _ws_rooms[room]
