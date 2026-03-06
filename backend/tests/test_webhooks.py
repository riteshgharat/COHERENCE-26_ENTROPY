import pytest
from uuid import uuid4
from fastapi.testclient import TestClient

from app.main import app
from app.models.lead import LeadStatus
from app.models.message import MessageChannel, MessageDirection, MessageStatus

client = TestClient(app)


def test_receive_reply_success(db_session, test_lead):
    """
    Test simulating an inbound reply from a lead.
    Should create a Message and update Lead status to REPLIED.
    """
    assert test_lead.status == LeadStatus.NEW

    payload = {
        "lead_id": str(test_lead.id),
        "channel": "email",
        "body": "Yes, I am interested. Let's schedule a call.",
    }

    response = client.post("/api/v1/webhooks/reply", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "message_id" in data

    # Verify lead status was updated
    db_session.refresh(test_lead)
    assert test_lead.status == LeadStatus.REPLIED

    # Verify message was created
    from app.models.message import Message

    msg = db_session.query(Message).filter(Message.id == data["message_id"]).first()
    assert msg is not None
    assert msg.direction == MessageDirection.INBOUND
    assert msg.channel == MessageChannel.EMAIL
    assert msg.body == payload["body"]


def test_receive_reply_lead_not_found():
    """
    Test receiving a reply for a non-existent lead.
    """
    payload = {
        "lead_id": str(uuid4()),
        "channel": "linkedin",
        "body": "Not interested.",
    }

    response = client.post("/api/v1/webhooks/reply", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Lead not found"
