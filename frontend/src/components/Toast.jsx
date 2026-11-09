import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '', duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let border = 'border-gold-400/50';
          let bg = 'bg-obsidian-900/95';
          let icon = <Info className="w-5 h-5 text-gold-400 flex-shrink-0" />;

          if (toast.type === 'success') {
            border = 'border-emerald-500/50';
            icon = <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
          } else if (toast.type === 'error') {
            border = 'border-rose-500/50';
            icon = <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            border = 'border-amber-500/50';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${border} ${bg} backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in text-slate-100`}
            >
              {icon}
              <div className="flex-1 text-sm">
                {toast.title && <h4 className="font-semibold text-white mb-0.5">{toast.title}</h4>}
                <p className="text-slate-300 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
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
