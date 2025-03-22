
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const GlassmorphicCard = ({ children, className = '', animate = true }: GlassmorphicCardProps) => {
  return animate ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`glassmorphic p-8 ${className}`}
    >
      {children}
    </motion.div>
  ) : (
    <div className={`glassmorphic p-8 ${className}`}>
      {children}
    </div>
  );
};

export default GlassmorphicCard;
