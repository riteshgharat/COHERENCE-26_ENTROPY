"""
Phase 1 Tests – AI API (message preview).
"""


def test_ai_preview_message(client):
    resp = client.post(
        "/api/v1/ai/preview-message",
        json={
            "lead_data": {
                "name": "John",
                "company": "TechCorp",
                "industry": "SaaS",
                "title": "CTO",
            },
            "tone": "casual founder",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "message" in data
    assert len(data["message"]) > 10  # Should generate a real message


def test_ai_preview_fallback(client):
    """Without API keys, the fallback template should still produce output."""
    resp = client.post(
        "/api/v1/ai/preview-message",
        json={
            "lead_data": {"name": "Alice", "company": "AliceCo"},
        },
    )
    assert resp.status_code == 200
    assert "Alice" in resp.json()["message"]


def test_ai_generate_workflow_stub(client):
    resp = client.post(
        "/api/v1/ai/generate-workflow",
        json={
            "prompt": "Generate outreach workflow for SaaS founders",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "nodes" in data
    assert len(data["nodes"]) > 0
