"""
Pydantic schemas for Campaign request / response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.campaign import CampaignStatus


class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    workflow_id: UUID
    lead_ids: Optional[List[UUID]] = None  # None = all leads


class CampaignResponse(BaseModel):
    id: UUID
    name: str
    workflow_id: UUID
    status: CampaignStatus
    leads_total: int
    messages_sent: int
    messages_opened: int
    replies_count: int
    progress: int
    reply_rate: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CampaignListResponse(BaseModel):
    campaigns: List[CampaignResponse]
    total: int
