from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import re
from app.database import get_db
from app.models.menu import MenuCategory, MenuItem
from app.schemas.menu import (
    MenuCategoryCreate, MenuCategoryUpdate, MenuCategoryResponse,
    MenuItemCreate, MenuItemUpdate, MenuItemResponse
)
from app.core.security import get_current_admin_user
from app.core.websocket_manager import manager

router = APIRouter(prefix="/api/menu", tags=["Menu Management"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    return re.sub(r'[\s_]+', '-', re.sub(r'[^\w\s-]', '', text))

# --- Public Endpoints ---

@router.get("/categories", response_model=List[MenuCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Fetch all active categories with their active menu items."""
    categories = db.query(MenuCategory).filter(
        MenuCategory.is_active == True
    ).order_by(MenuCategory.display_order.asc(), MenuCategory.id.asc()).all()
    return categories

@router.get("/items", response_model=List[MenuItemResponse])
def get_items(
    category_id: Optional[int] = None,
    is_vegetarian: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Fetch menu items with optional filters."""
    query = db.query(MenuItem).filter(MenuItem.is_available == True)
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    if is_vegetarian is not None:
        query = query.filter(MenuItem.is_vegetarian == is_vegetarian)
    if search:
        query = query.filter(
            (MenuItem.name.ilike(f"%{search}%")) |
            (MenuItem.description.ilike(f"%{search}%"))
        )
    return query.order_by(MenuItem.name.asc()).all()

# --- Admin Endpoints ---

@router.get("/admin/all-categories", response_model=List[MenuCategoryResponse])
def admin_get_all_categories(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    return db.query(MenuCategory).order_by(MenuCategory.display_order.asc()).all()

@router.post("/categories", response_model=MenuCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    cat_in: MenuCategoryCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    slug = cat_in.slug or slugify(cat_in.name)
    existing = db.query(MenuCategory).filter(
        (MenuCategory.name == cat_in.name) | (MenuCategory.slug == slug)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name or slug already exists."
        )

    category = MenuCategory(
        name=cat_in.name,
        slug=slug,
        description=cat_in.description,
        display_order=cat_in.display_order,
        is_active=cat_in.is_active
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    await manager.broadcast_to_public("MENU_UPDATED", {"action": "category_created", "id": category.id})
    return category

@router.put("/categories/{category_id}", response_model=MenuCategoryResponse)
async def update_category(
    category_id: int,
    cat_in: MenuCategoryUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    category = db.query(MenuCategory).filter(MenuCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = cat_in.model_dump(exclude_unset=True)
    if "name" in update_data and not cat_in.slug:
        update_data["slug"] = slugify(update_data["name"])

    for key, value in update_data.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)

    await manager.broadcast_to_public("MENU_UPDATED", {"action": "category_updated", "id": category.id})
    return category

@router.delete("/categories/{category_id}", status_code=status.HTTP_200_OK)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    category = db.query(MenuCategory).filter(MenuCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    db.delete(category)
    db.commit()

    await manager.broadcast_to_public("MENU_UPDATED", {"action": "category_deleted", "id": category_id})
    return {"message": "Category deleted successfully"}

# Menu Items Admin
@router.get("/admin/all-items", response_model=List[MenuItemResponse])
def admin_get_all_items(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    query = db.query(MenuItem)
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    return query.order_by(MenuItem.id.desc()).all()

@router.post("/items", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_in: MenuItemCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    category = db.query(MenuCategory).filter(MenuCategory.id == item_in.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    item = MenuItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)

    await manager.broadcast_to_public("MENU_UPDATED", {"action": "item_created", "item_name": item.name})
    return item

@router.put("/items/{item_id}", response_model=MenuItemResponse)
async def update_item(
    item_id: int,
    item_in: MenuItemUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        category = db.query(MenuCategory).filter(MenuCategory.id == update_data["category_id"]).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)

    await manager.broadcast_to_public("MENU_UPDATED", {"action": "item_updated", "item_name": item.name})
    return item

@router.delete("/items/{item_id}", status_code=status.HTTP_200_OK)
async def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_user)
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")

    name = item.name
    db.delete(item)
    db.commit()

    await manager.broadcast_to_public("MENU_UPDATED", {"action": "item_deleted", "item_name": name})
    return {"message": "Menu item deleted successfully"}
