"""
Start Node – entry point for every workflow.
Validates the context and marks execution as started.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger

log = get_logger("node.start")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """Validate that we have leads to process and mark workflow as started."""
    leads = context.get("leads", [])
    if not leads:
        raise ValueError("No leads found in context – cannot start workflow")

    log.info(f"Workflow started with {len(leads)} leads")
    context["status"] = "started"
    return context
