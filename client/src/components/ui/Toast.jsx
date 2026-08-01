import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  info: 'fa-circle-info',
  warning: 'fa-triangle-exclamation',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = null, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title: title || type.charAt(0).toUpperCase() + type.slice(1), duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration + 300);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 800,
        display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380,
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-enter"
            style={{
              background: 'rgba(20,20,30,0.85)', backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)', border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)', padding: '1rem',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
              boxShadow: 'var(--shadow-xl)', color: 'var(--color-text-primary)',
              animation: 'toastIn 0.3s ease',
            }}
          >
            <i className={`fas ${ICONS[t.type]}`} style={{
              fontSize: '1.2rem', marginTop: 2,
              color: t.type === 'success' ? 'var(--color-success)' : t.type === 'error' ? 'var(--color-error)' : 'var(--color-accent)',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{t.title}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{t.message}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}