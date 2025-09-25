# 백엔드 구조 및 파일 설명

이 문서는 백엔드 코드를 이해하기 위한 상세한 가이드입니다. 각 파일의 역할과 코드의 동작 원리를 한국어로 설명합니다.

## 📁 전체 폴더 구조

```
backend/
├── src/                    # 소스 코드 폴더
│   ├── index.js           # 메인 서버 파일 (시작점)
│   ├── config/            # 설정 파일들
│   │   └── database.js    # 데이터베이스 연결 설정
│   ├── middleware/        # 미들웨어 함수들
│   │   └── auth.js        # 사용자 인증/권한 관리
│   ├── models/            # 데이터 모델 정의
│   │   ├── User.js        # 사용자 데이터 구조
│   │   ├── TypingTest.js  # 타이핑 테스트 데이터 구조
│   │   └── TypingText.js  # 타이핑 텍스트 데이터 구조
│   ├── routes/            # API 엔드포인트들
│   │   ├── auth.js        # 로그인/회원가입 API
│   │   ├── user.js        # 사용자 정보 관리 API
│   │   ├── typing.js      # 타이핑 테스트 관련 API
│   │   ├── ai.js          # AI 기능 API
│   │   └── analytics.js   # 통계/분석 API
│   └── services/          # 외부 서비스 연동
│       └── aiService.js   # OpenAI API 연동
├── package.json           # 프로젝트 설정 및 의존성
└── .env                   # 환경변수 (비밀 정보들)
```

## 🚀 서버 시작 과정

1. **`src/index.js`** - 서버의 시작점

   - Express 웹 서버 생성
   - 미들웨어 설정 (보안, 압축, 로그 등)
   - 데이터베이스 연결
   - API 라우트 연결
   - 에러 처리 설정

2. **`src/config/database.js`** - MongoDB 연결
   - 환경변수에서 데이터베이스 주소 읽기
   - MongoDB 연결 시도
   - 연결 상태 모니터링

## 🔐 인증 시스템 (`src/middleware/auth.js`)

### JWT 토큰 기반 인증

- **로그인 시**: 사용자에게 JWT 토큰 발급
- **API 요청 시**: 토큰을 검증하여 사용자 신원 확인
- **보안**: 비밀키로 토큰 암호화

### 주요 함수들

- `generateToken()`: 새 토큰 생성
- `authenticate()`: 필수 로그인 확인
- `optionalAuth()`: 선택적 로그인 확인
- `authorize()`: 구독 플랜별 권한 확인

## 📊 데이터 모델들

### 1. User 모델 (`src/models/User.js`)

사용자의 모든 정보를 저장하는 구조:

```javascript
{
  // 기본 정보
  username: "사용자명",
  email: "이메일",
  password: "암호화된 비밀번호",

  // 프로필
  profile: {
    level: "beginner|intermediate|advanced|expert",
    goal: { targetWPM: 40, targetAccuracy: 95 }
  },

  // 통계
  statistics: {
    totalTests: 0,           // 총 테스트 수
    bestWPM: 0,             // 최고 속도
    averageAccuracy: 0       // 평균 정확도
  },

  // 설정
  preferences: {
    theme: "light|dark|system",
    typingSettings: { showKeyboard: true }
  }
}
```

### 2. TypingTest 모델 (`src/models/TypingTest.js`)

각 타이핑 테스트의 결과를 저장:

```javascript
{
  userId: "사용자 ID",
  textContent: "타이핑한 텍스트",
  userInput: "사용자가 실제 입력한 내용",

  results: {
    wpm: 45,                // 분당 단어수
    accuracy: 92.5,         // 정확도 (%)
    timeElapsed: 120        // 소요 시간 (초)
  },

  analysis: {
    errorAnalysis: {
      mostMissedCharacters: ["a", "s", "d"],
      commonMistakes: [{ from: "a", to: "s", count: 3 }]
    }
  }
}
```

## 🛤️ API 라우트들

### 1. 인증 라우트 (`src/routes/auth.js`)

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `PUT /api/auth/change-password` - 비밀번호 변경

### 2. 타이핑 라우트 (`src/routes/typing.js`)

- `POST /api/typing/test/start` - 테스트 시작
- `POST /api/typing/test/:id/complete` - 테스트 완료
- `GET /api/typing/tests` - 테스트 기록 조회
- `GET /api/typing/texts` - 텍스트 목록 조회

### 3. AI 라우트 (`src/routes/ai.js`)

- `POST /api/ai/generate-text` - AI 텍스트 생성
- `GET /api/ai/recommend-texts` - 맞춤형 텍스트 추천
- `POST /api/ai/analyze-performance` - 성과 분석

## 🔄 데이터 흐름 예시

### 타이핑 테스트 완료 과정:

1. **프론트엔드**에서 테스트 완료 요청

   ```javascript
   POST /api/typing/test/123/complete
   {
     "userInput": "사용자가 입력한 텍스트",
     "wpm": 45,
     "accuracy": 92.5,
     "timeElapsed": 120
   }
   ```

2. **`auth.js` 미들웨어**에서 로그인 확인

3. **`typing.js` 라우트**에서:

   - 입력 데이터 검증
   - 데이터베이스에서 테스트 찾기
   - 결과 계산 및 저장
   - 사용자 통계 업데이트

4. **AI 분석** (선택적):

   - `aiService.js`에서 OpenAI API 호출
   - 개선점 및 추천사항 생성

5. **응답 반환**:
   ```javascript
   {
     "message": "테스트 완료",
     "test": { /* 테스트 결과 */ },
     "aiAnalysis": { /* AI 분석 결과 */ }
   }
   ```

## 🔧 주요 개념들

### 1. 미들웨어 (Middleware)

- 모든 요청이 거쳐가는 함수들
- 인증, 로깅, 에러 처리 등을 담당
- 체인 형태로 연결되어 순차 실행

### 2. 스키마 (Schema)

- 데이터베이스에 저장될 데이터의 구조 정의
- 데이터 타입, 필수 여부, 기본값 등 설정
- 자동 검증 및 변환 수행

### 3. 라우트 (Route)

- URL 경로별로 실행될 함수들 정의
- HTTP 메서드(GET, POST, PUT, DELETE)별 처리
- 미들웨어와 비즈니스 로직 연결

### 4. 비동기 처리

- `async/await` 사용으로 비동기 작업 처리
- 데이터베이스 작업, API 호출 등에 필수
- 에러 처리를 위한 try-catch 구문

## 🛡️ 보안 기능들

1. **비밀번호 암호화**: bcrypt 라이브러리 사용
2. **JWT 토큰**: 상태 없는 인증 시스템
3. **요청 제한**: 과도한 요청 방지
4. **입력 검증**: 모든 사용자 입력 검증
5. **CORS 설정**: 허용된 도메인만 접근 가능

## 📝 개발 시 주의사항

1. **환경변수**: 비밀키, DB 주소 등은 `.env` 파일에 보관
2. **에러 처리**: 모든 비동기 함수에 try-catch 사용
3. **데이터 검증**: 프론트엔드 데이터를 신뢰하지 말고 서버에서 재검증
4. **성능**: 데이터베이스 쿼리 최적화 및 인덱스 사용
5. **로깅**: 디버깅을 위한 충분한 로그 기록

## 🚀 서버 실행 방법

```bash
# 개발 모드 (코드 변경시 자동 재시작)
npm run dev

# 프로덕션 모드
npm start

# 테스트 실행
npm test
```

이 문서를 통해 백엔드 코드의 전체적인 구조와 동작 원리를 이해할 수 있습니다. 각 파일의 상세한 주석과 함께 읽으면 더욱 도움이 될 것입니다.
