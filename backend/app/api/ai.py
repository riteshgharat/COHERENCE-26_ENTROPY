"""
AI API – agentic workflow generation and message preview.
Phase 1: message preview. Phase 3: workflow generation.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.ai_service import generate_message
from app.utils.logger import get_logger

router = APIRouter(prefix="/ai", tags=["AI"])
log = get_logger("api.ai")


class MessagePreviewRequest(BaseModel):
    lead_data: Dict[str, Any]
    tone: Optional[str] = "professional and friendly"
    sample_message: Optional[str] = ""
    provider: Optional[str] = "groq"


class MessagePreviewResponse(BaseModel):
    message: str


@router.post("/preview-message", response_model=MessagePreviewResponse)
async def preview_message(payload: MessagePreviewRequest):
    """Generate a preview outreach message for a lead without sending it."""
    message = await generate_message(
        lead_data=payload.lead_data,
        tone=payload.tone,
        sample_message=payload.sample_message,
        provider=payload.provider,
    )
    return MessagePreviewResponse(message=message)


class WorkflowGenerateRequest(BaseModel):
    prompt: str


@router.post("/generate-workflow")
async def generate_workflow(payload: WorkflowGenerateRequest):
    """
    Phase 3: Agentic workflow generation from a natural language prompt.
    Returns React Flow compatible JSON.
    """
    log.info("Agentic workflow generation is a Phase 3 feature")
    # Stub: return a basic template
    return {
        "nodes": [
            {"id": "1", "type": "start", "data": {}, "position": {"x": 0, "y": 0}},
            {
                "id": "2",
                "type": "lead_import",
                "data": {},
                "position": {"x": 0, "y": 100},
            },
            {
                "id": "3",
                "type": "ai_message",
                "data": {"tone": "professional"},
                "position": {"x": 0, "y": 200},
            },
            {
                "id": "4",
                "type": "channel_select",
                "data": {"channel": "email"},
                "position": {"x": 0, "y": 300},
            },
            {
                "id": "5",
                "type": "send_message",
                "data": {},
                "position": {"x": 0, "y": 400},
            },
        ],
        "edges": [
            {"source": "1", "target": "2"},
            {"source": "2", "target": "3"},
            {"source": "3", "target": "4"},
            {"source": "4", "target": "5"},
        ],
    }
