from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database
from .auth import get_current_user
from geoalchemy2.shape import to_shape

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

from typing import List

@router.get("/me/addresses", response_model=List[schemas.AddressResponse])
def get_user_addresses(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user.addresses

@router.post("/me/addresses", response_model=schemas.AddressResponse)
def create_user_address(address_data: schemas.AddressCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check address limit
    if len(current_user.addresses) >= 3:
        raise HTTPException(status_code=400, detail="Maximum number of addresses (3) reached")
    
    new_address = models.Address(
        user_id=current_user.id,
        address_line=address_data.address_line,
        city=address_data.city,
        province=address_data.province,
        zip_code=address_data.zip_code
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    db.refresh(new_address)
    return new_address

@router.delete("/me/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_address(address_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    address = db.query(models.Address).filter(models.Address.id == address_id, models.Address.user_id == current_user.id).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    db.delete(address)
    db.commit()
    return None

@router.put("/me/addresses/{address_id}", response_model=schemas.AddressResponse)
def update_user_address(address_id: int, address_data: schemas.AddressCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    address = db.query(models.Address).filter(models.Address.id == address_id, models.Address.user_id == current_user.id).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    address.address_line = address_data.address_line
    address.city = address_data.city
    address.province = address_data.province
    address.zip_code = address_data.zip_code
    
    db.commit()
    db.refresh(address)
    return address

