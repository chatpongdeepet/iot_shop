from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, products, orders, analytics, cart, users, payments

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
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


@app.get("/")
def read_root():
    return {"message": "Welcome to IoT Shop API"}