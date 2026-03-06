"""
Pydantic schemas for Workflow request / response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from app.models.workflow import WorkflowStatus


# ── Sub-schemas for React Flow JSON ──


class FlowNode(BaseModel):
    id: str
    type: str
    data: Optional[Dict[str, Any]] = {}
    position: Optional[Dict[str, float]] = {"x": 0, "y": 0}


class FlowEdge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str


class FlowData(BaseModel):
    nodes: List[FlowNode]
    edges: List[FlowEdge] = []


# ── Request Schemas ──


class WorkflowCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    flow_data: FlowData


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    flow_data: Optional[FlowData] = None
    status: Optional[WorkflowStatus] = None


# ── Response Schemas ──


class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    flow_data: Dict[str, Any]
    status: WorkflowStatus
    current_node_index: int
    total_leads_processed: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkflowListResponse(BaseModel):
    workflows: List[WorkflowResponse]
    total: int


class WorkflowExecuteRequest(BaseModel):
    lead_ids: Optional[List[UUID]] = None  # None = all leads


class WorkflowExecuteResponse(BaseModel):
    execution_id: UUID
    workflow_id: UUID
    status: str
    message: str
