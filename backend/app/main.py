from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# อนุญาตให้ React (ซึ่งมักจะรันที่ port 5173 หรือ 3000) เข้าถึง API ได้
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:3000", # React Create App default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # อนุญาตทุก Method (GET, POST, PUT, DELETE)
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}