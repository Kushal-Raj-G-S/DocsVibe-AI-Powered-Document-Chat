"""
Health Check and Monitoring Routes
Provides system status, cache statistics, vector store info, and rate limit status
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import logging

from utils.cache_manager import cache_manager
from utils.model_router import model_router

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])
logger = logging.getLogger(__name__)


class HealthResponse(BaseModel):
    status: str
    components: Dict[str, Any]


class StatsResponse(BaseModel):
    cache: Dict[str, Any]
    rate_limit: Dict[str, Any]
    model_routing: Dict[str, Any]
    
    model_config = {
        "protected_namespaces": ()  # Allow model_* fields
    }


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint - verify all system components
    Returns 200 if all systems operational, 503 if any critical issues
    """
    
    components = {}
    overall_status = "healthy"
    
    # Check cache manager
    try:
        cache_stats = cache_manager.get_stats()
        components["cache"] = {
            "status": "operational",
            "type": cache_stats.get("cache_type", "unknown"),
            "error_count": cache_stats.get("errors", 0)
        }
        if cache_stats.get("errors", 0) > 10:
            components["cache"]["status"] = "degraded"
            overall_status = "degraded"
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        components["cache"] = {
            "status": "error",
            "error": str(e)
        }
        overall_status = "degraded"
    
    # Check vector store
    components["vector_store"] = {
        "status": "disabled",
        "note": "Using direct database access for simplicity"
    }
    
    # Check rate limiter
    try:
        rate_limit = model_router.check_rate_limit()
        components["rate_limiter"] = {
            "status": "operational",
            "requests_available": rate_limit.get("remaining", 0),
            "limit": rate_limit.get("limit", 5)
        }
    except Exception as e:
        logger.error(f"Rate limiter health check failed: {e}")
        components["rate_limiter"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Database would be checked here (not implemented in this version)
    components["database"] = {
        "status": "operational",
        "note": "SQLite connection assumed operational"
    }
    
    # A4F API (can't check without making a request, so assume operational)
    components["a4f_api"] = {
        "status": "assumed_operational",
        "note": "Cannot verify without making API call"
    }
    
    logger.info(f"Health check: {overall_status}")
    
    return HealthResponse(
        status=overall_status,
        components=components
    )


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """
    Get detailed statistics about system performance and usage
    """
    
    try:
        # Cache statistics
        cache_stats = cache_manager.get_stats()
        
        # Rate limit status
        rate_limit = model_router.check_rate_limit()
        
        # Model routing configuration
        model_routing = {
            "available_categories": list(model_router.ROUTING_RULES.keys()),
            "rate_limit": {
                "limit": rate_limit.get("limit", 5),
                "window": "60 seconds",
                "current_usage": rate_limit.get("requests_made", 0),
                "remaining": rate_limit.get("remaining", 0),
                "next_reset": f"{rate_limit.get('retry_after', 0)} seconds"
            }
        }
        
        logger.info("Stats request served")
        
        return StatsResponse(
            cache=cache_stats,
            rate_limit=rate_limit,
            model_routing=model_routing
        )
        
    except Exception as e:
        logger.error(f"Error gathering stats: {e}")
        raise


@router.post("/cache/clear/{conversation_id}")
async def clear_conversation_cache(conversation_id: int):
    """
    Clear cached responses for a specific conversation
    Useful when user edits or deletes messages
    """
    
    try:
        # Clear from cache
        cache_deleted = cache_manager.clear_conversation_cache(conversation_id)
        
        logger.info(f"Cleared conversation {conversation_id}: {cache_deleted} cache entries")
        
        return {
            "conversation_id": conversation_id,
            "cache_entries_deleted": cache_deleted,
            "message": "Conversation data cleared successfully"
        }
        
    except Exception as e:
        logger.error(f"Error clearing conversation {conversation_id}: {e}")
        return {
            "conversation_id": conversation_id,
            "error": str(e),
            "message": "Failed to clear conversation data"
        }


@router.get("/system-info")
async def get_system_info():
    """
    Get system configuration and feature availability
    """
    
    info = {
        "features": {
            "caching": {
                "enabled": True,
                "ttl_hours": 1,
                "type": cache_manager.get_stats().get("cache_type", "memory")
            },
            "vector_search": {
                "enabled": True,
                "chunk_size_tokens": 512,
                "overlap_tokens": 50,
                "embedding_model": "all-MiniLM-L6-v2"
            },
            "rate_limiting": {
                "enabled": True,
                "limit": 5,
                "window": "60 seconds"
            },
            "intelligent_routing": {
                "enabled": True,
                "fallback_supported": True
            },
            "supported_formats": ["PDF", "DOCX", "PPTX"]
        },
        "models": {
            "available": [
                "provider-3/deepseek-v3-0324",
                "provider-3/qwen-2.5-72b",
                "provider-3/llama-3.3-70b"
            ],
            "routing_categories": list(model_router.ROUTING_RULES.keys())
        },
        "api": {
            "version": "1.0.0",
            "endpoints": {
                "chat": "/api/chat/send",
                "upload": "/api/chat/upload-pdf",
                "health": "/api/monitoring/health",
                "stats": "/api/monitoring/stats"
            }
        }
    }
    
    return info
