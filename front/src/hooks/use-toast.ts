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

const toasts: Toast[] = [];
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

  toasts.unshift(newToast);
  listeners.forEach((listener) => listener([...toasts]));

  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 5000);

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
