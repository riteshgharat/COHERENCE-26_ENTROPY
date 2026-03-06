"""
Check Reply Node – detects whether leads have replied.
Phase 2: will poll inboxes and classify replies with AI.
Phase 1: stub pass-through.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger
from app.models.lead import Lead, LeadStatus

log = get_logger("node.check_reply")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Checks if leads have replied.
    Leads that replied are removed from the context so they don't get follow-ups.
    """
    leads = context.get("leads", [])
    if not leads:
        return context

    lead_ids = [l["id"] for l in leads]
    db_leads = db.query(Lead).filter(Lead.id.in_(lead_ids)).all()

    # Map lead_id to boolean: has_replied
    replied_map = {
        str(l.id): l.status
        in (
            LeadStatus.REPLIED,
            LeadStatus.INTERESTED,
            LeadStatus.NOT_INTERESTED,
            LeadStatus.CONVERTED,
        )
        for l in db_leads
    }

    active_leads = []
    replied_count = 0
    for lead in leads:
        if replied_map.get(str(lead["id"])):
            replied_count += 1
        else:
            active_leads.append(lead)

    log.info(
        f"Check Reply Node: {replied_count} leads replied and dropped, {len(active_leads)} continuing flow."
    )
    context["leads"] = active_leads

    return context
