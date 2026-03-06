"""
Phase 1 Tests – File Parser utility.
"""

import json
from app.utils.file_parser import parse_upload


def test_parse_csv():
    csv_bytes = (
        b"name,email,company\nAlice,alice@test.com,AliceCo\nBob,bob@test.com,BobCo\n"
    )
    result = parse_upload(csv_bytes, "test.csv")
    assert len(result) == 2
    assert result[0]["name"] == "Alice"
    assert result[1]["email"] == "bob@test.com"


def test_parse_json_array():
    data = [{"name": "Charlie"}, {"name": "Dana"}]
    result = parse_upload(json.dumps(data).encode(), "test.json")
    assert len(result) == 2
    assert result[0]["name"] == "Charlie"


def test_parse_json_object_with_leads_key():
    data = {"leads": [{"name": "Eve"}]}
    result = parse_upload(json.dumps(data).encode(), "test.json")
    assert len(result) == 1
    assert result[0]["name"] == "Eve"


def test_parse_unsupported_format():
    import pytest

    with pytest.raises(ValueError, match="Unsupported file type"):
        parse_upload(b"hello", "test.txt")


def test_parse_csv_normalises_columns():
    csv_bytes = b"Full Name, Email Address ,Company Name\nTest,test@test.com,TestCo\n"
    result = parse_upload(csv_bytes, "test.csv")
    assert "full_name" in result[0]
    assert "email_address" in result[0]
