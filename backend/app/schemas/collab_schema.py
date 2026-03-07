"""
Pydantic schemas for Collaboration Sessions.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ── Request Schemas ──


class CollabSessionCreate(BaseModel):
    workflow_id: UUID
    name: Optional[str] = "Collaboration Session"
    username: str = Field(..., min_length=1, max_length=255)


class CollabJoinRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=255)
    color: Optional[str] = "#3b82f6"


class CollabLeaveRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=255)


# ── Response Schemas ──


class CollabMemberResponse(BaseModel):
    id: UUID
    username: str
    color: str
    is_online: bool
    joined_at: datetime
    last_seen_at: datetime

    model_config = {"from_attributes": True}


class CollabSessionResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    name: str
    invite_code: str
    created_by: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    members: List[CollabMemberResponse] = []

    model_config = {"from_attributes": True}


class CollabSessionListResponse(BaseModel):
    sessions: List[CollabSessionResponse]
    total: int
