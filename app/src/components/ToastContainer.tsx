import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'border-l-tech-success',
  error: 'border-l-tech-error',
  info: 'border-l-blue-500',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-20 right-4 z-[80] space-y-3 w-[360px] max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`bg-tech-bg-tertiary border border-tech-border-subtle border-l-4 ${colors[toast.type]} rounded-xl p-4 flex items-start gap-3 shadow-elevated`}
            >
              <Icon size={18} className={
                toast.type === 'success' ? 'text-tech-success' :
                toast.type === 'error' ? 'text-tech-error' : 'text-blue-500'
              } />
              <p className="text-white text-sm flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-tech-text-muted hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
