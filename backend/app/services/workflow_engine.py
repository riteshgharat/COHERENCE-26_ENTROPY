"""
Workflow Engine – traverses workflow nodes and executes them in sequence.
This is the heart of the automation system.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models import (
    Workflow,
    WorkflowStatus,
    WorkflowExecution,
    ExecutionStatus,
    Lead,
)
from app.nodes import NODE_REGISTRY
from app.utils.logger import get_logger

log = get_logger("workflow_engine")


class WorkflowEngine:
    """
    Executes a workflow by walking through its nodes in topological order.
    Each node receives a shared `context` dict that accumulates state.
    """

    def __init__(self, db: Session):
        self.db = db

    async def execute(
        self,
        workflow_id,
        lead_ids: Optional[list] = None,
    ) -> WorkflowExecution:
        """
        Main entry point – runs the full workflow for a set of leads.
        """
        workflow = self.db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")

        # Create execution record
        execution = WorkflowExecution(
            workflow_id=workflow.id,
            status=ExecutionStatus.RUNNING,
            started_at=datetime.utcnow(),
            context={},
        )
        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)

        log.info(f"Starting execution {execution.id} for workflow '{workflow.name}'")

        # Resolve leads
        if lead_ids:
            leads = self.db.query(Lead).filter(Lead.id.in_(lead_ids)).all()
        else:
            leads = self.db.query(Lead).all()

        # Build ordered node list from flow_data
        flow = workflow.flow_data
        nodes = flow.get("nodes", [])
        edges = flow.get("edges", [])
        ordered_nodes = self._topological_sort(nodes, edges)

        context: Dict[str, Any] = {
            "workflow_id": str(workflow.id),
            "execution_id": str(execution.id),
            "leads": [self._lead_to_dict(l) for l in leads],
            "lead_ids": [str(l.id) for l in leads],
            "messages": [],
            "channel": None,
            "errors": [],
        }

        try:
            for node_def in ordered_nodes:
                node_type = node_def.get("type")
                node_data = node_def.get("data", {})
                node_id = node_def.get("id")

                execution.current_node_id = node_id
                self.db.commit()

                handler = NODE_REGISTRY.get(node_type)
                if not handler:
                    log.warning(f"No handler for node type '{node_type}' – skipping")
                    continue

                log.info(f"Executing node {node_id} ({node_type})")
                context = await handler(context, node_data, self.db)

            # Mark completed
            execution.status = ExecutionStatus.COMPLETED
            execution.leads_processed = len(leads)
            execution.messages_sent = len(context.get("messages", []))
            execution.completed_at = datetime.utcnow()
            execution.context = context

            workflow.status = WorkflowStatus.COMPLETED
            workflow.total_leads_processed = len(leads)

        except Exception as e:
            log.error(f"Workflow execution failed: {e}")
            execution.status = ExecutionStatus.FAILED
            execution.errors_count += 1
            execution.context = {**context, "fatal_error": str(e)}
            workflow.status = WorkflowStatus.FAILED

        self.db.commit()
        self.db.refresh(execution)
        log.info(f"Execution {execution.id} finished with status {execution.status}")
        return execution

    # ── Helpers ──

    def _topological_sort(self, nodes: list, edges: list) -> list:
        """
        Simple topological sort using edges. Falls back to insertion order
        if no edges are provided (linear pipeline).
        """
        if not edges:
            return nodes

        adjacency: Dict[str, list] = {n["id"]: [] for n in nodes}
        in_degree: Dict[str, int] = {n["id"]: 0 for n in nodes}
        node_map = {n["id"]: n for n in nodes}

        for edge in edges:
            src, tgt = edge.get("source"), edge.get("target")
            if src in adjacency:
                adjacency[src].append(tgt)
                in_degree[tgt] = in_degree.get(tgt, 0) + 1

        queue = [nid for nid, deg in in_degree.items() if deg == 0]
        ordered = []
        while queue:
            nid = queue.pop(0)
            ordered.append(node_map[nid])
            for neighbour in adjacency.get(nid, []):
                in_degree[neighbour] -= 1
                if in_degree[neighbour] == 0:
                    queue.append(neighbour)

        return ordered

    @staticmethod
    def _lead_to_dict(lead: Lead) -> dict:
        return {
            "id": str(lead.id),
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "company": lead.company,
            "industry": lead.industry,
            "linkedin_url": lead.linkedin_url,
            "title": lead.title,
            "location": lead.location,
            "extra_data": lead.extra_data or {},
        }
