"""
Google Sheets Client – reads and writes data to Google Sheets.
Uses gspread and service account credentials.
"""

import os
from typing import List, Dict, Any, Optional
from app.config import get_settings
from app.utils.logger import get_logger

log = get_logger("integration.google_sheets")
settings = get_settings()


def _get_client():
    import gspread
    from google.oauth2.service_account import Credentials

    creds_file = settings.GOOGLE_SHEETS_CREDENTIALS_FILE

    if not creds_file or not os.path.exists(creds_file):
        raise FileNotFoundError(
            f"Google Sheets credentials file not found at: {creds_file}"
        )

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]

    credentials = Credentials.from_service_account_file(creds_file, scopes=scopes)
    client = gspread.authorize(credentials)
    return client


async def append_to_sheet(
    spreadsheet_id: str, data: List[Dict[str, Any]], worksheet_name: str = "Sheet1"
) -> bool:
    """
    Append list of dictionaries to a Google Sheet.
    Keys of the dict act as headers.
    """
    if not settings.GOOGLE_SHEETS_CREDENTIALS_FILE:
        log.warning(
            f"[DRY RUN] Would update Google Sheet '{spreadsheet_id}' with {len(data)} rows."
        )
        return True

    try:
        client = _get_client()
        sheet = client.open_by_key(spreadsheet_id)

        try:
            worksheet = sheet.worksheet(worksheet_name)
        except Exception:
            # If worksheet doesn't exist, use the first one
            worksheet = sheet.get_worksheet(0)

        if not data:
            return True

        # Get existing headers or create them
        existing_data = worksheet.get_all_values()
        if not existing_data:
            headers = list(data[0].keys())
            worksheet.append_row(headers)
        else:
            headers = existing_data[0]

        # Prepare rows to append based on headers
        rows_to_append = []
        for item in data:
            row = [str(item.get(header, "")) for header in headers]
            rows_to_append.append(row)

        worksheet.append_rows(rows_to_append)
        log.info(
            f"Successfully appended {len(rows_to_append)} rows to Google Sheet {spreadsheet_id}"
        )
        return True

    except Exception as e:
        log.error(f"Failed to append to Google Sheet: {e}")
        raise


async def read_from_sheet(
    spreadsheet_id: str, worksheet_name: str = "Sheet1"
) -> List[Dict[str, Any]]:
    """
    Read all rows from a Google Sheet as a list of dicts.
    """
    if not settings.GOOGLE_SHEETS_CREDENTIALS_FILE:
        raise ValueError("Google Sheets credentials not configured.")

    try:
        client = _get_client()
        sheet = client.open_by_key(spreadsheet_id)

        try:
            worksheet = sheet.worksheet(worksheet_name)
        except Exception:
            worksheet = sheet.get_worksheet(0)

        records = worksheet.get_all_records()
        log.info(
            f"Successfully read {len(records)} rows from Google Sheet {spreadsheet_id}"
        )
        return records

    except Exception as e:
        log.error(f"Failed to read from Google Sheet: {e}")
        raise
