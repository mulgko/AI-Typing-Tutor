# AI 타이핑 튜터 백엔드

AI를 활용한 개인화된 타이핑 학습 시스템의 백엔드 서버입니다.

## 주요 기능

### 🤖 AI 기능

- **AI 텍스트 생성**: OpenAI GPT를 활용한 맞춤형 타이핑 연습 텍스트 생성
- **성능 분석**: 타이핑 패턴 분석 및 개인화된 피드백 제공
- **학습 추천**: 사용자 데이터 기반 맞춤형 학습 계획 생성
- **실시간 피드백**: 타이핑 중 실시간 분석 및 개선점 제안

### 📊 데이터 분석

- **상세 통계**: WPM, 정확도, 타이핑 패턴 분석
- **진행 추적**: 학습 진도 및 개선 사항 시각화
- **약점 분석**: 개인별 약점 영역 식별 및 개선 방안 제시
- **예측 분석**: 목표 달성 예상 시기 및 필요 연습량 계산

### 👤 사용자 관리

- **계정 관리**: 회원가입, 로그인, 프로필 관리
- **레벨 시스템**: 실력 기반 자동 레벨업
- **도전과제**: 다양한 성취 목표 및 보상 시스템
- **순위표**: 사용자 간 성과 비교

## 설치 및 실행

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요
```

### 2. 환경 변수 설정

`.env` 파일에 다음 값들을 설정하세요:

```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스
MONGODB_URI=mongodb://localhost:27017/ai-typing-tutor

# JWT 시크릿
JWT_SECRET=your-super-secret-jwt-key

# OpenAI API 키
OPENAI_API_KEY=your-openai-api-key

# CORS 설정
FRONTEND_URL=http://localhost:3000
```

### 3. 데이터베이스 설정

MongoDB를 설치하고 실행하거나 MongoDB Atlas를 사용하세요.

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## API 엔드포인트

### 인증 (`/api/auth`)

- `POST /register` - 회원가입
- `POST /login` - 로그인
- `GET /me` - 사용자 정보 조회
- `PUT /change-password` - 비밀번호 변경
- `DELETE /delete-account` - 계정 삭제

### 사용자 (`/api/user`)

- `GET /profile` - 프로필 조회
- `PUT /profile` - 프로필 업데이트
- `GET /statistics` - 사용자 통계
- `POST /check-levelup` - 레벨업 확인
- `GET /achievements` - 도전과제 조회
- `GET /leaderboard` - 순위표 조회

### 타이핑 (`/api/typing`)

- `POST /test/start` - 타이핑 테스트 시작
- `POST /test/:testId/complete` - 타이핑 테스트 완료
- `GET /tests` - 테스트 기록 조회
- `GET /test/:testId` - 특정 테스트 상세 조회
- `GET /texts` - 타이핑 텍스트 목록
- `GET /text/:textId` - 특정 텍스트 조회

### AI 서비스 (`/api/ai`)

- `POST /generate-text` - AI 텍스트 생성
- `GET /recommend-texts` - 맞춤형 텍스트 추천
- `POST /analyze-performance` - 성능 분석
- `POST /generate-study-plan` - 학습 계획 생성

### 분석 (`/api/analytics`)

- `GET /dashboard` - 대시보드 데이터
- `GET /performance` - 상세 성능 분석
- `GET /learning-patterns` - 학습 패턴 분석
- `GET /predictions` - 예측 분석
- `GET /compare` - 비교 분석
- `GET /recommendations` - 맞춤형 추천

## 데이터베이스 스키마

### User (사용자)

- 기본 정보 (이름, 이메일, 비밀번호)
- 프로필 (레벨, 목표, 아바타)
- 통계 (총 테스트, 최고 기록, 평균 등)
- 환경설정 (테마, 알림 등)

### TypingTest (타이핑 테스트)

- 테스트 결과 (WPM, 정확도, 시간)
- 키스트로크 데이터
- AI 분석 결과
- 에러 패턴 분석

### TypingText (타이핑 텍스트)

- 텍스트 내용 및 메타데이터
- 난이도 및 카테고리
- 사용 통계
- AI 생성 정보

## 개발 가이드

### 새로운 API 추가

1. `src/routes/` 폴더에 라우터 파일 생성
2. `src/index.js`에 라우터 등록
3. 필요시 미들웨어 추가
4. 테스트 작성

### AI 서비스 확장

1. `src/services/aiService.js`에 새로운 메서드 추가
2. OpenAI API 설정 확인
3. 에러 처리 및 fallback 로직 구현

### 데이터베이스 스키마 변경

1. `src/models/` 폴더의 모델 파일 수정
2. 마이그레이션 스크립트 작성 (필요시)
3. 기존 데이터와의 호환성 확인

## 보안 고려사항

- JWT 토큰 기반 인증
- 비밀번호 해싱 (bcrypt)
- Rate limiting 적용
- CORS 설정
- 입력값 검증 (express-validator)
- Helmet을 통한 보안 헤더 설정

## 성능 최적화

- MongoDB 인덱스 최적화
- 캐싱 전략 (향후 Redis 도입 고려)
- API 응답 압축 (compression)
- 페이지네이션 구현
- 병렬 처리 최적화

## 배포

### Docker를 사용한 배포

```bash
# Dockerfile 작성 후
docker build -t ai-typing-tutor-backend .
docker run -p 3001:3001 ai-typing-tutor-backend
```

### 환경별 설정

- development: 개발 환경
- production: 프로덕션 환경
- test: 테스트 환경

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
