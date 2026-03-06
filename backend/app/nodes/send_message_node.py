"""
Send Message Node – dispatches all generated messages through the selected channel.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.message import MessageChannel
from app.services.message_service import send_message
from app.utils.logger import get_logger

log = get_logger("node.send_message")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Send all messages accumulated in context['messages'] through the
    channel specified in context['channel'].
    """
    channel_str = context.get("channel", "email")
    channel = MessageChannel(channel_str)
    messages = context.get("messages", [])
    execution_id = context.get("execution_id")

    sent_count = 0
    failed_count = 0

    for msg_data in messages:
        try:
            result = await send_message(
                db=db,
                lead_id=msg_data["lead_id"],
                channel=channel,
                body=msg_data["body"],
                subject=msg_data.get("subject"),
                workflow_execution_id=execution_id,
            )
            if result.status.value == "sent":
                sent_count += 1
            else:
                failed_count += 1
        except Exception as e:
            failed_count += 1
            log.error(f"Failed to send message to lead {msg_data['lead_id']}: {e}")

    context["sent_count"] = sent_count
    context["failed_count"] = failed_count
    log.info(f"Send Message Node: sent={sent_count}, failed={failed_count}")
    return context
