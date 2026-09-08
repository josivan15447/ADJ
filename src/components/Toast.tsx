import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

type Listener = (toast: ToastMessage) => void;
const listeners = new Set<Listener>();

export function toast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const id = Math.random().toString(36).substring(2, 9);
  const toastItem: ToastMessage = { id, type, message };
  listeners.forEach((l) => l(toastItem));
}

toast.success = (msg: string) => toast(msg, 'success');
toast.error = (msg: string) => toast(msg, 'error');
toast.info = (msg: string) => toast(msg, 'info');

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler: Listener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-xs sm:text-sm transition-all duration-200 bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 ${
            t.type === 'success'
              ? 'text-zinc-900 dark:text-zinc-100 ring-1 ring-emerald-500/30'
              : t.type === 'error'
              ? 'text-zinc-900 dark:text-zinc-100 ring-1 ring-rose-500/30'
              : 'text-zinc-900 dark:text-zinc-100 ring-1 ring-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
            <span className="font-medium">{t.message}</span>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
