
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface AnimatedCheckmarkProps {
  text: string;
  completed: boolean;
  index: number;
}

const AnimatedCheckmark = ({ text, completed, index }: AnimatedCheckmarkProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.3, duration: 0.5 }}
      className="flex items-center gap-3 mb-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={completed ? { scale: 1 } : { scale: 0 }}
        transition={{ delay: index * 0.3 + 0.8, duration: 0.3, type: 'spring' }}
        className="w-6 h-6 rounded-full bg-cyber-green/20 flex items-center justify-center"
      >
        <Check size={14} className="text-cyber-green" />
      </motion.div>
      <div className="flex-1 flex justify-between items-center">
        <span className="text-white/80">{text}</span>
        {!completed && (
          <motion.div 
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-1 w-16 bg-gradient-to-r from-cyber-green/30 to-cyber-blue/30 rounded-full"
          />
        )}
      </div>
    </motion.div>
  );
};

export default AnimatedCheckmark;
