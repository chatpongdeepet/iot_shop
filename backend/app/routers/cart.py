from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .auth import get_current_user, get_db

router = APIRouter(
    prefix="/cart",
    tags=["cart"]
)

def get_or_create_cart(db: Session, user_id: int):
    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()
    if not cart:
        cart = models.Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@router.get("/", response_model=schemas.CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart = get_or_create_cart(db, current_user.id)
    
    # Sort items by ID to maintain order
    sorted_items = sorted(cart.items, key=lambda x: x.id)
    total_price = sum(item.quantity * item.product.price for item in sorted_items)
    
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": sorted_items,
        "total_price": total_price
    }

@router.post("/items", response_model=schemas.CartResponse)
def add_to_cart(
    item: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart = get_or_create_cart(db, current_user.id)
    
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if item already in cart
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == item.product_id
    ).first()
    
    if cart_item:
        cart_item.quantity += item.quantity
    else:
        cart_item = models.CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)
        
    db.commit()
    db.refresh(cart)
    
    # Return full cart response
    sorted_items = sorted(cart.items, key=lambda x: x.id)
    total_price = sum(i.quantity * i.product.price for i in sorted_items)
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": sorted_items,
        "total_price": total_price
    }

@router.put("/items/{item_id}", response_model=schemas.CartResponse)
def update_cart_item(
    item_id: int,
    update: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart = get_or_create_cart(db, current_user.id)
    
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    if update.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = update.quantity
        
    db.commit()
    db.refresh(cart)
    
    sorted_items = sorted(cart.items, key=lambda x: x.id)
    total_price = sum(i.quantity * i.product.price for i in sorted_items)
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": sorted_items,
        "total_price": total_price
    }

@router.delete("/items/{item_id}", response_model=schemas.CartResponse)
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart = get_or_create_cart(db, current_user.id)
    
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    
    sorted_items = sorted(cart.items, key=lambda x: x.id)
    total_price = sum(i.quantity * i.product.price for i in sorted_items)
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": sorted_items,
        "total_price": total_price
    }
