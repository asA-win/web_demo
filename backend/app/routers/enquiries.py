from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.enquiry import CustomerEnquiry
from app.schemas.enquiry import EnquiryCreate, EnquiryStatusUpdate, EnquiryResponse
from app.core.security import get_current_admin_user
from app.core.websocket_manager import manager

router = APIRouter(prefix="/api/enquiries", tags=["Customer Enquiries"])

@router.post("", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
async def submit_enquiry(
    enquiry_in: EnquiryCreate,
    db: Session = Depends(get_db)
):
    """Customer submits an enquiry or question."""
    enquiry = CustomerEnquiry(
        customer_name=enquiry_in.customer_name.strip(),
        customer_email=enquiry_in.customer_email.strip().lower(),
        customer_phone=enquiry_in.customer_phone.strip() if enquiry_in.customer_phone else None,
        subject=enquiry_in.subject.strip() if enquiry_in.subject else "General Enquiry",
        message=enquiry_in.message.strip(),
        status="pending"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    # Real-time alert to Admin dashboard!
    payload = {
        "id": enquiry.id,
        "customer_name": enquiry.customer_name,
        "customer_email": enquiry.customer_email,
        "customer_phone": enquiry.customer_phone,
        "subject": enquiry.subject,
        "message": enquiry.message,
        "created_at": str(enquiry.created_at)
    }
    await manager.broadcast_to_admins("NEW_ENQUIRY", payload)

    return enquiry

@router.get("", response_model=List[EnquiryResponse])
def get_all_enquiries(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    """Admin endpoint to view enquiries."""
    query = db.query(CustomerEnquiry)
    if status_filter:
        query = query.filter(CustomerEnquiry.status == status_filter)
    return query.order_by(CustomerEnquiry.created_at.desc()).all()

@router.patch("/{enquiry_id}", response_model=EnquiryResponse)
async def update_enquiry_status(
    enquiry_id: int,
    update_in: EnquiryStatusUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    enquiry = db.query(CustomerEnquiry).filter(CustomerEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    enquiry.status = update_in.status
    if update_in.admin_reply is not None:
        enquiry.admin_reply = update_in.admin_reply

    db.commit()
    db.refresh(enquiry)

    await manager.broadcast_to_admins("ENQUIRY_UPDATED", {
        "id": enquiry.id,
        "status": enquiry.status,
        "customer_name": enquiry.customer_name
    })
    return enquiry

@router.delete("/{enquiry_id}", status_code=status.HTTP_200_OK)
async def delete_enquiry(
    enquiry_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    enquiry = db.query(CustomerEnquiry).filter(CustomerEnquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    db.delete(enquiry)
    db.commit()
    return {"message": "Enquiry deleted successfully"}
