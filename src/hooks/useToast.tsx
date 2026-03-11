"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ToastContainer, ToastData, ToastType } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToastOptions {
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: {
    success: (title: string, options?: ToastOptions) => void;
    error:   (title: string, options?: ToastOptions) => void;
    warning: (title: string, options?: ToastOptions) => void;
    info:    (title: string, options?: ToastOptions) => void;
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const add = useCallback((type: ToastType, title: string, options?: ToastOptions) => {
    setToasts((prev) => [
      ...prev,
      { id: nextId++, type, title, message: options?.message, duration: options?.duration },
    ]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title: string, options?: ToastOptions) => add("success", title, options),
    error:   (title: string, options?: ToastOptions) => add("error",   title, options),
    warning: (title: string, options?: ToastOptions) => add("warning", title, options),
    info:    (title: string, options?: ToastOptions) => add("info",    title, options),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}