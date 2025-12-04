from app.database import SessionLocal
from app.models import User, Address, Order, Product, OrderItem, OrderStatus
from app.auth_utils import get_password_hash
from geoalchemy2.elements import WKTElement
import random

def seed_analytics():
    db = SessionLocal()
    try:
        # Create some products if not enough
        if db.query(Product).count() == 0:
            print("Please run seed_products.py first or ensure products exist.")
            return

        products = db.query(Product).all()
        
        # Provinces and their approx lat/long
        provinces = [
            {"name": "Phitsanulok", "lat": 16.8211, "lon": 100.2659, "weight": 5}, # Target: Most orders
            {"name": "Bangkok", "lat": 13.7563, "lon": 100.5018, "weight": 3},
            {"name": "Chiang Mai", "lat": 18.7883, "lon": 98.9853, "weight": 2},
            {"name": "Khon Kaen", "lat": 16.4322, "lon": 102.8236, "weight": 2},
            {"name": "Phuket", "lat": 7.8804, "lon": 98.3923, "weight": 1},
            {"name": "Songkhla", "lat": 7.1933, "lon": 100.5951, "weight": 1},
            {"name": "Nakhon Ratchasima", "lat": 14.9799, "lon": 102.0978, "weight": 1},
            {"name": "Chon Buri", "lat": 13.3611, "lon": 100.9847, "weight": 1},
        ]

        users = []
        addresses = []
        orders = []

        # Create 20 Users
        for i in range(1, 21):
            email = f"user{i}@example.com"
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    password_hash=get_password_hash("password123"),
                    full_name=f"Mock User {i}"
                )
                db.add(user)
                db.flush() # get id
            users.append(user)

            # Assign location based on weights to ensure Phitsanulok has most
            # We'll just round robin or random weighted
            # Let's force Phitsanulok for first 5 users, then random weighted
            if i <= 5:
                prov = provinces[0] # Phitsanulok
            else:
                # Simple weighted random
                choices = []
                for p in provinces:
                    choices.extend([p] * p['weight'])
                prov = random.choice(choices)

            # Create Address
            # Jitter location slightly so they don't stack perfectly (optional, but good for point map)
            # But for circle size aggregation, exact same location is fine or we group by city name.
            # Let's use exact coords for simplicity of grouping.
            
            lat = prov['lat']
            lon = prov['lon']
            
            address = Address(
                user_id=user.id,
                address_line=f"123 {prov['name']} Road",
                city=prov['name'],
                province=prov['name'],
                zip_code="10000"
            )
            db.add(address)
            db.flush()
            addresses.append(address)

            # Create Order
            order = Order(
                user_id=user.id,
                address_id=address.id,
                total_price=random.randint(500, 5000),
                status=OrderStatus.COMPLETED
            )
            db.add(order)
            db.flush()
            orders.append(order)

            # Create Order Items
            num_items = random.randint(1, 3)
            for _ in range(num_items):
                prod = random.choice(products)
                item = OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    quantity=random.randint(1, 2),
                    price_at_time=prod.price
                )
                db.add(item)

        db.commit()
        print("Successfully seeded 20 mock users and orders.")

    except Exception as e:
        print(f"Error seeding analytics: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_analytics()
