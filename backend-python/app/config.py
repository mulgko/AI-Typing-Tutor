"""
설정 관리 모듈
환경 변수와 앱 설정을 관리합니다.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 서버 설정
    port: int = int(os.getenv("PORT", 8000))
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Supabase 설정
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # JWT 설정
    jwt_secret: str = os.getenv("JWT_SECRET", "your-secret-key")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", 1440))
    
    # AI 설정
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS 설정
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # 데이터베이스 설정
    database_url: Optional[str] = os.getenv("DATABASE_URL")

    
    class Config:
        env_file = ".env"

# 전역 설정 인스턴스
settings = Settings()

def get_settings() -> Settings:
    """설정 인스턴스 반환"""
    return settings
