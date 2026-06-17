import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl text-white flex items-center gap-3 z-50
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      <span>{message}</span>
    </div>
  );
};

export default Toast;