"""
Phase 1 Tests – Leads API (CRUD + Import).
"""

import io
import json


# ── CRUD Tests ──


def test_create_lead(client):
    resp = client.post(
        "/api/v1/leads/",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "company": "Acme Inc",
            "industry": "SaaS",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "John Doe"
    assert data["email"] == "john@example.com"
    assert data["status"] == "new"


def test_create_lead_name_required(client):
    resp = client.post("/api/v1/leads/", json={"email": "no-name@test.com"})
    assert resp.status_code == 422  # validation error


def test_list_leads_empty(client):
    resp = client.get("/api/v1/leads/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["leads"] == []


def test_list_leads_with_data(client):
    client.post("/api/v1/leads/", json={"name": "Lead A", "email": "a@test.com"})
    client.post("/api/v1/leads/", json={"name": "Lead B", "email": "b@test.com"})

    resp = client.get("/api/v1/leads/")
    data = resp.json()
    assert data["total"] == 2
    assert len(data["leads"]) == 2


def test_get_lead_by_id(client):
    create_resp = client.post(
        "/api/v1/leads/", json={"name": "Jane", "email": "jane@test.com"}
    )
    lead_id = create_resp.json()["id"]

    resp = client.get(f"/api/v1/leads/{lead_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Jane"


def test_get_lead_not_found(client):
    resp = client.get("/api/v1/leads/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


def test_update_lead(client):
    create_resp = client.post("/api/v1/leads/", json={"name": "Old Name"})
    lead_id = create_resp.json()["id"]

    resp = client.patch(
        f"/api/v1/leads/{lead_id}", json={"name": "New Name", "company": "NewCo"}
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"
    assert resp.json()["company"] == "NewCo"


def test_delete_lead(client):
    create_resp = client.post("/api/v1/leads/", json={"name": "Delete Me"})
    lead_id = create_resp.json()["id"]

    resp = client.delete(f"/api/v1/leads/{lead_id}")
    assert resp.status_code == 204

    resp = client.get(f"/api/v1/leads/{lead_id}")
    assert resp.status_code == 404


# ── File Import Tests ──


def test_import_csv(client):
    csv_content = b"name,email,company,industry\nAlice,alice@test.com,AliceCo,Tech\nBob,bob@test.com,BobCo,Finance\n"
    files = {"file": ("leads.csv", io.BytesIO(csv_content), "text/csv")}
    resp = client.post("/api/v1/leads/import", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_imported"] == 2
    assert data["total_skipped"] == 0


def test_import_json(client):
    leads = [
        {"name": "Charlie", "email": "charlie@test.com", "company": "CharlieCo"},
        {"name": "Dana", "email": "dana@test.com"},
    ]
    json_bytes = json.dumps(leads).encode("utf-8")
    files = {"file": ("leads.json", io.BytesIO(json_bytes), "application/json")}
    resp = client.post("/api/v1/leads/import", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_imported"] == 2


def test_import_csv_missing_name(client):
    csv_content = b"email,company\nnoname@test.com,SomeCo\n"
    files = {"file": ("leads.csv", io.BytesIO(csv_content), "text/csv")}
    resp = client.post("/api/v1/leads/import", files=files)
    data = resp.json()
    assert data["total_skipped"] == 1
    assert "missing 'name'" in data["errors"][0]


def test_import_csv_field_mapping(client):
    """Test that alternate column names like 'Full Name', 'Email Address' get mapped correctly."""
    csv_content = (
        b"full_name,email_address,company_name,job_title\nEva,eva@test.com,EvaCo,CEO\n"
    )
    files = {"file": ("leads.csv", io.BytesIO(csv_content), "text/csv")}
    resp = client.post("/api/v1/leads/import", files=files)
    assert resp.status_code == 200
    assert resp.json()["total_imported"] == 1

    # Verify the lead was mapped correctly
    leads_resp = client.get("/api/v1/leads/")
    lead = leads_resp.json()["leads"][0]
    assert lead["name"] == "Eva"
    assert lead["email"] == "eva@test.com"
    assert lead["company"] == "EvaCo"
    assert lead["title"] == "CEO"


# ── Pagination Tests ──


def test_pagination(client):
    for i in range(5):
        client.post("/api/v1/leads/", json={"name": f"Lead {i}"})

    resp = client.get("/api/v1/leads/?page=1&page_size=2")
    data = resp.json()
    assert data["total"] == 5
    assert len(data["leads"]) == 2
    assert data["page"] == 1
    assert data["page_size"] == 2
