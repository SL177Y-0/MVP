import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ 
  message, 
  visible, 
  onClose, 
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (visible && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, autoClose, duration, onClose]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-red-900/80 border border-red-500 backdrop-blur-md rounded-lg shadow-lg flex items-center px-4 py-3 text-white max-w-md">
            <div className="mr-3 flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 pr-2">{message}</div>
            <button onClick={onClose} className="flex-shrink-0 ml-2 text-red-300 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast; 