import { useToast } from '../hooks/useToast';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-3 min-w-[280px] 
            ${toast.type === 'success' ? 'bg-green-600' : 
              toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          <span>{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)}
            className="ml-auto text-xl leading-none hover:scale-110 transition"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;