// Lightweight, framework-free toast system with zero external UI dependencies

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastItem {
  id: string | number;
  type: ToastType;
  message: string;
  duration?: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
let counter = 0;

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

function addToast(type: ToastType, message: string, options?: { id?: string | number; duration?: number }) {
  const id = options?.id ?? `toast_${++counter}`;
  const duration = options?.duration ?? (type === 'loading' ? 0 : 3500);

  const existingIndex = toasts.findIndex((t) => t.id === id);
  const newToast: ToastItem = { id, type, message, duration };

  if (existingIndex > -1) {
    toasts[existingIndex] = newToast;
  } else {
    toasts = [...toasts, newToast];
  }
  notify();

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

function removeToast(id: string | number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export const toast = {
  success: (message: string, options?: { id?: string | number; duration?: number }) =>
    addToast('success', message, options),
  error: (message: string, options?: { id?: string | number; duration?: number }) =>
    addToast('error', message, options),
  info: (message: string, options?: { id?: string | number; duration?: number }) =>
    addToast('info', message, options),
  warning: (message: string, options?: { id?: string | number; duration?: number }) =>
    addToast('warning', message, options),
  loading: (message: string, options?: { id?: string | number; duration?: number }) =>
    addToast('loading', message, options),
  dismiss: (id?: string | number) => {
    if (id !== undefined) {
      removeToast(id);
    } else {
      toasts = [];
      notify();
    }
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    listener([...toasts]);
    return () => {
      listeners.delete(listener);
    };
  },
};
