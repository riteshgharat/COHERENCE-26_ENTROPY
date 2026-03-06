import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_generate_agentic_workflow():
    """
    Test the Phase 3 agentic workflow generator endpoint.
    Should return a valid JSON structure representing a React Flow graph.
    """
    payload = {
        "prompt": "Create a 2-step email sequence",
        "provider": "template_fallback",  # Force the template fallback to ensure reliable tests without API calls
    }

    response = client.post("/api/v1/ai/generate-workflow", json=payload)

    assert response.status_code == 200
    data = response.json()

    # Assert nodes and edges exist
    assert "nodes" in data
    assert "edges" in data

    # Check start node
    start_nodes = [n for n in data["nodes"] if n.get("type") == "start"]
    assert len(start_nodes) >= 1

    assert len(data["nodes"]) > 1
    assert len(data["edges"]) >= 1

    # Validate edge structure
    for edge in data["edges"]:
        assert "source" in edge
        assert "target" in edge
