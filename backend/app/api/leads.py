"""
Leads API – CRUD + file import endpoint.
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead, LeadStatus
from app.schemas.lead_schema import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadListResponse,
    LeadImportResponse,
)
from app.utils.file_parser import parse_upload
from app.utils.logger import get_logger

router = APIRouter(prefix="/leads", tags=["Leads"])
log = get_logger("api.leads")


# ── Import leads from file ──


@router.post("/import", response_model=LeadImportResponse)
async def import_leads(
    file: UploadFile = File(...),
    source: Optional[str] = Query(None, description="csv, xlsx, json"),
    db: Session = Depends(get_db),
):
    """Import leads from a CSV, XLSX, or JSON file."""
    content = await file.read()
    filename = file.filename or "upload.csv"

    try:
        rows = parse_upload(content, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    imported = 0
    skipped = 0
    errors: List[str] = []

    # Known field mapping
    FIELD_MAP = {
        "name": "name",
        "full_name": "name",
        "contact_name": "name",
        "email": "email",
        "email_address": "email",
        "mail": "email",
        "phone": "phone",
        "phone_number": "phone",
        "mobile": "phone",
        "company": "company",
        "company_name": "company",
        "organization": "company",
        "industry": "industry",
        "sector": "industry",
        "linkedin_url": "linkedin_url",
        "linkedin": "linkedin_url",
        "title": "title",
        "job_title": "title",
        "position": "title",
        "location": "location",
        "city": "location",
        "country": "location",
    }

    for idx, row in enumerate(rows):
        try:
            # Normalise keys
            normalised = {}
            extra = {}
            for key, value in row.items():
                mapped = FIELD_MAP.get(key.lower().strip())
                if mapped:
                    normalised[mapped] = value
                else:
                    extra[key] = value

            name = normalised.get("name")
            if not name:
                skipped += 1
                errors.append(f"Row {idx + 1}: missing 'name' field")
                continue

            lead = Lead(
                name=str(name),
                email=normalised.get("email"),
                phone=str(normalised["phone"]) if normalised.get("phone") else None,
                company=normalised.get("company"),
                industry=normalised.get("industry"),
                linkedin_url=normalised.get("linkedin_url"),
                title=normalised.get("title"),
                location=normalised.get("location"),
                extra_data=extra,
                source=source or filename.rsplit(".", 1)[-1],
            )
            db.add(lead)
            imported += 1
        except Exception as e:
            skipped += 1
            errors.append(f"Row {idx + 1}: {str(e)}")

    db.commit()
    log.info(f"Imported {imported} leads, skipped {skipped}")
    return LeadImportResponse(
        total_imported=imported, total_skipped=skipped, errors=errors
    )


# ── CRUD ──


@router.post("/", response_model=LeadResponse, status_code=201)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/", response_model=LeadListResponse)
def list_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[LeadStatus] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Lead)
    if status:
        query = query.filter(Lead.status == status)
    total = query.count()
    leads = query.offset((page - 1) * page_size).limit(page_size).all()
    return LeadListResponse(leads=leads, total=total, page=page, page_size=page_size)


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: UUID, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: UUID, payload: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=204)
def delete_lead(lead_id: UUID, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
