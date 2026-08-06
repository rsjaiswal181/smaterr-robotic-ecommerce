import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import type { ReactNode } from 'react';

export const Modal = ({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-ink/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className={`relative max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-y-auto rounded-md bg-paper p-6 shadow-xl`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">{title}</h2>
            <button onClick={onClose} className="text-ink/50 hover:text-ink">
              <FiX className="h-5 w-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
