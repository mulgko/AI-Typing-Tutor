"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ToastProps, ToasterProps } from "./Toast.type";
import {
  toastVariants,
  toasterVariants,
  toastContentVariants,
  toastTitleVariants,
  toastDescriptionVariants,
  toastCloseButtonVariants,
} from "./toastVariants";
import { Toast } from "@/hooks/use-toast";

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
      className={toastVariants({
        variant: toast.variant === "destructive" ? "destructive" : "default",
        visible: isVisible,
      })}
    >
      <div className={toastContentVariants()}>
        {toast.title && (
          <div className={toastTitleVariants()}>{toast.title}</div>
        )}
        {toast.description && (
          <div className={toastDescriptionVariants()}>{toast.description}</div>
        )}
      </div>
      <button onClick={handleDismiss} className={toastCloseButtonVariants()}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster({ className, ...props }: ToasterProps) {
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
    <div className={toasterVariants({ className })} {...props}>
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
