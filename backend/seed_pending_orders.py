from app.database import SessionLocal
from app.models import User, Order, OrderItem, Product, OrderStatus, Address
import random
from datetime import datetime, timedelta

def seed_pending_orders():
    db = SessionLocal()
    try:
        print("Seeding pending orders...")
        
        users = db.query(User).all()
        products = db.query(Product).all()
        
        if not users or not products:
            print("No users or products found. Please run seed_products.py and ensure users exist.")
            return

        # Create 10 pending orders
        for _ in range(10):
            user = random.choice(users)
            
            # Try to find an address for the user, or skip if none (or create one?)
            # For simplicity, let's assume users have addresses or allow null address for pending?
            # The model allows nullable address_id? Let's check. 
            # Looking at models.py: address_id = Column(Integer, ForeignKey("addresses.id"), nullable=True)
            # So it is nullable.
            
            address = db.query(Address).filter(Address.user_id == user.id).first()
            
            order = Order(
                user_id=user.id,
                address_id=address.id if address else None,
                status=OrderStatus.PENDING,
                created_at=datetime.now() - timedelta(minutes=random.randint(1, 120)) # Recent
            )
            db.add(order)
            db.flush() # Get ID
            
            # Add items
            total_price = 0
            num_items = random.randint(1, 4)
            for _ in range(num_items):
                product = random.choice(products)
                quantity = random.randint(1, 3)
                price = product.price
                
                item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    price_at_time=price
                )
                db.add(item)
                total_price += price * quantity
            
            order.total_price = total_price
            
        db.commit()
        print("Successfully seeded 10 pending orders.")
        
    except Exception as e:
        print(f"Error seeding pending orders: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_pending_orders()
