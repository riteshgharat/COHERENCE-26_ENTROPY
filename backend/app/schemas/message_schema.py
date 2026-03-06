"""
Pydantic schemas for Message & Channel related endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.message import MessageChannel, MessageStatus, MessageDirection


class MessageResponse(BaseModel):
    id: UUID
    lead_id: UUID
    channel: MessageChannel
    direction: MessageDirection
    status: MessageStatus
    subject: Optional[str] = None
    body: str
    error_detail: Optional[str] = None
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChannelConnectRequest(BaseModel):
    channel: MessageChannel
    credentials: dict = Field(..., description="Channel-specific auth payload")


class ChannelStatusResponse(BaseModel):
    channel: MessageChannel
    connected: bool
    daily_sent: int
    daily_limit: int
