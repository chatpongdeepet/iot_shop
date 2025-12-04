from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .auth import get_current_user, get_db

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/", response_model=schemas.PaginatedProductResponse)
def get_products(
    skip: int = 0, 
    limit: int = 100, 
    search: str = None,
    sort_by: str = None, # price_asc, price_desc, name_asc
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(models.Product.name.ilike(search_filter) | models.Product.description.ilike(search_filter))
        
    if sort_by == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort_by == "name_asc":
        query = query.order_by(models.Product.name.asc())
    else:
        query = query.order_by(models.Product.id.asc())
        
    total = query.count()
    products = query.offset(skip).limit(limit).all()
    return {"items": products, "total": total}

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if admin
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Validate max 5 images
    if len(product.images) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

    product_data = product.dict()
    images = product_data.pop('images', [])
    
    new_product = models.Product(**product_data)
    db.add(new_product)
    db.flush() # Get ID
    
    for img_url in images:
        db_image = models.ProductImage(product_id=new_product.id, image_url=img_url)
        db.add(db_image)
        
    db.commit()
    db.refresh(new_product)
    return new_product

    return new_product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_update: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_data = product_update.dict()
    images = product_data.pop('images', None)
    
    for key, value in product_data.items():
        setattr(db_product, key, value)
        
    if images is not None:
        if len(images) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
            
        # Delete existing images
        db.query(models.ProductImage).filter(models.ProductImage.product_id == product_id).delete()
        
        # Add new images
        for img_url in images:
            db_image = models.ProductImage(product_id=product_id, image_url=img_url)
            db.add(db_image)
    
    db.commit()
    db.refresh(db_product)
    return db_product
def delete_product(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
