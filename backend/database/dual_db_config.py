"""
Dual Database Configuration
- Supabase: users + uploaded_files
- Neon: conversations + messages
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Neon - Chat data (conversations, messages)
NEON_URL = os.getenv("NEON_DATABASE_URL")
neon_engine = create_engine(NEON_URL) if NEON_URL else None
NeonSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=neon_engine) if neon_engine else None

# Supabase - Users + Files metadata
SUPABASE_URL = os.getenv("SUPABASE_DATABASE_URL")
supabase_engine = create_engine(SUPABASE_URL) if SUPABASE_URL else None
SupabaseSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=supabase_engine) if supabase_engine else None

# Backward compatibility
DATABASE_URL = os.getenv("DATABASE_URL", NEON_URL)
if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL)
elif DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Fallback to SQLite if no database URL provided
    engine = create_engine("sqlite:///./local_data.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Get Neon database session (for conversations/messages)"""
    if NeonSessionLocal:
        db = NeonSessionLocal()
    else:
        db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_supabase_db():
    """Get Supabase database session (for users/files)"""
    if SupabaseSessionLocal:
        db = SupabaseSessionLocal()
    else:
        db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
