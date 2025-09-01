"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// 사용할 테마 타입 정의: 'light' 또는 'dark'
type Theme = "light" | "dark";

// Context에서 사용할 타입 정의
interface ThemeContextType {
  theme: Theme; // 현재 테마 상태
  toggleTheme: () => void; // 테마 전환 함수
}

// ThemeContext 생성. 초기값은 undefined (Provider 바깥에서 사용 시 에러 유도용)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 테마 상태를 관리하는 Provider 컴포넌트
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // theme 상태 선언. 기본값은 'light'
  const [theme, setTheme] = useState<Theme>("light");

  // 컴포넌트 마운트 시, localStorage에서 저장된 테마 값을 불러옴
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme); // 저장된 테마가 있으면 적용
    }
  }, []);

  // theme 값이 변경될 때마다 HTML의 data-theme 속성을 업데이트하고, localStorage에 저장
  useEffect(() => {
    // Tailwind CSS가 참조할 수 있도록 <html> 태그에 data-theme 속성 설정
    document.documentElement.setAttribute("data-theme", theme);

    // 브라우저에 현재 테마 저장 (다음 방문 시 유지됨)
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 테마 토글 함수: light ↔ dark 전환
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // ThemeContext.Provider를 통해 자식 컴포넌트에 테마 상태와 토글 함수 전달
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ThemeContext를 사용하는 커스텀 훅
export function useTheme() {
  const context = useContext(ThemeContext);

  // Provider 안이 아닌 곳에서 이 훅을 사용하면 에러 발생
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
