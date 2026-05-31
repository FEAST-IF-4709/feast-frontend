import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({ isOpen, onClose, children, title, size = 'md' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={`bg-white rounded-2xl w-full ${sizeClasses[size]} shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="px-6 pt-6 pb-4 border-b border-feast-bg">
                <h2 className="font-jakarta text-xl font-bold text-feast-dark">{title}</h2>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
