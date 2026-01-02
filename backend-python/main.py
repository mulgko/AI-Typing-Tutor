"""
AI 타이핑 튜터 - Python FastAPI 백엔드
개인화된 학습 시스템과 오타 패턴 분석 기능을 제공합니다.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# Supabase 클라이언트 (나중에 추가)
# from supabase import create_client, Client

@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행되는 함수"""
    print("🚀 AI 타이핑 튜터 서버 시작!")
    yield
    print("👋 서버 종료")

# FastAPI 앱 생성
app = FastAPI(
    title="AI 타이핑 튜터 API",
    description="개인화된 타이핑 학습과 오타 패턴 분석을 제공하는 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 보안 설정
security = HTTPBearer()

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "AI 타이핑 튜터 API에 오신 것을 환영합니다! 🎯",
        "version": "1.0.0",
        "features": [
            "개인화된 타이핑 학습",
            "오타 패턴 분석",
            "맞춤형 문제 추천",
            "실시간 피드백"
        ]
    }

@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "message": "서버가 정상적으로 동작 중입니다! ✅"
    }

if __name__ == "__main__":
    # 개발 서버 실행
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)), 
        reload=True   
    )
 