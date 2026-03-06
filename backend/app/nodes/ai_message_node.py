"""
AI Message Node – generates personalised outreach messages for each lead.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.services.ai_service import generate_message
from app.utils.logger import get_logger

log = get_logger("node.ai_message")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    For every lead in context, generate a personalised message using the AI service.
    Stores results in context['messages'] as a list of {lead_id, body, subject}.
    """
    tone = node_data.get("tone", "professional and friendly")
    sample_message = node_data.get("sample_message", "")
    subject_template = node_data.get("subject", "Quick question, {name}")
    provider = node_data.get("provider", "groq")

    leads = context.get("leads", [])
    generated_messages = []

    for lead in leads:
        body = await generate_message(
            lead_data=lead,
            tone=tone,
            sample_message=sample_message,
            provider=provider,
        )
        subject = subject_template.format(**{k: v or "" for k, v in lead.items()})

        generated_messages.append(
            {
                "lead_id": lead["id"],
                "subject": subject,
                "body": body,
            }
        )
        log.debug(f"Generated message for {lead.get('name')}")

    context["messages"] = generated_messages
    log.info(f"AI Message Node: generated {len(generated_messages)} messages")
    return context
