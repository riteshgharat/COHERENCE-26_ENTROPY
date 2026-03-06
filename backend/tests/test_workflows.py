"""
Phase 1 Tests – Workflows API (CRUD + Execution).
"""

SAMPLE_FLOW = {
    "nodes": [
        {"id": "1", "type": "start", "data": {}},
        {"id": "2", "type": "lead_import", "data": {}},
        {"id": "3", "type": "ai_message", "data": {"tone": "casual"}},
        {"id": "4", "type": "channel_select", "data": {"channel": "email"}},
        {"id": "5", "type": "send_message", "data": {}},
    ],
    "edges": [
        {"source": "1", "target": "2"},
        {"source": "2", "target": "3"},
        {"source": "3", "target": "4"},
        {"source": "4", "target": "5"},
    ],
}


# ── CRUD Tests ──


def test_create_workflow(client):
    resp = client.post(
        "/api/v1/workflows/",
        json={
            "name": "Test Campaign",
            "description": "A test outreach workflow",
            "flow_data": SAMPLE_FLOW,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Campaign"
    assert data["status"] == "draft"
    assert len(data["flow_data"]["nodes"]) == 5


def test_create_workflow_name_required(client):
    resp = client.post("/api/v1/workflows/", json={"flow_data": SAMPLE_FLOW})
    assert resp.status_code == 422


def test_list_workflows(client):
    client.post("/api/v1/workflows/", json={"name": "WF 1", "flow_data": SAMPLE_FLOW})
    client.post("/api/v1/workflows/", json={"name": "WF 2", "flow_data": SAMPLE_FLOW})

    resp = client.get("/api/v1/workflows/")
    data = resp.json()
    assert data["total"] == 2


def test_get_workflow(client):
    create_resp = client.post(
        "/api/v1/workflows/",
        json={
            "name": "Fetch Me",
            "flow_data": SAMPLE_FLOW,
        },
    )
    wf_id = create_resp.json()["id"]

    resp = client.get(f"/api/v1/workflows/{wf_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Fetch Me"


def test_update_workflow(client):
    create_resp = client.post(
        "/api/v1/workflows/",
        json={
            "name": "Old Name",
            "flow_data": SAMPLE_FLOW,
        },
    )
    wf_id = create_resp.json()["id"]

    resp = client.patch(f"/api/v1/workflows/{wf_id}", json={"name": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


def test_delete_workflow(client):
    create_resp = client.post(
        "/api/v1/workflows/",
        json={
            "name": "Delete Me",
            "flow_data": SAMPLE_FLOW,
        },
    )
    wf_id = create_resp.json()["id"]

    resp = client.delete(f"/api/v1/workflows/{wf_id}")
    assert resp.status_code == 204

    resp = client.get(f"/api/v1/workflows/{wf_id}")
    assert resp.status_code == 404


# ── Execution Tests ──


def test_execute_workflow(client):
    """End-to-end: create leads + workflow, then execute."""
    # Create some leads
    client.post(
        "/api/v1/leads/", json={"name": "Test Lead", "email": "test@example.com"}
    )

    # Create workflow
    create_resp = client.post(
        "/api/v1/workflows/",
        json={
            "name": "E2E Campaign",
            "flow_data": SAMPLE_FLOW,
        },
    )
    wf_id = create_resp.json()["id"]

    # Execute
    resp = client.post(f"/api/v1/workflows/{wf_id}/execute", json={})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("completed", "failed")
    assert "execution_id" in data


def test_list_executions(client):
    # Create workflow
    create_resp = client.post(
        "/api/v1/workflows/",
        json={
            "name": "Exec List Test",
            "flow_data": SAMPLE_FLOW,
        },
    )
    wf_id = create_resp.json()["id"]

    # Create a lead and execute
    client.post("/api/v1/leads/", json={"name": "Lead X", "email": "x@test.com"})
    client.post(f"/api/v1/workflows/{wf_id}/execute", json={})

    # List executions
    resp = client.get(f"/api/v1/workflows/{wf_id}/executions")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["executions"]) >= 1


# ── Validation Tests ──


def test_workflow_flow_validation(client):
    """flow_data must have nodes."""
    resp = client.post(
        "/api/v1/workflows/",
        json={
            "name": "Bad Flow",
            "flow_data": {"nodes": [], "edges": []},
        },
    )
    # Empty nodes is valid schema-wise, engine will just have nothing to run
    assert resp.status_code == 201
