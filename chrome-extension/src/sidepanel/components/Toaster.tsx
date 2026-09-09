import { useEffect, useState } from 'react';
import { toast, type ToastItem } from '../utils/toast';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

export const Toaster = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((updated) => {
      setToasts(updated);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle2 size={16} color="#10b981" />}
          {t.type === 'error' && <AlertCircle size={16} color="#ef4444" />}
          {t.type === 'warning' && <AlertTriangle size={16} color="#f59e0b" />}
          {t.type === 'info' && <Info size={16} color="#3b82f6" />}
          {t.type === 'loading' && <Loader2 size={16} className="spin-animation" color="#f2a97e" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
