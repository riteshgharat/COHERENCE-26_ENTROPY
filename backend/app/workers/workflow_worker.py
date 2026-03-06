"""
Workflow Worker – Celery task to execute a workflow asynchronously.
"""

import asyncio
from app.workers.celery_app import celery_app
from app.database import SessionLocal
from app.services.workflow_engine import WorkflowEngine
from app.utils.logger import get_logger

log = get_logger("worker.workflow")


@celery_app.task(bind=True, name="workflow.execute", max_retries=2)
def execute_workflow_task(self, workflow_id: str, execution_id: str):
    """
    Celery task that runs a workflow starting from the beginning.
    """
    log.info(
        f"[Task {self.request.id}] Starting execution {execution_id} for workflow {workflow_id}"
    )
    db = SessionLocal()

    try:
        engine = WorkflowEngine(db)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        execution = loop.run_until_complete(
            engine.execute(workflow_id=workflow_id, execution_id=execution_id)
        )
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


@celery_app.task(bind=True, name="workflow.resume", max_retries=2)
def resume_workflow_task(self, execution_id: str):
    """
    Celery task that resumes a paused workflow execution.
    """
    log.info(f"[Task {self.request.id}] Resuming execution {execution_id}")
    db = SessionLocal()

    try:
        from app.models import WorkflowExecution

        exec_record = (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.id == execution_id)
            .first()
        )
        if not exec_record:
            log.error(f"Execution {execution_id} not found")
            return

        workflow_id = str(exec_record.workflow_id)

        engine = WorkflowEngine(db)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        execution = loop.run_until_complete(
            engine.execute(workflow_id=workflow_id, execution_id=execution_id)
        )
        loop.close()

        return {
            "execution_id": str(execution.id),
            "status": execution.status.value,
        }
    except Exception as exc:
        log.error(f"[Task {self.request.id}] Resume failed: {exc}")
        raise self.retry(exc=exc, countdown=30)
    finally:
        db.close()
