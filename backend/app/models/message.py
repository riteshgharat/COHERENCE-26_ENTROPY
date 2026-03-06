"""
SQLAlchemy ORM model for Messages.
Tracks every outbound (and reply) message per lead.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class MessageChannel(str, enum.Enum):
    EMAIL = "email"
    LINKEDIN = "linkedin"
    WHATSAPP = "whatsapp"


class MessageStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    REPLIED = "replied"


class MessageDirection(str, enum.Enum):
    OUTBOUND = "outbound"
    INBOUND = "inbound"


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    workflow_execution_id = Column(
        UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=True
    )

    channel = Column(SAEnum(MessageChannel, name="message_channel"), nullable=False)
    direction = Column(
        SAEnum(MessageDirection, name="message_direction"),
        default=MessageDirection.OUTBOUND,
        nullable=False,
    )
    status = Column(
        SAEnum(MessageStatus, name="message_status"),
        default=MessageStatus.PENDING,
        nullable=False,
    )

    subject = Column(String(512), nullable=True)
    body = Column(Text, nullable=False)
    error_detail = Column(Text, nullable=True)

    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lead = relationship("Lead", back_populates="messages")
    workflow_execution = relationship("WorkflowExecution", back_populates="messages")

    def __repr__(self):
        return f"<Message {self.channel} → {self.lead_id} [{self.status}]>"
