from app.database import SessionLocal
from app.models import Product, ProductImage
import random

def seed_products():
    db = SessionLocal()
    try:
        products = []
        categories = ["Sensors", "Boards", "Modules", "Accessories"]
        
        for i in range(1, 21):
            category = random.choice(categories)
            product = Product(
                name=f"IoT Product {i}",
                description=f"This is a description for IoT Product {i}. Great for your projects.",
                price=random.randint(100, 2000),
                stock=random.randint(10, 100),
                category=category
            )
            products.append(product)
            
        db.add_all(products)
        db.flush()
        
        # Add images
        for product in products:
            num_images = random.randint(1, 5)
            for j in range(num_images):
                img = ProductImage(
                    product_id=product.id,
                    image_url=f"https://picsum.photos/seed/{product.id}_{j}/300/200"
                )
                db.add(img)
                
        db.commit()
        print("Successfully added 20 mock products.")
    except Exception as e:
        print(f"Error seeding products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
