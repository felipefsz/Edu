import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useApp } from '../app/AppState';
import type { ToastType } from '../app/types';

const toastIcons = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: XCircle,
} satisfies Record<ToastType, typeof CheckCircle2>;

export function ToastLayer() {
  const { dismissToast, state } = useApp();

  useEffect(() => {
    if (!state.ui.toasts.length) return undefined;

    const timers = state.ui.toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 3200),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [dismissToast, state.ui.toasts]);

  if (!state.ui.toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {state.ui.toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        return (
          <div className={`toast-card toast-card--${toast.type}`} key={toast.id}>
            <Icon size={17} />
            <span>{toast.message}</span>
            <button
              className="toast-close"
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fechar aviso"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
