# 🔗 AI 타이핑 튜터 프론트엔드-백엔드 연결 가이드

AI 타이핑 튜터의 프론트엔드와 백엔드를 완전히 연결하여 실제 동작하는 애플리케이션으로 만드는 단계별 가이드입니다.

## 📋 현재 상태 분석

### ✅ **이미 준비된 것들**

- 백엔드 API 서버 (Express.js + MongoDB)
- 프론트엔드 UI 컴포넌트 (Next.js + TypeScript)
- API 클라이언트 라이브러리 (`/front/src/lib/api.ts`)
- 타입 정의 및 인터페이스
- 일부 API 호출 코드 (타이핑 테스트 완료 부분)

### ❌ **아직 연결되지 않은 부분들**

- 환경 변수 설정
- 사용자 인증 시스템 UI 연결
- AI 텍스트 생성 기능 연결
- 대시보드 데이터 로딩
- 사용자 프로필 및 통계 연결

## 🚀 1단계: 환경 설정

### 1.1 백엔드 환경 변수 설정

```bash
cd backend
cp env.example .env
```

`.env` 파일 편집:

```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스 (MongoDB Atlas 사용 권장)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-typing-tutor

# JWT 시크릿 (강력한 랜덤 문자열로 변경)
JWT_SECRET=your-super-strong-jwt-secret-key-change-this

# OpenAI API 키 (https://platform.openai.com/api-keys 에서 발급)
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS 설정
FRONTEND_URL=http://localhost:3000

# 레이트 리미팅
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 1.2 프론트엔드 환경 변수 설정

```bash
cd front
cp env.local.example .env.local
```

`.env.local` 파일 편집:

```env
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 앱 정보
NEXT_PUBLIC_APP_NAME=AI 타이핑 튜터
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🔧 2단계: 백엔드 서버 시작

```bash
cd backend
npm install
npm run dev
```

**확인사항:**

- `http://localhost:3001/health` 접속하여 서버 동작 확인
- MongoDB 연결 성공 메시지 확인
- 콘솔에 "🚀 서버가 포트 3001에서 실행 중입니다." 메시지 확인

## 🎨 3단계: 프론트엔드 서버 시작

```bash
cd front
npm install
npm run dev
```

**확인사항:**

- `http://localhost:3000` 접속하여 프론트엔드 로딩 확인
- 개발자 도구에서 API 연결 오류가 없는지 확인

## 🔗 4단계: 핵심 기능 연결

### 4.1 사용자 인증 시스템 연결

현재 프론트엔드에 로그인/회원가입 UI가 누락되어 있으므로 추가 필요:

```typescript
// /front/src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      console.log("로그인 성공:", response);
      router.push("/dashboard");
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">로그인</h1>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
```

### 4.2 AI 텍스트 생성 기능 활성화

현재 `page.tsx`의 `generateNewText` 함수를 수정:

```typescript
// /front/src/app/page.tsx 의 generateNewText 함수 수정
const generateNewText = async () => {
  setIsGenerating(true);
  setAiInsights({ recommendations: [], feedback: "" });

  try {
    // AI로 새 텍스트 생성
    const response = await aiApi.generateText({
      difficulty: "intermediate", // 사용자 레벨에 맞게 조정
      category: "general",
      length: "medium",
      focusAreas: [], // 사용자의 약점 영역 기반
    });

    if (response.text) {
      setCurrentText(response.text.content);

      // 백엔드에 새 테스트 시작 알림
      const testResponse = await typingApi.startTest({
        textId: response.text._id,
        textContent: response.text.content,
        testMode: "practice",
      });

      setCurrentTestId(testResponse.testId);

      toast({
        title: "새로운 AI 지문 생성!",
        description: "맞춤형 연습 텍스트가 준비되었습니다.",
      });
    }
  } catch (error) {
    console.error("AI 텍스트 생성 실패:", error);

    // 실패 시 기본 텍스트 사용
    const randomText =
      sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setCurrentText(randomText);

    toast({
      title: "오프라인 모드",
      description: "AI 연결 실패로 기본 텍스트를 사용합니다.",
      variant: "destructive",
    });
  } finally {
    setIsGenerating(false);
    resetTest();
  }
};
```

### 4.3 대시보드 데이터 연결

```typescript
// /front/src/app/dashboard/page.tsx 수정
"use client";

import { useEffect, useState } from "react";
import { analyticsApi, userApi } from "@/lib/api";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboard, stats] = await Promise.all([
          analyticsApi.getDashboard("month"),
          userApi.getStatistics("month"),
        ]);

        setDashboardData(dashboard.dashboard);
        setUserStats(stats.statistics);
      } catch (error) {
        console.error("대시보드 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">대시보드</h1>

      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">평균 WPM</h3>
            <p className="text-3xl font-bold text-blue-500">
              {userStats.averageWPM || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">평균 정확도</h3>
            <p className="text-3xl font-bold text-green-500">
              {userStats.averageAccuracy || 0}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">총 테스트</h3>
            <p className="text-3xl font-bold text-purple-500">
              {userStats.totalTests || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">연속 일수</h3>
            <p className="text-3xl font-bold text-orange-500">
              {userStats.streak?.current || 0}
            </p>
          </div>
        </div>
      )}

      {dashboardData && (
        <div>
          {/* 추가 대시보드 컴포넌트들 */}
          <p>더 자세한 분석 데이터가 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );
}
```

## 🧪 5단계: 연결 테스트

### 5.1 기본 연결 테스트

1. **백엔드 Health Check**

   ```bash
   curl http://localhost:3001/health
   # 예상 응답: {"status":"OK","timestamp":"...","uptime":...}
   ```

2. **프론트엔드에서 API 호출 테스트**
   - 브라우저 개발자 도구 → Network 탭 열기
   - AI 텍스트 생성 버튼 클릭
   - `http://localhost:3001/api/ai/generate-text` 요청 확인

### 5.2 회원가입/로그인 테스트

1. 회원가입 페이지 생성 및 테스트
2. 로그인 후 JWT 토큰이 localStorage에 저장되는지 확인
3. 인증이 필요한 API 호출 시 Authorization 헤더 포함 확인

### 5.3 데이터 플로우 테스트

1. **타이핑 테스트 완료** → 백엔드에 결과 저장 → 대시보드 반영
2. **AI 텍스트 생성** → OpenAI API 호출 → 프론트엔드에 표시
3. **사용자 통계** → MongoDB 쿼리 → 대시보드 업데이트

## 🔧 6단계: 문제 해결

### 6.1 CORS 오류

```javascript
// backend/src/index.js 에서 CORS 설정 확인
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
```

### 6.2 API 키 오류

- OpenAI API 키가 올바른지 확인
- API 사용 한도 및 결제 상태 확인
- 환경 변수가 올바르게 로드되는지 확인

### 6.3 MongoDB 연결 오류

- MongoDB Atlas 클러스터 상태 확인
- IP 주소 화이트리스트 설정 확인
- 데이터베이스 사용자 권한 확인

## 📈 7단계: 고급 기능 연결

### 7.1 실시간 통계 업데이트

```typescript
// 타이핑 테스트 완료 후 레벨업 체크
const checkLevelUp = async () => {
  try {
    const response = await userApi.checkLevelup();
    if (response.leveledUp) {
      toast({
        title: "레벨업! 🎉",
        description: `${response.oldLevel} → ${response.newLevel}`,
      });
    }
  } catch (error) {
    console.error("레벨업 체크 실패:", error);
  }
};
```

### 7.2 AI 추천 시스템

```typescript
// 사용자 맞춤 텍스트 추천
const loadRecommendedTexts = async () => {
  try {
    const response = await aiApi.getRecommendedTexts();
    setRecommendedTexts(response.recommendations);
  } catch (error) {
    console.error("추천 텍스트 로딩 실패:", error);
  }
};
```

## ✅ 8단계: 최종 확인 체크리스트

### 필수 기능

- [ ] 회원가입/로그인 동작
- [ ] AI 텍스트 생성 동작
- [ ] 타이핑 테스트 결과 저장
- [ ] 대시보드 데이터 표시
- [ ] 사용자 통계 업데이트

### 선택 기능

- [ ] 실시간 레벨업 시스템
- [ ] AI 성능 분석 및 추천
- [ ] 리더보드 표시
- [ ] 성취 시스템

### 성능 및 UX

- [ ] 로딩 상태 표시
- [ ] 에러 처리 및 사용자 피드백
- [ ] 오프라인 모드 대응
- [ ] 반응형 디자인

## 🚀 실행 가이드

1. **터미널 1**: 백엔드 서버

   ```bash
   cd backend
   npm run dev
   ```

2. **터미널 2**: 프론트엔드 서버

   ```bash
   cd front
   npm run dev
   ```

3. **브라우저**: `http://localhost:3000` 접속

4. **개발자 도구**: Network 탭에서 API 호출 확인

이제 AI 타이핑 튜터가 완전히 연결되어 실제로 동작하는 애플리케이션이 됩니다! 🎉

## 🆘 추가 지원

문제가 발생하면:

1. 브라우저 개발자 도구의 Console과 Network 탭 확인
2. 백엔드 서버 로그 확인
3. 환경 변수 설정 재확인
4. MongoDB와 OpenAI API 연결 상태 확인
