import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/store/toastStore';
import { cn } from '@/utils/cn';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

const icons = {
  success: <FiCheckCircle className="h-4 w-4" />,
  error: <FiXCircle className="h-4 w-4" />,
  info: <FiInfo className="h-4 w-4" />,
};

const styles = {
  success: 'bg-forest text-paper',
  error: 'bg-rust text-paper',
  info: 'bg-ink text-paper',
};

export const Toaster = () => {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={cn('flex items-center gap-2 rounded-sm px-4 py-3 text-sm shadow-lg', styles[t.type])}
          >
            {icons[t.type]}
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="ml-2 opacity-70 hover:opacity-100">
              <FiX className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
