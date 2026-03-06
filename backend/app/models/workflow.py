"""
SQLAlchemy ORM model for Workflows.
Stores React-Flow-compatible workflow JSON definitions.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum as SAEnum, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class WorkflowStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # React Flow JSON – nodes & edges
    flow_data = Column(JSON, nullable=False)

    status = Column(
        SAEnum(WorkflowStatus, name="workflow_status", create_constraint=True),
        default=WorkflowStatus.DRAFT,
        nullable=False,
    )

    # Execution tracking
    current_node_index = Column(Integer, default=0)
    total_leads_processed = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    executions = relationship(
        "WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Workflow {self.name} [{self.status}]>"
