"""
Analytics Node – logs node-level events or custom metrics in the context.
Phase 3 feature.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger

log = get_logger("node.analytics")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Records a specific metric or event inside the execution context
    and logs it for observability.
    """
    metric_name = node_data.get("metric_name", "custom_event")

    log.info(f"Analytics Node triggered - Recording metric: {metric_name}")

    if "analytics_events" not in context:
        context["analytics_events"] = []

    context["analytics_events"].append(
        {
            "metric": metric_name,
            "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            "leads_in_pipeline": len(context.get("leads", [])),
        }
    )

    return context
