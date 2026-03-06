"""
AI Conversation Node – auto-replies on behalf of the user.
Phase 3: full implementation. Phase 1: stub.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.utils.logger import get_logger
from app.models.message import Message, MessageDirection
from app.services.ai_service import generate_conversation_reply
from app.models.lead import LeadStatus

log = get_logger("node.ai_conversation")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Finds leads in the context that have replied, retrieves their inbound message,
    and generates an automated response on behalf of the user.
    """
    leads = context.get("leads", [])
    if not leads:
        return context

    instructions = node_data.get("instructions", "Be polite and suggest a call.")
    channel = context.get("channel", "email")

    if "messages" not in context:
        context["messages"] = {}

    for lead in leads.copy():
        # Only process leads that have replied or shown interest
        if lead.get("status") not in [
            LeadStatus.REPLIED.value,
            LeadStatus.INTERESTED.value,
        ]:
            log.debug(
                f"Lead {lead['id']} has not replied (status={lead.get('status')}), skipping conversation agent."
            )
            continue

        # Look up the conversation history for this lead
        messages = (
            db.query(Message)
            .filter(Message.lead_id == lead["id"])
            .order_by(desc(Message.created_at))
            .all()
        )

        inbound_msg = next(
            (m for m in messages if m.direction == MessageDirection.INBOUND), None
        )
        outbound_msg = next(
            (m for m in messages if m.direction == MessageDirection.OUTBOUND), None
        )

        if not inbound_msg:
            continue

        previous_outbound = (
            outbound_msg.body
            if outbound_msg
            else "No previous outbound message recorded."
        )
        lead_reply = inbound_msg.body

        log.info(f"Generating conversation reply for lead {lead['id']}")

        reply_body = await generate_conversation_reply(
            lead_data=lead,
            previous_outbound=previous_outbound,
            lead_reply=lead_reply,
            instructions=instructions,
        )

        context["messages"][str(lead["id"])] = {
            "body": reply_body,
            "subject": (
                f"Re: {outbound_msg.subject}"
                if outbound_msg and outbound_msg.subject
                else "Following up"
            ),
            "channel": channel,
        }

    return context
