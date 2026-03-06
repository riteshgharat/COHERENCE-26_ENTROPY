import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.lead import Lead, LeadStatus
from app.models.message import Message, MessageChannel, MessageStatus, MessageDirection

client = TestClient(app)


def test_dashboard_analytics_aggregation(db_session):
    """
    Test the Analytics dashboard to ensure it correctly hits the DB
    and aggregates lead conversion, execution metrics, and messages.
    """
    import uuid

    # Create test lead manually to avoid fixture dependency issues
    test_lead = Lead(
        name="Analytics Test Lead",
        email="analytics@example.com",
    )
    db_session.add(test_lead)
    db_session.commit()
    db_session.refresh(test_lead)

    # Create first message (Sent)
    msg1 = Message(
        lead_id=test_lead.id,
        channel=MessageChannel.EMAIL,
        direction=MessageDirection.OUTBOUND,
        status=MessageStatus.SENT,
        body="Hello there!",
    )
    db_session.add(msg1)

    # Create second message (Replied)
    msg2 = Message(
        lead_id=test_lead.id,
        channel=MessageChannel.EMAIL,
        direction=MessageDirection.INBOUND,
        status=MessageStatus.REPLIED,
        body="Yes, let's talk!",
    )
    db_session.add(msg2)
    db_session.commit()

    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200

    data = response.json()
    assert data["leads"] >= 1
    assert data["replies"] >= 1
    assert data["messages_sent"] >= 1

    assert data["conversion_rate"] > 0.0

    assert "channel_performance" in data
    assert "email" in data["channel_performance"]
    assert "sent" in data["channel_performance"]["email"]
    assert "replied" in data["channel_performance"]["email"]
