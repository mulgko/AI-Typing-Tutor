# 🍞 Toast 시스템 구축 가이드

## 🧠 사고 회로 (Thinking Process)

### 1단계: 요구사항 분석

```markdown:src/app/components/ui/toast/toast.md
❓ 무엇이 필요한가?
- 화면에 임시 알림 표시
- 여러 개 동시 표시 가능
- 자동으로 사라짐
- 수동 닫기 가능
- 애니메이션 효과
- 다크/라이트 모드 지원
```

### 2단계: 아키텍처 설계

```
🏗️ 어떻게 구성할 것인가?
1. 전역 상태 관리 (어디서든 호출 가능)
2. 컴포넌트 분리 (재사용성)
3. 애니메이션 시스템 (UX)
4. 스타일 시스템 (일관성)
```

### 3단계: 기술 선택

```
⚡ 어떤 기술을 사용할 것인가?
- React Hooks (상태 관리)
- Tailwind CSS (스타일링)
- TypeScript (타입 안정성)
- CSS Transitions (애니메이션)
```

## 📋 구현 순서 (Implementation Order)

### Step 1: 타입 정의

```typescript
// 먼저 무엇이 필요한지 명확히 정의
export interface Toast {
  id: string; // 고유 식별자
  title?: string; // 제목 (선택사항)
  description?: string; // 내용 (선택사항)
  variant?: "default" | "destructive"; // 스타일 변형
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number; // 자동 제거 시간
}
```

### Step 2: 전역 상태 관리 시스템

```typescript
// use-toast.ts
const toasts: Toast[] = []; // 전역 토스트 배열
const listeners: Array<(toasts: Toast[]) => void> = []; // 상태 변경 리스너

function addToast(toast: ToastOptions) {
  // 1. 고유 ID 생성
  // 2. 새 토스트 객체 생성
  // 3. 배열 맨 앞에 추가 (최신이 위에)
  // 4. 모든 리스너에게 알림
}

function removeToast(id: string) {
  // 1. ID로 토스트 찾기
  // 2. 배열에서 제거
  // 3. 모든 리스너에게 알림
}
```

### Step 3: 커스텀 훅 구현

```typescript
export function useToast() {
  // 1. 로컬 상태와 전역 상태 연결
  // 2. 컴포넌트 마운트/언마운트 시 리스너 관리
  // 3. toast() 함수 제공
  // 4. dismiss() 함수 제공

  return { toast, dismiss, toasts };
}
```

### Step 4: Toast 컴포넌트 구현

```typescript
export function ToastComponent({ toast, onDismiss }) {
  // 1. 애니메이션 상태 관리
  // 2. 자동 제거 타이머
  // 3. 수동 닫기 핸들러
  // 4. 조건부 스타일링
}
```

### Step 5: Toaster 컨테이너 구현

```typescript
export function Toaster() {
  // 1. useToast 훅 사용
  // 2. 토스트 목록 렌더링
  // 3. 레이아웃 관리 (flexbox)
  // 4. 위치 고정 (fixed positioning)
}
```

### Step 6: 레이아웃에 통합

```typescript
// layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <ThemeProvider>
        <body>
          <div className="flex h-screen">
            <Sidebar />
            <main>{children}</main>
          </div>
          <Toaster /> {/* 여기에 추가! */}
        </body>
      </ThemeProvider>
    </html>
  );
}
```

## 🔧 핵심 구현 방법

### 방법 1: 전역 상태 패턴

```typescript
// 모듈 레벨에서 상태 관리
const globalState = [];
const globalListeners = [];

// 장점: 간단하고 빠름
// 단점: SSR에서 조심해야 함
```

### 방법 2: Context API 패턴

```typescript
// React Context로 상태 관리
const ToastContext = createContext();

// 장점: React 생태계와 잘 맞음
// 단점: Provider 래핑 필요
```

### 방법 3: 이벤트 기반 패턴

```typescript
// 커스텀 이벤트로 통신
window.dispatchEvent(new CustomEvent("toast", { detail: toast }));

// 장점: 완전히 분리된 시스템
// 단점: 복잡하고 디버깅 어려움
```

## 🎨 스타일링 전략

### 전략 1: Tailwind 직접 사용 (✅ 채택)

```typescript
// 장점: 직관적, 빠른 개발, 조건부 스타일 쉬움
className={`
  transition-all duration-300
  ${isVisible ? 'opacity-100' : 'opacity-0'}
  ${variant === 'destructive' ? 'bg-red-500' : 'bg-white'}
`}
```

### 전략 2: CSS Modules

```typescript
// 장점: 스코프 분리, 성능
// 단점: 조건부 스타일 복잡
```

### 전략 3: Styled Components

```typescript
// 장점: 동적 스타일링 강력
// 단점: 번들 크기, 런타임 비용
```

## 🎭 애니메이션 시스템

### 핵심 원리

```typescript
// 1. 초기 상태: 화면 밖 (translate-x-full)
// 2. 등장: 화면 안으로 슬라이드 (translate-x-0)
// 3. 퇴장: 다시 화면 밖으로 (translate-x-full)

const [isVisible, setIsVisible] = useState(false);

// 마운트 후 애니메이션 시작
useEffect(() => {
  const timer = setTimeout(() => setIsVisible(true), 50);
  return () => clearTimeout(timer);
}, []);
```

### 애니메이션 타이밍

```typescript
// 등장: 50ms 지연 + 300ms 애니메이션
// 머무름: 5000ms
// 퇴장: 300ms 애니메이션
// 제거: 애니메이션 완료 후

const ENTER_DELAY = 50;
const ANIMATION_DURATION = 300;
const AUTO_DISMISS_DELAY = 5000;
```

## 📍 레이아웃 솔루션

### 문제: 여러 토스트 위치 관리

```
❌ 절대 위치 (복잡함)
toast1: top: 0px
toast2: top: 80px
toast3: top: 160px

✅ Flexbox (간단함)
container: flex flex-col gap-2
toast1 ↑ (자동 정렬)
toast2 ↓
toast3 ↓
```

### 해결책: Flexbox + Gap

```typescript
<div className="fixed top-4 right-4 flex flex-col gap-2">
  {toasts.map((toast) => (
    <ToastComponent key={toast.id} toast={toast} />
  ))}
</div>
```

## 🐛 흔한 문제와 해결책

### 문제 1: 토스트가 같은 위치에 겹침

```typescript
// 원인: position: relative와 absolute 충돌
// 해결: flexbox 사용

❌ className="relative absolute top-4"
✅ className="flex flex-col gap-2"
```

### 문제 2: 애니메이션이 작동하지 않음

```typescript
// 원인: 초기 렌더링 시 바로 visible=true
// 해결: 지연 후 상태 변경

❌ const [isVisible, setIsVisible] = useState(true);
✅ const [isVisible, setIsVisible] = useState(false);
   useEffect(() => {
     setTimeout(() => setIsVisible(true), 50);
   }, []);
```

### 문제 3: 메모리 누수

```typescript
// 원인: 타이머 정리 안함
// 해결: cleanup 함수 사용

✅ useEffect(() => {
     const timer = setTimeout(handleDismiss, 5000);
     return () => clearTimeout(timer); // 정리!
   }, []);
```

### 문제 4: 다크 모드 스타일 안됨

```typescript
// 원인: 하드코딩된 색상
// 해결: CSS 변수 사용

❌ className="bg-white text-black"
✅ className="bg-background text-foreground"
```

## 🚀 사용법

### 기본 사용

```typescript
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "성공!",
      description: "작업이 완료되었습니다.",
    });
  };
}
```

### 에러 토스트

```typescript
toast({
  title: "오류 발생",
  description: "다시 시도해주세요.",
  variant: "destructive",
});
```

### 커스텀 지속 시간

```typescript
toast({
  title: "알림",
  description: "10초 동안 표시됩니다.",
  duration: 10000,
});
```

## 🎯 핵심 원칙

1. **단순함**: 복잡한 추상화보다 직관적인 코드
2. **재사용성**: 어디서든 쉽게 사용 가능
3. **성능**: 불필요한 리렌더링 최소화
4. **접근성**: 키보드 네비게이션, 스크린 리더 지원
5. **일관성**: 디자인 시스템과 통합

## 💡 확장 아이디어

- [ ] 토스트 그룹핑 (같은 타입끼리)
- [ ] 액션 버튼 추가 (실행취소 등)
- [ ] 위치 커스터마이징 (좌상단, 하단 등)
- [ ] 진행률 표시 (남은 시간)
- [ ] 사운드 효과
- [ ] 모바일 스와이프 제스처

이렇게 체계적으로 접근하면 견고하고 확장 가능한 Toast 시스템을 만들 수 있습니다! 🎉
