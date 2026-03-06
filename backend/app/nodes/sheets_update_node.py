"""
Google Sheets Update Node – exports data to a Google Sheet.
Phase 3: full implementation. Phase 1: stub.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.logger import get_logger
from app.integrations.google_sheets_client import append_to_sheet

log = get_logger("node.sheets_update")


async def execute(
    context: Dict[str, Any], node_data: Dict[str, Any], db: Session
) -> Dict[str, Any]:
    """
    Exports the leads currently active in the workflow context to a specified Google Sheet.
    Used for CRM ingestion of converted leads.
    """
    spreadsheet_id = node_data.get("spreadsheet_id")
    worksheet_name = node_data.get("worksheet_name", "Sheet1")

    if not spreadsheet_id:
        log.warning("Sheets Update Node executed without 'spreadsheet_id' configured.")
        return context

    leads = context.get("leads", [])
    if not leads:
        log.info("No leads in context to export to Google Sheets.")
        return context

    log.info(f"Exporting {len(leads)} leads to Google Sheet {spreadsheet_id}")

    # We strip down lead object to a clean dict for export
    clean_leads = []
    for lead in leads:
        clean = {
            "ID": str(lead.get("id")),
            "Name": lead.get("name", ""),
            "Email": lead.get("email", ""),
            "Company": lead.get("company", ""),
            "Status": lead.get("status", ""),
            "Exported At": __import__("datetime").datetime.utcnow().isoformat(),
        }
        clean_leads.append(clean)

    try:
        await append_to_sheet(
            spreadsheet_id=spreadsheet_id,
            data=clean_leads,
            worksheet_name=worksheet_name,
        )
    except Exception as e:
        log.error(f"Error executing Sheets Update Node: {e}")

    return context
