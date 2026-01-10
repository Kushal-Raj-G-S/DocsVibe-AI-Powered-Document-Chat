"""
Response Caching System
Caches API responses for 1 hour to reduce rate limit usage
Uses in-memory cache as fallback if Redis is not available
"""

import hashlib
import json
import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Try to import Redis, fallback to in-memory if not available
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available, using in-memory cache")


class CacheManager:
    """
    Manages response caching with 1-hour TTL
    Automatically falls back to in-memory cache if Redis unavailable
    """
    
    def __init__(self, redis_url: str = "redis://localhost:6379", ttl_hours: int = 1):
        self.ttl_seconds = ttl_hours * 3600
        self.redis_client = None
        self.memory_cache: Dict[str, Dict[str, Any]] = {}
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "errors": 0
        }
        
        # Try to connect to Redis
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                self.redis_client.ping()
                logger.info("✅ Connected to Redis cache")
            except Exception as e:
                logger.warning(f"⚠️ Redis connection failed: {e}. Using in-memory cache")
                self.redis_client = None
        else:
            logger.info("📦 Using in-memory cache (Redis not installed)")
    
    def _generate_cache_key(self, conversation_id: int, message: str, model: str, has_pdf: bool = False) -> str:
        """
        Generate a unique cache key based on conversation context
        Format: conv_{id}:model_{model}:pdf_{bool}:hash_{message_hash}
        """
        # Create hash of the message to keep key length reasonable
        message_hash = hashlib.md5(message.encode()).hexdigest()[:16]
        
        # Include PDF context in key to avoid wrong cache hits
        pdf_indicator = "with_pdf" if has_pdf else "no_pdf"
        
        cache_key = f"conv_{conversation_id}:model_{model}:{pdf_indicator}:hash_{message_hash}"
        return cache_key
    
    def get(self, conversation_id: int, message: str, model: str, has_pdf: bool = False) -> Optional[str]:
        """
        Retrieve cached response if available and not expired
        Returns None if cache miss
        """
        cache_key = self._generate_cache_key(conversation_id, message, model, has_pdf)
        
        try:
            if self.redis_client:
                # Try Redis first
                cached_data = self.redis_client.get(cache_key)
                if cached_data:
                    response_data = json.loads(cached_data)
                    self.cache_stats["hits"] += 1
                    logger.info(f"✅ Cache HIT for key: {cache_key}")
                    return response_data.get("response")
            else:
                # Use in-memory cache
                if cache_key in self.memory_cache:
                    cached_entry = self.memory_cache[cache_key]
                    # Check if expired
                    if cached_entry["expires_at"] > time.time():
                        self.cache_stats["hits"] += 1
                        logger.info(f"✅ Cache HIT (memory) for key: {cache_key}")
                        return cached_entry["response"]
                    else:
                        # Expired, remove it
                        del self.memory_cache[cache_key]
                        logger.debug(f"🗑️ Removed expired cache entry: {cache_key}")
            
            # Cache miss
            self.cache_stats["misses"] += 1
            logger.info(f"❌ Cache MISS for key: {cache_key}")
            return None
            
        except Exception as e:
            self.cache_stats["errors"] += 1
            logger.error(f"Cache retrieval error: {e}")
            return None
    
    def set(self, conversation_id: int, message: str, model: str, response: str, has_pdf: bool = False) -> bool:
        """
        Cache the API response for 1 hour
        Returns True if successfully cached
        """
        cache_key = self._generate_cache_key(conversation_id, message, model, has_pdf)
        
        try:
            cache_data = {
                "response": response,
                "model": model,
                "cached_at": datetime.utcnow().isoformat(),
                "conversation_id": conversation_id,
                "has_pdf": has_pdf
            }
            
            if self.redis_client:
                # Store in Redis with TTL
                self.redis_client.setex(
                    cache_key,
                    self.ttl_seconds,
                    json.dumps(cache_data)
                )
                logger.info(f"💾 Cached response in Redis: {cache_key} (TTL: {self.ttl_seconds}s)")
            else:
                # Store in memory with expiration timestamp
                self.memory_cache[cache_key] = {
                    "response": response,
                    "expires_at": time.time() + self.ttl_seconds,
                    "cached_at": cache_data["cached_at"]
                }
                logger.info(f"💾 Cached response in memory: {cache_key}")
            
            self.cache_stats["sets"] += 1
            return True
            
        except Exception as e:
            self.cache_stats["errors"] += 1
            logger.error(f"Cache storage error: {e}")
            return False
    
    def clear_conversation_cache(self, conversation_id: int) -> int:
        """
        Clear all cached responses for a specific conversation
        Returns number of keys deleted
        """
        try:
            pattern = f"conv_{conversation_id}:*"
            deleted_count = 0
            
            if self.redis_client:
                # Find and delete matching keys in Redis
                for key in self.redis_client.scan_iter(match=pattern):
                    self.redis_client.delete(key)
                    deleted_count += 1
            else:
                # Delete from memory cache
                keys_to_delete = [k for k in self.memory_cache.keys() if k.startswith(f"conv_{conversation_id}:")]
                for key in keys_to_delete:
                    del self.memory_cache[key]
                    deleted_count += 1
            
            logger.info(f"🗑️ Cleared {deleted_count} cache entries for conversation {conversation_id}")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error clearing conversation cache: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache performance statistics
        """
        total_requests = self.cache_stats["hits"] + self.cache_stats["misses"]
        hit_rate = (self.cache_stats["hits"] / total_requests * 100) if total_requests > 0 else 0
        
        stats = {
            **self.cache_stats,
            "total_requests": total_requests,
            "hit_rate_percent": round(hit_rate, 2),
            "cache_type": "redis" if self.redis_client else "memory",
            "ttl_hours": self.ttl_seconds / 3600
        }
        
        # Add memory cache size if using in-memory
        if not self.redis_client:
            stats["memory_cache_size"] = len(self.memory_cache)
        
        return stats
    
    def cleanup_expired(self):
        """
        Manually cleanup expired entries from memory cache
        (Redis handles this automatically with TTL)
        """
        if not self.redis_client:
            current_time = time.time()
            expired_keys = [
                key for key, value in self.memory_cache.items()
                if value["expires_at"] <= current_time
            ]
            
            for key in expired_keys:
                del self.memory_cache[key]
            
            if expired_keys:
                logger.info(f"🗑️ Cleaned up {len(expired_keys)} expired cache entries")


# Global cache manager instance
cache_manager = CacheManager()
