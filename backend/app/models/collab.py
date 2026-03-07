"""
SQLAlchemy ORM model for Collaboration Sessions.
Tracks who is collaborating on which workflow in real time.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class CollabSession(Base):
    __tablename__ = "collab_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(
        UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(255), nullable=False, default="Collaboration Session")
    invite_code = Column(String(32), unique=True, nullable=False)
    created_by = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True,  nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    workflow = relationship("Workflow", backref="collab_sessions")
    members = relationship(
        "CollabMember", back_populates="session", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<CollabSession {self.name} for workflow {self.workflow_id}>"


class CollabMember(Base):
    __tablename__ = "collab_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True), ForeignKey("collab_sessions.id", ondelete="CASCADE"), nullable=False
    )
    username = Column(String(255), nullable=False)
    color = Column(String(20), nullable=False, default="#3b82f6")
    is_online = Column(Boolean, default=True, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    session = relationship("CollabSession", back_populates="members")

    def __repr__(self):
        return f"<CollabMember {self.username} in session {self.session_id}>"
