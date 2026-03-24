/**
 * TOAST NOTIFICATION COMPONENT
 *
 * Lightweight toast system for showing success/error/info messages.
 * No external library needed.
 *
 * Usage:
 *   // In any component:
 *   import { useToast } from "./Toast.jsx";
 *   const toast = useToast();
 *   toast.success("Message sent!");
 *   toast.error("Something failed");
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 5000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error:   (msg, dur) => addToast(msg, "error",   dur || 8000),
    info:    (msg, dur) => addToast(msg, "info",    dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
  };

  const typeStyles = {
    success: { border: "border-success/40", bg: "bg-success/10", text: "text-success", icon: "✓" },
    error:   { border: "border-danger/40",  bg: "bg-danger/10",  text: "text-danger",  icon: "✕" },
    info:    { border: "border-accent/40",  bg: "bg-accent/10",  text: "text-accent",  icon: "ℹ" },
    warning: { border: "border-gold/40",    bg: "bg-gold/10",    text: "text-gold",    icon: "⚠" },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const s = typeStyles[type] || typeStyles.info;
          return (
            <div
              key={id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl
                          border ${s.border} ${s.bg} panel max-w-sm animate-slide-up`}
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
            >
              <span className={`${s.text} font-bold text-sm mt-0.5`}>{s.icon}</span>
              <span className="text-text text-sm font-body leading-snug flex-1">{message}</span>
              <button
                onClick={() => removeToast(id)}
                className="text-muted hover:text-text text-xs ml-1 mt-0.5"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
