"""
Lead Import Node – loads leads from context into the workflow pipeline.
In a full flow, this can also trigger a file-based import.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models import Lead
from app.utils.logger import get_logger

log = get_logger("node.lead_import")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Ensure leads are present in context.
    If node_data contains 'source' or 'filter', apply filtering.
    """
    leads = context.get("leads", [])

    # Optional: filter by industry / status from node config
    industry_filter = node_data.get("industry")
    if industry_filter:
        leads = [
            l for l in leads if l.get("industry", "").lower() == industry_filter.lower()
        ]
        log.info(f"Filtered to {len(leads)} leads by industry='{industry_filter}'")

    status_filter = node_data.get("status")
    if status_filter:
        filtered = []
        for lead_dict in leads:
            lead_obj = db.query(Lead).filter(Lead.id == lead_dict["id"]).first()
            if lead_obj and lead_obj.status.value == status_filter:
                filtered.append(lead_dict)
        leads = filtered
        log.info(f"Filtered to {len(leads)} leads by status='{status_filter}'")

    context["leads"] = leads
    log.info(f"Lead Import Node: {len(leads)} leads ready for pipeline")
    return context
