from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .database import engine, Base
from .routers import auth, products, orders, analytics, cart, users, payments, upload

# Enable PostGIS extension if not exists
try:
    with engine.connect() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        connection.commit()
except Exception as e:
    print(f"Warning: Could not enable PostGIS extension. Error: {e}")

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://iot-shop.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(cart.router)
app.include_router(users.router)
app.include_router(payments.router)
app.include_router(upload.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to IoT Shop API"}