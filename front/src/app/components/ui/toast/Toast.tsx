"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ToastProps, ToasterProps } from "./Toast.type";
import { useToast } from "@/hooks/use-toast";

// 개별 토스트 컴포넌트
export function ToastComponent({ toast, onDismiss }: ToastProps) {
  // 등장 애니메이션용 상태
  const [isVisible, setIsVisible] = useState(false);

  // 중복 제거 방지용 상태
  const [isLeaving, setIsLeaving] = useState(false);

  // 마운트 후 50ms 지연으로 부드러운 등장
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 5초 후 자동 제거
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 애니메이션과 함께 제거
  const handleDismiss = () => {
    if (isLeaving) return;

    setIsLeaving(true);
    setIsVisible(false);

    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  return (
    // 🔧 완전히 새로운 간단한 스타일 (variants 사용 안함)
    <div
      className={`
  w-full max-w-sm           // 너비 제한
  bg-background border      // 배경색과 테두리
  border-border rounded-lg  // 둥근 모서리
  shadow-lg p-4             // 그림자와 패딩
  flex items-center space-x-3  // 내부 레이아웃
  pointer-events-auto       // 토스트만 클릭 가능
  transition-all duration-300 ease-in-out  // 부드러운 애니메이션
  
  // 조건부 애니메이션 클래스
        ${
          isVisible
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }
        
  // 조건부 색상 클래스  
        ${
          toast.variant === "destructive"
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-background text-foreground"
        }
      `}
    >
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-sm font-semibold leading-none tracking-tight">
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90 mt-1 leading-relaxed">
            {toast.description}
          </div>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0 rounded-sm opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// 토스트 컨테이너 - flexbox로 자동 정렬
export function Toaster({ className, ...props }: ToasterProps) {
  const { toasts, dismiss } = useToast();

  // 🔧 완전히 간단한 flexbox 레이아웃
  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      {...props}
    >
      {toasts.map((toast) => (
        <div key={toast.id}>
          {/* 각 토스트가 자동으로 위에서부터 쌓임 */}
          <ToastComponent toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
