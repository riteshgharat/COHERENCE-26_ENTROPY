"""
SQLAlchemy ORM model for Workflow Executions.
One execution = one run of a workflow, possibly across many leads.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    JSON,
    Integer,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ExecutionStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)

    status = Column(
        SAEnum(ExecutionStatus, name="execution_status"),
        default=ExecutionStatus.QUEUED,
        nullable=False,
    )

    # Per-execution context – carries state across nodes
    context = Column(JSON, default=dict)

    current_node_id = Column(String(100), nullable=True)
    leads_processed = Column(Integer, default=0)
    messages_sent = Column(Integer, default=0)
    errors_count = Column(Integer, default=0)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resume_at = Column(DateTime, nullable=True)

    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    messages = relationship(
        "Message", back_populates="workflow_execution", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<WorkflowExecution {self.id} [{self.status}]>"
