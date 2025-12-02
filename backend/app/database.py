import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

current_file_path = Path(__file__).resolve()
project_root = current_file_path.parent.parent.parent
dotenv_path = project_root/'.env'
load_dotenv(dotenv_path=dotenv_path)

db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")
db_host = os.getenv("POSTGRES_HOST")

DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://{db_user}:{db_password}@db:5432/{db_host}")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()