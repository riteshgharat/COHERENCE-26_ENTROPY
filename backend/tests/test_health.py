"""
Phase 1 Tests – Health & Root endpoints.
"""


def test_root_returns_app_info(client):
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "app" in data
    assert "version" in data


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


def test_docs_accessible(client):
    resp = client.get("/docs")
    assert resp.status_code == 200
