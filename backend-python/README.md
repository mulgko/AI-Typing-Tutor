# AI 타이핑 튜터 - Python 백엔드 🐍

개인화된 타이핑 학습과 오타 패턴 분석을 제공하는 FastAPI 기반 백엔드입니다.

## 🚀 주요 기능

- **개인화된 학습**: 사용자별 약점 분석 및 맞춤형 문제 제공
- **오타 패턴 분석**: 자음/모음별 실수 패턴 추적 및 분석
- **실시간 피드백**: WebSocket을 통한 실시간 타이핑 피드백
- **AI 기반 텍스트 생성**: Google Gemini API를 활용한 학습 콘텐츠 생성
- **진도 추적**: 학습 효과 측정 및 성취도 시각화

## 🛠 기술 스택

- **웹 프레임워크**: FastAPI
- **데이터베이스**: Supabase (PostgreSQL)
- **AI/ML**: pandas, scikit-learn, Google Generative AI
- **인증**: JWT + bcrypt
- **배포**: uvicorn

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

```bash
# env.example을 .env로 복사
cp env.example .env

# .env 파일에서 실제 값들로 수정
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - GEMINI_API_KEY
```

### 3. 서버 실행

```bash
# 개발 서버 (자동 리로드)
python main.py

# 또는 uvicorn 직접 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. API 문서 확인

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 프로젝트 구조

```
backend-python/
├── main.py                 # 메인 애플리케이션
├── requirements.txt        # Python 의존성
├── env.example            # 환경 변수 예시
├── app/
│   ├── __init__.py
│   ├── config.py          # 설정 관리
│   ├── database.py        # Supabase 연결
│   ├── models/            # 데이터 모델
│   ├── routes/            # API 라우트
│   ├── services/          # 비즈니스 로직
│   └── utils/             # 유틸리티 함수
└── tests/                 # 테스트 코드
```

## 🔗 API 엔드포인트

### 기본

- `GET /` - 루트 엔드포인트
- `GET /health` - 서버 상태 확인

### 인증 (예정)

- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃

### 타이핑 테스트 (예정)

- `POST /typing/start` - 타이핑 테스트 시작
- `POST /typing/submit` - 결과 제출
- `GET /typing/history` - 테스트 기록

### 분석 및 추천 (예정)

- `GET /analytics/errors` - 오타 패턴 분석
- `GET /recommendations/words` - 맞춤형 단어 추천
- `GET /analytics/progress` - 학습 진도 조회

## 🔧 개발 도구

### 코드 포맷팅

```bash
black .
```

### 린팅

```bash
flake8 .
```

### 테스트

```bash
pytest
```

## 🌟 다음 단계

1. **Supabase 프로젝트 설정**
2. **데이터베이스 스키마 생성**
3. **인증 시스템 구현**
4. **타이핑 테스트 API 구현**
5. **오타 패턴 분석 시스템 구현**
6. **맞춤형 추천 알고리즘 구현**

---

**개발자**: AI 타이핑 튜터 팀  
**버전**: 1.0.0  
**라이선스**: MIT
