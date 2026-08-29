from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # LLM
    gemini_api_key: str = ""
    
    # Database
    supabase_url: str = ""
    supabase_anon_key: str = ""
    
    # Cache
    redis_url: str = ""
    redis_token: str = ""
    
    # External APIs
    copernicus_username: str = ""
    copernicus_password: str = ""
    mosdac_username: str = ""
    mosdac_password: str = ""
    
    # App
    frontend_url: str = "http://localhost:5173"
    debug: bool = True
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
