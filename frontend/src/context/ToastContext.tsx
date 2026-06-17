import { useCallback, useEffect, useRef, useState, useContext, type ReactNode } from 'react';
import { ToastContext, type Toast } from './toast';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRef = useRef<Map<number, number>>(new Map());
  const lastIdRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeoutId = timeoutRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    lastIdRef.current += 1;
    const id = lastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    const timeoutId = window.setTimeout(() => {
      removeToast(id);
    }, 4000);
    timeoutRef.current.set(id, timeoutId);
  }, [removeToast]);

  useEffect(() => {
    const timers = timeoutRef.current;
    return () => {
      timers.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};