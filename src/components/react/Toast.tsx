import clsx from "clsx";
import { useEffect, useState } from "react";

export type ToastProps = {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
};

/** Auto-dismissing notification: slides in, waits, fades out. */
export function Toast({ message, onDismiss, durationMs = 4000 }: ToastProps) {
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
        "pointer-events-auto w-full sm:w-auto sm:max-w-sm rounded-lg border border-dawn-pink-400",
        "bg-white shadow-lg px-4 py-3 text-sm text-dawn-pink-900 flex items-start gap-3",
        "transition-all duration-200 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        className="text-dawn-pink-500 hover:text-dawn-pink-950 shrink-0"
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
      >
        ✕
      </button>
    </div>
  );
}
