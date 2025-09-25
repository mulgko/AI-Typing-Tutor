# AI 타이핑 튜터 설정 가이드

AI를 활용한 개인화된 타이핑 학습 시스템을 설정하고 실행하는 방법을 안내합니다.

## 🚀 빠른 시작

### 1. 사전 요구사항

- Node.js 18.0.0 이상
- MongoDB (로컬 또는 MongoDB Atlas)
- OpenAI API 키 (AI 기능 사용을 위해)

### 2. 레포지토리 클론

```bash
git clone <repository-url>
cd AI-Typing-Tutor
```

## 📦 백엔드 설정

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

```bash
# 환경 변수 파일 생성
cp env.example .env

# .env 파일 편집
nano .env
```

`.env` 파일에 다음 내용을 설정하세요:

```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스 (로컬 MongoDB)
MONGODB_URI=mongodb://localhost:27017/ai-typing-tutor

# 또는 MongoDB Atlas 사용시
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-typing-tutor

# JWT 시크릿 (강력한 임의의 문자열로 변경)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API 키 (https://platform.openai.com/api-keys 에서 발급)
OPENAI_API_KEY=sk-your-openai-api-key

# CORS 설정
FRONTEND_URL=http://localhost:3000

# 레이트 리미팅
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. MongoDB 설정

#### 로컬 MongoDB 사용

```bash
# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongod

# macOS (Homebrew)
brew install mongodb/brew/mongodb-community
brew services start mongodb-community

# Windows
# MongoDB Community Edition을 다운로드하고 설치
```

#### MongoDB Atlas 사용 (권장)

1. [MongoDB Atlas](https://cloud.mongodb.com/) 계정 생성
2. 새 클러스터 생성
3. 데이터베이스 사용자 추가
4. IP 주소 화이트리스트 설정
5. 연결 문자열을 `.env` 파일의 `MONGODB_URI`에 추가

### 4. 백엔드 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

서버가 성공적으로 시작되면 `http://localhost:3001`에서 접근할 수 있습니다.

## 🎨 프론트엔드 설정

### 1. 의존성 설치

```bash
cd front
npm install
```

### 2. 환경 변수 설정

```bash
# 환경 변수 파일 생성
cp env.local.example .env.local

# .env.local 파일 편집
nano .env.local
```

`.env.local` 파일에 다음 내용을 설정하세요:

```env
# API 설정 (백엔드 서버 주소)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 앱 정보
NEXT_PUBLIC_APP_NAME=AI 타이핑 튜터
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. 프론트엔드 서버 실행

```bash
# 개발 모드
npm run dev

# 빌드 후 실행
npm run build
npm start
```

프론트엔드가 성공적으로 시작되면 `http://localhost:3000`에서 접근할 수 있습니다.

## 🤖 OpenAI API 키 설정

AI 기능을 사용하려면 OpenAI API 키가 필요합니다:

1. [OpenAI Platform](https://platform.openai.com/api-keys)에 접속
2. 계정 생성 또는 로그인
3. "Create new secret key" 클릭
4. 생성된 키를 백엔드의 `.env` 파일에 추가

**주의**: API 키는 절대 공개하지 마세요. 프론트엔드에는 포함시키지 않습니다.

## 🧪 테스트 및 확인

### 1. 백엔드 API 테스트

```bash
# Health check
curl http://localhost:3001/health

# 응답 예시:
# {"status":"OK","timestamp":"2024-01-01T12:00:00.000Z","uptime":123.45}
```

### 2. 데이터베이스 연결 확인

백엔드 콘솔에서 다음 메시지를 확인하세요:

```
📦 MongoDB 연결됨: cluster0-shard-00-00.xxxxx.mongodb.net:27017
🚀 서버가 포트 3001에서 실행 중입니다.
```

### 3. AI 기능 테스트

프론트엔드에서 "새 지문 생성" 버튼을 클릭하여 AI 텍스트 생성이 작동하는지 확인하세요.

## 🚀 프로덕션 배포

### Docker를 사용한 배포

#### 백엔드 Docker 설정

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

#### 프론트엔드 Docker 설정

```dockerfile
# front/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/ai-typing-tutor
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - mongo

  frontend:
    build: ./front
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api
    depends_on:
      - backend

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 실행

```bash
# 환경 변수 설정
export JWT_SECRET=your-production-jwt-secret
export OPENAI_API_KEY=your-openai-api-key

# Docker Compose로 실행
docker-compose up -d
```

## 🔧 문제 해결

### 자주 발생하는 문제들

#### 1. MongoDB 연결 실패

- MongoDB 서비스가 실행 중인지 확인
- 연결 문자열이 올바른지 확인
- 방화벽 설정 확인

#### 2. OpenAI API 오류

- API 키가 올바른지 확인
- API 사용 한도 확인
- 네트워크 연결 확인

#### 3. CORS 오류

- 백엔드의 `FRONTEND_URL` 설정 확인
- 프론트엔드의 API URL 설정 확인

#### 4. 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000
lsof -i :3001

# 프로세스 종료
kill -9 <PID>
```

### 로그 확인

```bash
# 백엔드 로그
cd backend
npm run dev

# 프론트엔드 로그
cd front
npm run dev
```

## 📚 추가 자료

- [MongoDB 설치 가이드](https://docs.mongodb.com/manual/installation/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [Express.js 문서](https://expressjs.com/)

## 🆘 지원

문제가 발생하거나 질문이 있으시면:

1. GitHub Issues 확인
2. 문서 재검토
3. 로그 확인 후 이슈 리포트

즐거운 타이핑 연습 되세요! 🎯
