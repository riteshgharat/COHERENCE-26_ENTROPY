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


from app.services.ai_service import generate_message, generate_agentic_workflow


class WorkflowGenerateRequest(BaseModel):
    prompt: str
    provider: Optional[str] = "groq"


@router.post("/generate-workflow")
async def generate_workflow(payload: WorkflowGenerateRequest):
    """
    Phase 3: Agentic workflow generation from a natural language prompt.
    Returns React Flow compatible JSON.
    """
    log.info(f"Generating workflow with prompt: {payload.prompt}")
    workflow_json = await generate_agentic_workflow(
        prompt=payload.prompt, provider=payload.provider
    )
    return workflow_json
