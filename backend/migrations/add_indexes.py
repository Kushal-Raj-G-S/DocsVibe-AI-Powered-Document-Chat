"""
Migration: Add indexes for faster queries
Run this once to optimize database performance
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def add_indexes():
    """Add indexes to improve query performance"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Add index on updated_at if it doesn't exist
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
                ON conversations(updated_at DESC);
            """))
            
            # Add index on created_at if it doesn't exist
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_conversations_created_at 
                ON conversations(created_at DESC);
            """))
            
            # Add composite index for user_email + updated_at
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_conversations_user_updated 
                ON conversations(user_email, updated_at DESC);
            """))
            
            conn.commit()
            print("✅ Indexes added successfully!")
            
        except Exception as e:
            print(f"❌ Error adding indexes: {e}")
            conn.rollback()

if __name__ == "__main__":
    add_indexes()
