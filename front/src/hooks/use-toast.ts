import React, { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}
// 전역 토스트 배열 - 모든 컴포넌트에서 공유
const toasts: Toast[] = [];

// 상태 변경을 감지할 리스너들
const listeners: Array<(toasts: Toast[]) => void> = [];

let toastCount = 0;

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_VALUE;
  return toastCount.toString();
}

function addToast(toast: ToastOptions) {
  const id = genId();
  const newToast: Toast = {
    id,
    title: toast.title,
    description: toast.description,
    variant: toast.variant || "default",
  };

  // 새 토스트를 맨 앞에 추가 (최신이 위에 표시)
  toasts.unshift(newToast);
  // 모든 리스너에게 상태 변경 알림
  listeners.forEach((listener) => listener([...toasts]));

  return id;
}

function removeToast(id: string) {
  const index = toasts.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach((listener) => listener([...toasts]));
  }
}

export function useToast() {
  const [state, setState] = useState<Toast[]>([...toasts]);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    addToast(options);
  }, []);

  const dismiss = useCallback((id?: string) => {
    if (id) {
      removeToast(id);
    } else {
      toasts.splice(0, toasts.length);
      listeners.forEach((listener) => listener([...toasts]));
    }
  }, []);

  return {
    toast,
    dismiss,
    toasts: state,
  };
}
