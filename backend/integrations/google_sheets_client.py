"""Google Sheets Client – stub for Phase 3."""

from app.utils.logger import get_logger

log = get_logger("integration.google_sheets")


async def update_sheet(spreadsheet_id: str, data: list) -> bool:
    log.warning("Google Sheets integration not yet implemented (Phase 3)")
    return False
