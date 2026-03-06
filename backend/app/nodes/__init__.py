"""
Nodes package – NODE_REGISTRY maps node type strings to handler functions.
The workflow engine looks up handlers from this registry.
"""

from app.nodes import (
    start_node,
    lead_import_node,
    ai_message_node,
    channel_select_node,
    send_message_node,
    wait_node,
    check_reply_node,
    followup_node,
    ai_conversation_node,
    sheets_update_node,
    analytics_node,
)

# Maps React Flow node type → async handler function
NODE_REGISTRY = {
    "start": start_node.execute,
    "lead_import": lead_import_node.execute,
    "ai_message": ai_message_node.execute,
    "channel_select": channel_select_node.execute,
    "send_message": send_message_node.execute,
    "wait": wait_node.execute,
    "check_reply": check_reply_node.execute,
    "followup": followup_node.execute,
    "ai_conversation": ai_conversation_node.execute,
    "update_sheets": sheets_update_node.execute,
    "analytics": analytics_node.execute,
}
