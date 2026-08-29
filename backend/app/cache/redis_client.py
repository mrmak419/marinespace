"""Redis caching wrapper for API responses."""
import json
import os
from typing import Optional

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class CacheClient:
    def __init__(self):
        self.client = None
        self._connected = False
    
    def connect(self):
        if not REDIS_AVAILABLE:
            return
        
        redis_url = os.getenv("REDIS_URL")
        redis_token = os.getenv("REDIS_TOKEN")
        
        if redis_url and redis_token:
            try:
                self.client = redis.from_url(
                    redis_url,
                    password=redis_token,
                    decode_responses=True,
                )
                self.client.ping()
                self._connected = True
            except Exception:
                self._connected = False
    
    async def get(self, key: str) -> Optional[dict]:
        if not self._connected:
            return None
        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except Exception:
            return None
    
    async def set(self, key: str, value: dict, ttl_seconds: int = 1800):
        if not self._connected:
            return
        try:
            self.client.setex(key, ttl_seconds, json.dumps(value))
        except Exception:
            pass


cache = CacheClient()
