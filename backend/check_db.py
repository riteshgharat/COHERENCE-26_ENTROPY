import asyncio
from app.database import SessionLocal
from app.models.lead import Lead
from app.models.message import Message

def check_db():
    db = SessionLocal()
    try:
        phone = "918793080701"
        lead = db.query(Lead).filter(Lead.phone.contains(phone[-9:])).first()
        
        with open("output_utf8.txt", "w", encoding="utf-8") as f:
            if not lead:
                f.write(f"Lead with phone ending in {phone[-9:]} not found.\n")
                return

            f.write(f"== LEAD INFO ==\n")
            f.write(f"ID: {lead.id}\n")
            f.write(f"Name: {lead.name}\n")
            f.write(f"Phone: {lead.phone}\n")
            f.write(f"Status: {lead.status}\n\n")
            
            f.write("== MESSAGES ==\n")
            messages = db.query(Message).filter(Message.lead_id == lead.id).order_by(Message.created_at.asc()).all()
            for m in messages:
                f.write(f"[{m.created_at}] {m.direction} ({m.channel}): {m.body}\n")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
