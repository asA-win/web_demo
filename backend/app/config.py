import os
import json
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:root@localhost:5433/dubai_restaurant"
    SECRET_KEY: str = "dubai_luxury_restaurant_secret_key_super_secure_2026_jwt_token_sign"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    RESTAURANT_NAME: str = "Layali Dubai — Royal Lounge & Dining"
    RESTAURANT_CURRENCY: str = "AED"

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
