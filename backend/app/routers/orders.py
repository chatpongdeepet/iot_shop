from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .auth import get_current_user, get_db

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Calculate total price and verify stock
    total_price = 0
    db_items = []
    
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        
        # Deduct stock
        product.stock -= item.quantity
        
        price = product.price * item.quantity
        total_price += price
        
        db_item = models.OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_time=product.price
        )
        db_items.append(db_item)
    
    new_order = models.Order(
        user_id=current_user.id,
        address_id=order.address_id, # Assuming address exists and belongs to user (should validate)
        total_price=total_price,
        status=models.OrderStatus.PENDING
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    for item in db_items:
        item.order_id = new_order.id
        db.add(item)
    
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/my-orders", response_model=List[schemas.OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
