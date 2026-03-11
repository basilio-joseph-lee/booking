"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<ToastType, { icon: string; accent: string; iconBg: string }> = {
  success: { icon: "✓", accent: "#16a34a", iconBg: "#dcfce7" },
  error:   { icon: "✕", accent: "#dc2626", iconBg: "#fee2e2" },
  warning: { icon: "!", accent: "#d97706", iconBg: "#fef3c7" },
  info:    { icon: "i", accent: "#2563eb", iconBg: "#dbeafe" },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cfg = CONFIG[toast.type];
  const duration = toast.duration ?? 3500;

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 320);
  }, [toast.id, onRemove]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [dismiss, duration]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${cfg.accent}`,
        borderRadius: 12,
        padding: "14px 16px",
        width: 340,
        boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving
          ? "translateX(0) scale(1)"
          : "translateX(40px) scale(0.95)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: cfg.iconBg, color: cfg.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 14, flexShrink: 0, fontFamily: "monospace",
        }}
      >
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: "#111827", marginBottom: toast.message ? 2 : 0 }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.5 }}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Close */}
      <button
        onClick={dismiss}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#9ca3af", fontSize: 14, lineHeight: 1,
          padding: "2px 4px", borderRadius: 4, flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
      >
        ✕
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0,
          height: 3, background: cfg.accent, borderRadius: "0 0 0 8px",
          opacity: 0.4,
          animation: `toast-shrink ${duration}ms linear forwards`,
        }}
      />
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastData[];
  onRemove: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed", bottom: 24, right: 24,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 9999, pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}