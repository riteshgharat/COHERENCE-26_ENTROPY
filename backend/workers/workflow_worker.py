"""
Workflow Worker – Celery task to execute a workflow asynchronously.
"""

import asyncio
from workers.celery_app import celery_app
from app.database import SessionLocal
from app.services.workflow_engine import WorkflowEngine
from app.utils.logger import get_logger

log = get_logger("worker.workflow")


@celery_app.task(bind=True, name="workflow.execute", max_retries=2)
def execute_workflow_task(self, workflow_id: str, lead_ids: list = None):
    """
    Celery task that runs a workflow. Called when a user starts a campaign.
    """
    log.info(f"[Task {self.request.id}] Starting workflow {workflow_id}")
    db = SessionLocal()

    try:
        engine = WorkflowEngine(db)
        # Run async execute in sync celery context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        execution = loop.run_until_complete(engine.execute(workflow_id, lead_ids))
        loop.close()

        log.info(
            f"[Task {self.request.id}] Workflow {workflow_id} completed: {execution.status}"
        )
        return {
            "execution_id": str(execution.id),
            "status": execution.status.value,
        }
    except Exception as exc:
        log.error(f"[Task {self.request.id}] Workflow failed: {exc}")
        raise self.retry(exc=exc, countdown=30)
    finally:
        db.close()
