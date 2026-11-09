from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.table import RestaurantTable
from app.schemas.table import TableCreate, TableUpdate, TableResponse
from app.core.security import get_current_admin_user
from app.core.websocket_manager import manager

router = APIRouter(prefix="/api/tables", tags=["Table Management"])

@router.get("", response_model=List[TableResponse])
def get_tables(db: Session = Depends(get_db)):
    """List all active restaurant tables."""
    return db.query(RestaurantTable).order_by(RestaurantTable.table_number.asc()).all()

@router.post("", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(
    table_in: TableCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    existing = db.query(RestaurantTable).filter(RestaurantTable.table_number == table_in.table_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Table with this table number already exists.")

    table = RestaurantTable(**table_in.model_dump())
    db.add(table)
    db.commit()
    db.refresh(table)

    await manager.broadcast_to_public("AVAILABILITY_CHANGED", {"action": "table_added", "table_id": table.id})
    return table

@router.put("/{table_id}", response_model=TableResponse)
async def update_table(
    table_id: int,
    table_in: TableUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    table = db.query(RestaurantTable).filter(RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    update_data = table_in.model_dump(exclude_unset=True)
    if "table_number" in update_data and update_data["table_number"] != table.table_number:
        existing = db.query(RestaurantTable).filter(RestaurantTable.table_number == update_data["table_number"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Table number already in use.")

    for k, v in update_data.items():
        setattr(table, k, v)

    db.commit()
    db.refresh(table)

    await manager.broadcast_to_public("AVAILABILITY_CHANGED", {"action": "table_updated", "table_id": table.id})
    return table

@router.delete("/{table_id}", status_code=status.HTTP_200_OK)
async def delete_table(
    table_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    table = db.query(RestaurantTable).filter(RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    db.delete(table)
    db.commit()

    await manager.broadcast_to_public("AVAILABILITY_CHANGED", {"action": "table_deleted", "table_id": table_id})
    return {"message": "Table removed successfully"}
