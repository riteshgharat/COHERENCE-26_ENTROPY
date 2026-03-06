"""
Phase 1 Tests – Workflow Nodes (unit tests).
Tests run directly against node handler functions without the full engine.
"""

import pytest
from app.nodes.start_node import execute as start_execute
from app.nodes.lead_import_node import execute as lead_import_execute
from app.nodes.channel_select_node import execute as channel_select_execute


@pytest.mark.asyncio
async def test_start_node_with_leads():
    context = {"leads": [{"id": "1", "name": "Alice"}]}
    result = await start_execute(context, {}, None)
    assert result["status"] == "started"


@pytest.mark.asyncio
async def test_start_node_no_leads_raises():
    with pytest.raises(ValueError, match="No leads"):
        await start_execute({"leads": []}, {}, None)


@pytest.mark.asyncio
async def test_lead_import_passthrough():
    leads = [{"id": "1", "name": "Bob", "industry": "Tech"}]
    context = {"leads": leads}
    result = await lead_import_execute(context, {}, None)
    assert len(result["leads"]) == 1


@pytest.mark.asyncio
async def test_lead_import_industry_filter():
    leads = [
        {"id": "1", "name": "A", "industry": "Tech"},
        {"id": "2", "name": "B", "industry": "Finance"},
        {"id": "3", "name": "C", "industry": "tech"},
    ]
    context = {"leads": leads}
    result = await lead_import_execute(context, {"industry": "Tech"}, None)
    assert len(result["leads"]) == 2


@pytest.mark.asyncio
async def test_channel_select_default():
    context = {}
    result = await channel_select_execute(context, {}, None)
    assert result["channel"] == "email"


@pytest.mark.asyncio
async def test_channel_select_whatsapp():
    context = {}
    result = await channel_select_execute(context, {"channel": "whatsapp"}, None)
    assert result["channel"] == "whatsapp"


@pytest.mark.asyncio
async def test_channel_select_invalid_falls_back():
    context = {}
    result = await channel_select_execute(context, {"channel": "pigeon_post"}, None)
    assert result["channel"] == "email"
