"""
AI API – agentic workflow generation and message preview.
Phase 1: message preview. Phase 3: workflow generation.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
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
    Agentic workflow generation from a natural language prompt.
    Returns React Flow compatible JSON {nodes, edges, name}.
    """
    log.info(f"Generating workflow | provider={payload.provider} | prompt: {payload.prompt[:120]}")
    try:
        workflow_json = await generate_agentic_workflow(
            prompt=payload.prompt, provider=payload.provider
        )
        return workflow_json
    except ValueError as exc:
        # Config / key errors — tell the user exactly what to fix
        log.error(f"Workflow generation config error: {exc}")
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        # LLM / parse errors
        log.error(f"Workflow generation runtime error: {exc}")
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        log.error(f"Workflow generation unexpected error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")


# ── AI Chat / Campaign Analyst ──


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    provider: Optional[str] = "groq"


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(payload: ChatRequest, db: Session = Depends(get_db)):
    """AI campaign analyst chat – answers questions about outreach performance."""
    from app.services.analytics_service import get_dashboard_stats

    stats = get_dashboard_stats(db)

    system_prompt = (
        "You are an AI campaign analytics assistant for OutflowAI, an outreach automation platform.\n"
        "Answer questions about campaign performance, suggest improvements, and help optimize outreach.\n"
        "Be concise, data-driven, and actionable. Use markdown formatting.\n\n"
        f"Current campaign data:\n"
        f"- Total leads: {stats['leads']}\n"
        f"- Messages sent: {stats['messages_sent']}\n"
        f"- Messages failed: {stats['messages_failed']}\n"
        f"- Replies: {stats['replies']}\n"
        f"- Response rate: {stats['conversion_rate']}%\n"
        f"- Total campaign executions: {stats['total_executions']}\n"
        f"- Completed executions: {stats['completed_executions']}\n"
        f"- Channel performance: {stats['channel_performance']}\n"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for m in payload.messages:
        messages.append({"role": m.role, "content": m.content})

    try:
        from app.config import get_settings
        settings = get_settings()

        if payload.provider == "groq" and settings.GROQ_API_KEY:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=500,
            )
            return ChatResponse(reply=response.choices[0].message.content.strip())
        elif payload.provider == "gemini" and settings.GEMINI_API_KEY:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-pro")
            combined = system_prompt + "\n\n"
            for m in payload.messages:
                combined += f"{m.role}: {m.content}\n"
            response = model.generate_content(combined)
            return ChatResponse(reply=response.text.strip())
        else:
            return ChatResponse(
                reply=f"Here's a summary of your campaign data:\n\n"
                f"- **{stats['leads']}** total leads\n"
                f"- **{stats['messages_sent']}** messages sent\n"
                f"- **{stats['replies']}** replies received\n"
                f"- **{stats['conversion_rate']}%** response rate\n\n"
                f"Configure a Groq or Gemini API key for AI-powered insights."
            )
    except Exception as e:
        log.error(f"AI chat failed: {e}")
        return ChatResponse(
            reply=f"I encountered an error processing your request. "
            f"Here are your current stats: {stats['leads']} leads, "
            f"{stats['messages_sent']} sent, {stats['conversion_rate']}% response rate."
        )
