"""
Pydantic schemas for Lead request / response validation.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from app.models.lead import LeadStatus


# ── Request Schemas ──


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    linkedin_url: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = {}
    source: Optional[str] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    linkedin_url: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    status: Optional[LeadStatus] = None
    extra_data: Optional[Dict[str, Any]] = None


class LeadImportResponse(BaseModel):
    total_imported: int
    total_skipped: int
    errors: List[str] = []


# ── Response Schemas ──


class LeadResponse(BaseModel):
    id: UUID
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    linkedin_url: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    status: LeadStatus
    extra_data: Dict[str, Any] = {}
    source: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListResponse(BaseModel):
    leads: List[LeadResponse]
    total: int
    page: int
    page_size: int
