import clsx from "clsx";
import { useEffect, useState } from "react";

export type ToastVariant = "info" | "error";

export type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
  durationMs?: number;
};

/** Auto-dismissing notification: slides in, waits, fades out. */
export function Toast({
  message,
  variant = "info",
  onDismiss,
  durationMs = 4000,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  // mount hidden, flip to visible next frame so the transition actually runs
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => setVisible(false), durationMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
    };
  }, [durationMs]);

  useEffect(() => {
    if (visible) return;
    const t = setTimeout(onDismiss, 200);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  return (
    <div
      role="status"
      className={clsx(
        "pointer-events-auto w-full sm:w-auto sm:max-w-sm rounded-lg border shadow-lg px-4 py-3 text-sm flex items-start gap-3",
        "transition-all duration-200 ease-out",
        variant === "error"
          ? "border-red-400 bg-red-50 text-red-800"
          : "border-dawn-pink-400 bg-white text-dawn-pink-900",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        className={clsx(
          "shrink-0",
          variant === "error"
            ? "text-red-500 hover:text-red-900"
            : "text-dawn-pink-500 hover:text-dawn-pink-950"
        )}
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
      >
        ✕
      </button>
    </div>
  );
}
