from app.database import SessionLocal
from app.models import User, UserRole
from app.auth_utils import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        email = "admin@admin.com"
        password = "password1234"
        
        # Check if exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists.")
            # Update to admin if not
            if user.role != UserRole.ADMIN:
                user.role = UserRole.ADMIN
                db.commit()
                print(f"Updated {email} to admin role.")
            return

        hashed_password = get_password_hash(password)
        admin_user = User(
            email=email,
            password_hash=hashed_password,
            full_name="System Admin",
            role=UserRole.ADMIN
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin user created successfully.\nEmail: {email}\nPassword: {password}")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
