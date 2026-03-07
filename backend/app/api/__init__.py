"""
API package – re-exports routers.
"""

from app.api.leads import router as leads_router
from app.api.workflows import router as workflows_router
from app.api.channels import router as channels_router
from app.api.analytics import router as analytics_router
from app.api.ai import router as ai_router
from app.api.campaigns import router as campaigns_router
from app.api.collab import router as collab_router

__all__ = [
    "leads_router",
    "workflows_router",
    "channels_router",
    "analytics_router",
    "ai_router",
    "campaigns_router",
    "collab_router",
]
