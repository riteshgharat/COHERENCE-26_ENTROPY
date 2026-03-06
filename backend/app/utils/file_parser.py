"""
File parser utility – ingests CSV, XLSX, JSON into a list of dicts.
Used by the lead import pipeline.
"""

import io
import json
from typing import List, Dict, Any
import pandas as pd
from app.utils.logger import get_logger

log = get_logger("file_parser")


def parse_upload(file_content: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Parse uploaded file bytes into a list of row-dicts.
    Supports .csv, .xlsx, .json extensions.
    """
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "csv":
        return _parse_csv(file_content)
    elif ext in ("xlsx", "xls"):
        return _parse_xlsx(file_content)
    elif ext == "json":
        return _parse_json(file_content)
    else:
        raise ValueError(f"Unsupported file type: .{ext}  (allowed: csv, xlsx, json)")


def _parse_csv(content: bytes) -> List[Dict[str, Any]]:
    df = pd.read_csv(io.BytesIO(content))
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    log.info(f"Parsed CSV: {len(df)} rows, columns={list(df.columns)}")
    return df.where(df.notna(), None).to_dict(orient="records")


def _parse_xlsx(content: bytes) -> List[Dict[str, Any]]:
    df = pd.read_excel(io.BytesIO(content), engine="openpyxl")
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    log.info(f"Parsed XLSX: {len(df)} rows, columns={list(df.columns)}")
    return df.where(df.notna(), None).to_dict(orient="records")


def _parse_json(content: bytes) -> List[Dict[str, Any]]:
    data = json.loads(content.decode("utf-8"))
    if isinstance(data, list):
        log.info(f"Parsed JSON array: {len(data)} records")
        return data
    elif isinstance(data, dict) and "leads" in data:
        log.info(f"Parsed JSON object with 'leads' key: {len(data['leads'])} records")
        return data["leads"]
    else:
        raise ValueError(
            "JSON must be an array of objects or an object with a 'leads' key."
        )
