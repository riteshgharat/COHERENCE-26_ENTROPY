"""
SQLAlchemy ORM model for Campaigns.
A campaign links a workflow to a set of leads and tracks execution progress.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Enum as SAEnum,
    JSON,
    ForeignKey,
    Integer,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)

    status = Column(
        SAEnum(CampaignStatus, name="campaign_status"),
        default=CampaignStatus.DRAFT,
        nullable=False,
    )

    # JSON array of lead UUIDs assigned to this campaign
    lead_ids = Column(JSON, default=list)

    # Cached stats (updated after execution)
    leads_total = Column(Integer, default=0)
    messages_sent = Column(Integer, default=0)
    messages_opened = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)

    # Linked execution
    execution_id = Column(UUID(as_uuid=True), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workflow = relationship("Workflow")

    def __repr__(self):
        return f"<Campaign {self.name} [{self.status}]>"

    @property
    def progress(self) -> int:
        if self.leads_total == 0:
            return 0
        return min(100, int((self.messages_sent / self.leads_total) * 100))

    @property
    def reply_rate(self) -> float:
        if self.messages_sent == 0:
            return 0.0
        return round((self.replies_count / self.messages_sent) * 100, 1)
