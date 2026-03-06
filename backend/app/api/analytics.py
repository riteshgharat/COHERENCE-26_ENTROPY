"""
Analytics API – campaign dashboard metrics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.analytics_service import get_dashboard_stats
from app.utils.logger import get_logger

router = APIRouter(prefix="/analytics", tags=["Analytics"])
log = get_logger("api.analytics")


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    """Return aggregate campaign statistics."""
    stats = get_dashboard_stats(db)
    return stats
