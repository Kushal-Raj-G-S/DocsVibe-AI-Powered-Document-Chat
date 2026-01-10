"""
DocsVibe Backend API
Complete AI-powered document chat assistant with:
- Response caching (1 hour TTL)
- Vector semantic search
- Intelligent model routing
- Rate limiting (5 req/min)
- Multi-format support (PDF, DOCX, PPTX)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging
import sys

from database.db_config import init_db
from routes import conversation_routes, chat_routes
from routes import monitoring_routes, file_router_routes, user_routes

# Load environment variables
load_dotenv()

# Configure logging (ASCII-safe for Windows) - NO FILE LOGGING to avoid reload loops
logging.basicConfig(
    level=logging.INFO,  # Set to INFO to reduce noise
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Silence noisy libraries
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)

# Set console encoding to UTF-8 if possible (Windows fix)
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

logger = logging.getLogger(__name__)


# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(">>> Starting DocsVibe Backend...")
    
    # Initialize database
    init_db()
    logger.info("[OK] Database initialized")
    
    # Initialize cache manager
    try:
        from utils.cache_manager import cache_manager
        cache_stats = cache_manager.get_stats()
        logger.info(f"[OK] Cache manager ready - Type: {cache_stats['cache_type']}")
    except Exception as e:
        logger.warning(f"[WARN] Cache manager initialization issue: {e}")
    
    logger.info(">>> DocsVibe Backend READY!")
    
    yield
    
    # Shutdown
    logger.info(">>> Shutting down DocsVibe Backend...")


# Initialize FastAPI app
app = FastAPI(
    title="DocsVibe API",
    description="AI-powered document chat assistant with intelligent routing, caching, and semantic search",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://docsvibe.vercel.app",
        "https://www.docsvibe.app",
        "https://docsvibe.app",
        "https://api.docsvibe.app",
        "https://docs-vibe-6giqc.ondigitalocean.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(conversation_routes.router)
app.include_router(chat_routes.router)
app.include_router(monitoring_routes.router)
app.include_router(file_router_routes.router)
app.include_router(user_routes.router)

@app.get("/")
def read_root():
    return {
        "service": "DocsVibe API",
        "status": "running",
        "version": "1.0.0",
        "features": [
            "Response Caching (1hr TTL)",
            "Vector Semantic Search",
            "Intelligent Model Routing",
            "Rate Limiting (5 req/min)",
            "Multi-format Support (PDF/DOCX/PPTX)"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/api/monitoring/health",
            "stats": "/api/monitoring/stats",
            "chat": "/api/chat/send",
            "upload": "/api/chat/upload-pdf"
        }
    }

@app.get("/health")
def simple_health():
    """Simple health check for load balancers"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_excludes=[
            "*.log",
            "chroma_db/*",
            "database/uploads/*",
            "database/*.db",
            "__pycache__/*"
        ],
        log_level="info"
    )

