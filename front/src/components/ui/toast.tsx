"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Toast } from "@/hooks/use-toast";

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 150);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex w-full max-w-sm items-center space-x-4 rounded-md border p-4 shadow-lg transition-all duration-150 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${
        toast.variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-gray-200 bg-white text-gray-900"
      }`}
    >
      <div className="flex-1">
        {toast.title && (
          <div className="text-sm font-semibold">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 전역 토스트 이벤트 리스너 (선택사항)
  useEffect(() => {
    const handleToast = (event: CustomEvent<Toast>) => {
      setToasts((prev) => [...prev, event.detail]);
    };

    window.addEventListener("toast" as any, handleToast);
    return () => window.removeEventListener("toast" as any, handleToast);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-4">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${index * 80}px` }}
          className="relative"
        >
          <ToastComponent toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  );
}
