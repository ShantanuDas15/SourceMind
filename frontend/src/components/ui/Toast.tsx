import { useEffect, useState } from 'react';
import { Toast as ToastType } from '../../stores/toastStore';
import { useToastStore } from '../../stores/toastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toast: ToastType;
}

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLE_MAP = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    icon: 'text-emerald-500',
    text: 'text-emerald-800 dark:text-emerald-200',
    progress: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800/50',
    icon: 'text-red-500',
    text: 'text-red-800 dark:text-red-200',
    progress: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800/50',
    icon: 'text-blue-500',
    text: 'text-blue-800 dark:text-blue-200',
    progress: 'bg-blue-500',
  },
};

export function Toast({ toast }: ToastProps) {
  const removeToast = useToastStore((state) => state.removeToast);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const style = STYLE_MAP[toast.type];
  const Icon = ICON_MAP[toast.type];

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setIsVisible(true));

    // Trigger exit animation before auto-removal
    const exitDelay = toast.duration - 400;
    const exitTimer = setTimeout(() => setIsExiting(true), exitDelay > 0 ? exitDelay : 0);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-out
        ${style.bg} ${style.border}
        ${isVisible && !isExiting
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-3 scale-95'
        }
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
      <p className={`text-sm font-medium flex-1 leading-relaxed ${style.text}`}>
        {toast.message}
      </p>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${style.progress}`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}
