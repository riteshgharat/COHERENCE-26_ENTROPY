"""
Follow-up Node – generates follow-up messages for non-responsive leads.
Phase 2: full implementation. Phase 1: stub.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger
from app.services.ai_service import generate_message

log = get_logger("node.followup")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Follow-up Node: generates a follow-up message using Groq/Gemini AI models
    but structured specifically as a 'bumping the thread' short email.
    """
    leads = context.get("leads", [])
    if not leads:
        log.warning("Follow-up Node: no leads in context")
        return context

    tone = node_data.get("tone", "polite and brief")
    provider = node_data.get("provider", "groq")

    # Clear previous messages in context so send_message sends the follow-up
    new_messages = []

    for lead in leads:
        prompt_instruction = (
            f"Write a short, {tone} follow-up sales email. "
            "Acknowledge that we haven't heard back yet, keep it brief, "
            "and include a clear, non-pushy call to action."
        )

        body = await generate_message(lead, tone=prompt_instruction, provider=provider)
        new_messages.append({"lead_id": lead["id"], "body": body})

    context["messages"] = new_messages
    log.info(f"Follow-up Node: generated {len(new_messages)} follow-ups")
    return context
