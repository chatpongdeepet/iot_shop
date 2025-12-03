from app.database import SessionLocal
from app.models import VisitorLocation
import random

def seed_visitors():
    db = SessionLocal()
    try:
        print("Seeding 50 anonymous visitors...")
        
        # Thailand approximate bounds
        min_lat, max_lat = 5.6, 20.5
        min_lon, max_lon = 97.3, 105.6
        
        for _ in range(50):
            # Generate random coordinates within Thailand
            lat = random.uniform(min_lat, max_lat)
            lon = random.uniform(min_lon, max_lon)
            
            # Create WKT point
            location_wkt = f"POINT({lon} {lat})"
            
            visitor = VisitorLocation(location=location_wkt)
            db.add(visitor)
            
        db.commit()
        print("Successfully seeded 50 anonymous visitors.")
        
    except Exception as e:
        print(f"Error seeding visitors: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_visitors()
