from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database, schemas
from .auth import get_current_user, get_db
from geoalchemy2.shape import to_shape
import json

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

# Coordinates for Thai provinces (approximate centers)
PROVINCE_COORDINATES = {
    "Bangkok": (13.7563, 100.5018),
    "Samut Prakan": (13.5991, 100.5968),
    "Nonthaburi": (13.8591, 100.5217),
    "Pathum Thani": (14.0208, 100.5250),
    "Phra Nakhon Si Ayutthaya": (14.3532, 100.5684),
    "Ang Thong": (14.5896, 100.4551),
    "Lopburi": (14.7995, 100.6534),
    "Sing Buri": (14.8905, 100.4142),
    "Chai Nat": (15.1852, 100.1251),
    "Saraburi": (14.5289, 100.9101),
    "Chon Buri": (13.3611, 100.9847),
    "Rayong": (12.6815, 101.2816),
    "Chanthaburi": (12.6114, 102.1039),
    "Trat": (12.2428, 102.5175),
    "Chachoengsao": (13.6904, 101.0780),
    "Prachin Buri": (14.0620, 101.3783),
    "Nakhon Nayok": (14.2069, 101.2131),
    "Sa Kaeo": (13.8141, 102.0726),
    "Nakhon Ratchasima": (14.9799, 102.0978),
    "Buri Ram": (14.9930, 103.1029),
    "Surin": (14.8829, 103.4936),
    "Si Sa Ket": (15.1186, 104.3220),
    "Ubon Ratchathani": (15.2448, 104.8473),
    "Yasothon": (15.7924, 104.1453),
    "Chaiyaphum": (15.8105, 102.0288),
    "Amnat Charoen": (15.8657, 104.6258),
    "Nong Bua Lam Phu": (17.2032, 102.4408),
    "Khon Kaen": (16.4322, 102.8236),
    "Udon Thani": (17.4156, 102.7872),
    "Loei": (17.4860, 101.7223),
    "Nong Khai": (17.8783, 102.7413),
    "Maha Sarakham": (16.1858, 103.3033),
    "Roi Et": (16.0538, 103.6520),
    "Kalasin": (16.4328, 103.5066),
    "Sakon Nakhon": (17.1664, 104.1486),
    "Nakhon Phanom": (17.3920, 104.7696),
    "Mukdahan": (16.5436, 104.7114),
    "Chiang Mai": (18.7932, 98.9847),
    "Lamphun": (18.5748, 99.0087),
    "Lampang": (18.2858, 99.4910),
    "Uttaradit": (17.6201, 100.0993),
    "Phrae": (18.1446, 100.1403),
    "Nan": (18.7832, 100.7782),
    "Phayao": (19.1965, 99.9025),
    "Chiang Rai": (19.9072, 99.8325),
    "Mae Hong Son": (19.3020, 97.9654),
    "Nakhon Sawan": (15.7047, 100.1372),
    "Uthai Thani": (15.3835, 100.0246),
    "Kamphaeng Phet": (16.4828, 99.5227),
    "Tak": (16.8837, 99.1258),
    "Sukhothai": (17.0077, 99.8230),
    "Phitsanulok": (16.8211, 100.2659),
    "Phichit": (16.4418, 100.3486),
    "Phetchabun": (16.4190, 101.1562),
    "Ratchaburi": (13.5283, 99.8135),
    "Kanchanaburi": (14.0228, 99.5328),
    "Suphan Buri": (14.4745, 100.1177),
    "Nakhon Pathom": (13.8198, 100.0601),
    "Samut Sakhon": (13.5475, 100.2744),
    "Samut Songkhram": (13.4098, 100.0023),
    "Phetchaburi": (13.1069, 99.9438),
    "Prachuap Khiri Khan": (11.8124, 99.7973),
    "Nakhon Si Thammarat": (8.4309, 99.9631),
    "Krabi": (8.0863, 98.9063),
    "Phangnga": (8.4501, 98.5255),
    "Phuket": (7.8804, 98.3923),
    "Surat Thani": (9.1482, 99.3262),
    "Ranong": (9.9658, 98.6348),
    "Chumphon": (10.4930, 99.1800),
    "Songkhla": (7.1988, 100.5951),
    "Satun": (6.6238, 100.0674),
    "Trang": (7.5563, 99.6114),
    "Phatthalung": (7.6172, 100.0708),
    "Pattani": (6.8696, 101.2501),
    "Yala": (6.5411, 101.2804),
    "Narathiwat": (6.4255, 101.8253),
    "Bueng Kan": (18.3624, 103.6532)
}

import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/locations")
def get_order_locations(db: Session = Depends(get_db)):
    features = []

    # 1. Get Order Locations (grouped by city/province)
    order_counts = db.query(
        models.Address.province,
        func.count(models.Order.id).label("count")
    ).join(models.Order, models.Order.address_id == models.Address.id)\
     .filter(models.Order.status.in_([
         models.OrderStatus.PAID,
         models.OrderStatus.SHIPPED,
         models.OrderStatus.COMPLETED
     ]))\
     .group_by(models.Address.province).all()

    for province, count in order_counts:
        coords = PROVINCE_COORDINATES.get(province)
        if not coords:
            for p_name, p_coords in PROVINCE_COORDINATES.items():
                if p_name.lower() == province.lower():
                    coords = p_coords
                    break
        
        if coords:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [coords[1], coords[0]]
                },
                "properties": {
                    "type": "order",
                    "province": province,
                    "count": count
                }
            })
            
    # 2. Get Visitor Locations and Aggregate by Province
    visitor_results = db.query(
        func.ST_AsGeoJSON(models.VisitorLocation.location).label("geojson")
    ).all()
    
    visitor_province_counts = {}

    for row in visitor_results:
        if row.geojson:
            geometry = json.loads(row.geojson)
            # GeoJSON coordinates are [lng, lat]
            lng, lat = geometry['coordinates']
            
            # Find nearest province
            nearest_province = None
            min_dist = float('inf')
            
            for p_name, p_coords in PROVINCE_COORDINATES.items():
                # p_coords is (lat, lng)
                dist = haversine(lat, lng, p_coords[0], p_coords[1])
                if dist < min_dist:
                    min_dist = dist
                    nearest_province = p_name
            
            if nearest_province:
                visitor_province_counts[nearest_province] = visitor_province_counts.get(nearest_province, 0) + 1

    # Add aggregated visitor features
    for province, count in visitor_province_counts.items():
        coords = PROVINCE_COORDINATES[province]
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [coords[1], coords[0]]
            },
            "properties": {
                "type": "visitor_province",
                "province": province,
                "count": count
            }
        })
            
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/users/count")
def get_user_count(db: Session = Depends(get_db)):
    count = db.query(models.User).count()
    return {"count": count}

@router.post("/visitor")
def record_visitor_location(location_data: schemas.VisitorLocationCreate, db: Session = Depends(get_db)):
    location_wkt = f"POINT({location_data.longitude} {location_data.latitude})"
    visitor_location = models.VisitorLocation(location=location_wkt)
    db.add(visitor_location)
    db.commit()
    return {"message": "Visitor location recorded"}

@router.get("/visitors/count")
def get_visitor_count(db: Session = Depends(get_db)):
    count = db.query(models.VisitorLocation).count()
    return {"count": count}

@router.get("/orders/stats")
def get_order_stats(db: Session = Depends(get_db)):
    total_orders = db.query(models.Order).count()
    total_revenue = db.query(func.sum(models.Order.total_price)).scalar() or 0.0
    
    status_counts = db.query(
        models.Order.status,
        func.count(models.Order.id)
    ).group_by(models.Order.status).all()
    
    recent_orders = db.query(models.Order).order_by(models.Order.created_at.desc()).limit(5).all()
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "status_counts": {status: count for status, count in status_counts},
        "recent_orders": recent_orders
    }

from typing import Optional

@router.get("/products/stats")
def get_product_stats(q: Optional[str] = None, db: Session = Depends(get_db)):
    if q:
        # Search products by name
        search_results = db.query(
            models.Product,
            func.sum(models.OrderItem.quantity).label("total_sold")
        ).outerjoin(models.OrderItem)\
         .filter(models.Product.name.ilike(f"%{q}%"))\
         .group_by(models.Product.id)\
         .all()
         
        results_data = []
        for product, total_sold in search_results:
            total_sold = total_sold or 0
            results_data.append({
                "id": product.id,
                "name": product.name,
                "stock": product.stock,
                "total_sold": total_sold,
                "revenue": total_sold * product.price
            })
            
        return {"search_results": results_data}

    # Top selling products
    top_selling = db.query(
        models.Product,
        func.sum(models.OrderItem.quantity).label("total_sold")
    ).join(models.OrderItem)\
     .group_by(models.Product.id)\
     .order_by(func.sum(models.OrderItem.quantity).desc())\
     .limit(5).all()
     
    top_selling_data = []
    for product, total_sold in top_selling:
        top_selling_data.append({
            "id": product.id,
            "name": product.name,
            "total_sold": total_sold,
            "revenue": total_sold * product.price
        })

    # Low stock products
    low_stock = db.query(models.Product).filter(models.Product.stock < 10).all()
    
    return {
        "top_selling": top_selling_data,
        "low_stock": low_stock
    }
