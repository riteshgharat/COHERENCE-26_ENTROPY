"""
SQLAlchemy ORM model for Leads.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum as SAEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    REPLIED = "replied"
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested"
    CONVERTED = "converted"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    industry = Column(String(255), nullable=True)
    linkedin_url = Column(String(512), nullable=True)
    title = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)

    status = Column(
        SAEnum(LeadStatus, name="lead_status", create_constraint=True),
        default=LeadStatus.NEW,
        nullable=False,
    )

    # Flexible extra data from CSV/JSON columns
    extra_data = Column(JSON, default=dict)
    source = Column(String(100), nullable=True)  # csv, xlsx, json, google_sheets

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    messages = relationship(
        "Message", back_populates="lead", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Lead {self.name} ({self.email})>"
