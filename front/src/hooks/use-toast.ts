import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = {
        id,
        title,
        description,
        variant,
      };

      setToasts((prev) => [...prev, newToast]);

      // 3초 후 자동으로 토스트 제거
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);

      return {
        id,
        dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      };
    },
    []
  );

  return {
    toast,
    toasts,
    dismiss: (toastId: string) =>
      setToasts((prev) => prev.filter((t) => t.id !== toastId)),
  };
}
