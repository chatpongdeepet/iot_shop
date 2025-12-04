from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Address ---
class AddressBase(BaseModel):
    address_line: str
    city: str
    province: str
    zip_code: str

class AddressCreate(AddressBase):
    pass

class VisitorLocationCreate(BaseModel):
    latitude: float
    longitude: float

class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- User ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    addresses: List[AddressResponse] = []

    class Config:
        from_attributes = True

# --- Product ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    images: List[str] = []
    category: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

    @validator('images', pre=True, check_fields=False)
    def extract_images(cls, v):
        if not v:
            return []
        # If it's a list of objects (SQLAlchemy models), extract image_url
        if hasattr(v[0], 'image_url'):
            return [img.image_url for img in v]
        return v

class PaginatedProductResponse(BaseModel):
    items: List[ProductResponse]
    total: int

# --- Order ---
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    address_id: Optional[int] = None

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_time: float
    product_name: str # Helper

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

# --- Cart ---
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse]
    total_price: float = 0.0

    class Config:
        from_attributes = True
