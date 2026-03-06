"""
Phase 1 Tests – Channels & Analytics API.
"""


def test_channel_status(client):
    resp = client.get("/api/v1/channels/status")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3  # email, linkedin, whatsapp

    channels = {ch["channel"] for ch in data}
    assert "email" in channels
    assert "linkedin" in channels
    assert "whatsapp" in channels


def test_analytics_dashboard_empty(client):
    resp = client.get("/api/v1/analytics/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["leads"] == 0
    assert data["messages_sent"] == 0
    assert data["conversion_rate"] == 0.0


def test_analytics_dashboard_with_data(client):
    """After importing leads, dashboard should reflect the count."""
    client.post("/api/v1/leads/", json={"name": "Analytics Lead 1"})
    client.post("/api/v1/leads/", json={"name": "Analytics Lead 2"})

    resp = client.get("/api/v1/analytics/dashboard")
    data = resp.json()
    assert data["leads"] == 2
