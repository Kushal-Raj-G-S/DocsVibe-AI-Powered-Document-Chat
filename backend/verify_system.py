"""
Quick system verification script
Checks: Neon DB, Supabase DB, R2 Storage
"""
import sys
import asyncio
from dotenv import load_dotenv

load_dotenv()

print("🔍 DocsVibe System Verification")
print("=" * 60)

# 1. Check Neon Database
print("\n1️⃣ Checking Neon Database (conversations/messages)...")
try:
    from database.db_config import engine
    from sqlalchemy import text
    
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result]
        print(f"   ✅ Connected to Neon")
        print(f"   📋 Tables: {tables}")
except Exception as e:
    print(f"   ❌ Neon Error: {e}")
    sys.exit(1)

# 2. Check Supabase Database
print("\n2️⃣ Checking Supabase Database (users/uploaded_files)...")
try:
    from database.dual_db_config import supabase_engine
    from sqlalchemy import text
    
    with supabase_engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result]
        print(f"   ✅ Connected to Supabase")
        print(f"   📋 Tables: {tables}")
except Exception as e:
    print(f"   ❌ Supabase Error: {e}")
    sys.exit(1)

# 3. Check R2 Storage
print("\n3️⃣ Checking Cloudflare R2 Storage...")
try:
    from utils.r2_storage import r2_storage
    
    # List buckets (read operation)
    buckets = r2_storage.s3_client.list_buckets()
    print(f"   ✅ Connected to R2")
    print(f"   🗂️ Buckets: {[b['Name'] for b in buckets['Buckets']]}")
except Exception as e:
    print(f"   ❌ R2 Error: {e}")
    sys.exit(1)

# 4. Summary
print("\n" + "=" * 60)
print("✅ All systems operational!")
print("\nArchitecture:")
print("  • Neon (3GB)      → Conversations & Messages")
print("  • Supabase (512MB) → Users & File Metadata")
print("  • R2 (10GB)       → Actual File Storage")
print("=" * 60)
