# 🤖 AI 타이핑 튜터

AI를 활용한 개인화된 타이핑 학습 시스템입니다. OpenAI GPT를 사용하여 사용자 실력에 맞는 맞춤형 연습 텍스트를 생성하고, 상세한 타이핑 분석과 개선 방안을 제공합니다.

## ✨ 주요 기능

### 🎯 AI 기반 맞춤형 학습

- **똑똑한 텍스트 생성**: 사용자 레벨과 약점에 맞는 AI 생성 연습 텍스트
- **실시간 피드백**: 타이핑 중 실시간 패턴 분석 및 개선점 제안
- **개인화된 추천**: 학습 기록 분석을 통한 맞춤형 연습 계획

### 📊 상세한 성과 분석

- **종합 통계**: WPM, 정확도, 타이핑 패턴 상세 분석
- **진행 추적**: 일별/주별/월별 실력 향상 그래프
- **약점 분석**: 개인별 취약 영역 식별 및 집중 연습 가이드

### 🎮 게임화 요소

- **레벨 시스템**: 실력 기반 자동 레벨업
- **도전과제**: 다양한 성취 목표와 배지 시스템
- **순위표**: 다른 사용자들과 실력 비교

### 🔍 고급 분석

- **키스트로크 분석**: 키 입력 패턴과 리듬 분석
- **에러 패턴 식별**: 자주 실수하는 문자와 단어 추적
- **예측 분석**: 목표 달성 예상 시기 계산

## 🏗️ 시스템 구조

```
AI-Typing-Tutor/
├── frontend/          # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/       # 페이지 컴포넌트
│   │   ├── components/ # UI 컴포넌트
│   │   └── lib/       # API 클라이언트
│   └── package.json
├── backend/           # Express.js 백엔드
│   ├── src/
│   │   ├── models/    # MongoDB 스키마
│   │   ├── routes/    # API 라우트
│   │   ├── services/  # AI 서비스
│   │   └── middleware/ # 인증 미들웨어
│   └── package.json
└── SETUP_GUIDE.md     # 상세 설정 가이드
```

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd AI-Typing-Tutor
```

### 2. 백엔드 설정

```bash
cd backend
npm install
cp env.example .env
# .env 파일에 MongoDB URI와 OpenAI API 키 설정
npm run dev
```

### 3. 프론트엔드 설정

```bash
cd front
npm install
cp env.local.example .env.local
npm run dev
```

### 4. 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001

> 📚 상세한 설정 방법은 [SETUP_GUIDE.md](SETUP_GUIDE.md)를 참고하세요.

## 🔧 기술 스택

### Frontend

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Radix UI** - 접근성 좋은 UI 컴포넌트
- **Zustand** - 상태 관리

### Backend

- **Node.js** - 런타임
- **Express.js** - 웹 프레임워크
- **MongoDB** - 데이터베이스
- **JWT** - 인증
- **OpenAI API** - AI 텍스트 생성 및 분석

### AI & 분석

- **OpenAI GPT** - 텍스트 생성 및 피드백
- **실시간 타이핑 분석** - 키스트로크 패턴 분석
- **통계 알고리즘** - 성과 측정 및 예측

## 📱 주요 화면

### 메인 타이핑 테스트

- 실시간 WPM/정확도 표시
- 시각적 타이핑 피드백
- AI 생성 맞춤형 텍스트

### 대시보드

- 종합 성과 분석
- 진행 상황 그래프
- AI 추천 사항

### 분석 페이지

- 상세 타이핑 패턴 분석
- 약점 영역 시각화
- 개선 로드맵

## 🎯 AI 기능 상세

### 텍스트 생성

- 사용자 레벨에 맞는 난이도 조절
- 약점 영역 집중 연습을 위한 특화 텍스트
- 다양한 주제와 카테고리 지원

### 성능 분석

- 타이핑 패턴 및 리듬 분석
- 에러 유형별 분류 및 피드백
- 개인화된 학습 계획 생성

### 실시간 피드백

- 타이핑 중 즉시 패턴 분석
- 개선점 실시간 제안
- 동기부여를 위한 긍정적 피드백

## 🛠️ 개발 및 기여

### 개발 환경 설정

```bash
# 전체 프로젝트 설정
git clone <repository-url>
cd AI-Typing-Tutor

# 백엔드 개발 서버
cd backend
npm install
npm run dev

# 프론트엔드 개발 서버
cd front
npm install
npm run dev
```

### 기여 방법

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 🤝 지원 및 문의

- 🐛 버그 리포트: GitHub Issues
- 💡 기능 제안: GitHub Discussions
- 📧 문의: [이메일 주소]

## 🌟 로드맵

### v1.1 (예정)

- [ ] 모바일 앱 지원
- [ ] 음성 피드백 기능
- [ ] 멀티플레이어 모드

### v1.2 (예정)

- [ ] 다국어 지원
- [ ] 커스텀 키보드 레이아웃
- [ ] 고급 통계 대시보드

---

**AI 타이핑 튜터**로 더 효율적이고 즐거운 타이핑 연습을 시작하세요! 🚀
