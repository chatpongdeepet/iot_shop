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

db_user = os.getenv("POSTGRES_USER", "postgres")
db_password = os.getenv("POSTGRES_PASSWORD", "postgres")
db_name = os.getenv("POSTGRES_DB", "iot_shop")

# Use localhost by default for local development if DATABASE_URL is not set
DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://{db_user}:{db_password}@localhost:5432/{db_name}")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()