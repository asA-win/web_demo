from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class MenuCategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class MenuCategoryCreate(MenuCategoryBase):
    pass

class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class MenuItemBase(BaseModel):
    category_id: int
    name: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=5)
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    is_vegetarian: bool = False
    is_vegan: bool = False
    is_gluten_free: bool = False
    is_chef_special: bool = False
    is_available: bool = True
    preparation_time_minutes: Optional[int] = 20
    allergens: Optional[str] = None
    calories: Optional[int] = None

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_vegetarian: Optional[bool] = None
    is_vegan: Optional[bool] = None
    is_gluten_free: Optional[bool] = None
    is_chef_special: Optional[bool] = None
    is_available: Optional[bool] = None
    preparation_time_minutes: Optional[int] = None
    allergens: Optional[str] = None
    calories: Optional[int] = None

class MenuItemResponse(MenuItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MenuCategoryResponse(MenuCategoryBase):
    id: int
    created_at: datetime
    items: List[MenuItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
