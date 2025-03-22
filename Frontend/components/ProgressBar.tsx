
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
}

const ProgressBar = ({
  value,
  max,
  label,
  showPercentage = true,
  variant = 'primary'
}: ProgressBarProps) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // Animate the progress bar
    const timer = setTimeout(() => {
      setWidth((value / max) * 100);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [value, max]);
  
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'from-cyber-green/40 to-cyber-green/20 border-cyber-green/30';
      case 'secondary':
        return 'from-cyber-pink/40 to-cyber-pink/20 border-cyber-pink/30';
      case 'accent':
        return 'from-cyber-blue/40 to-cyber-blue/20 border-cyber-blue/30';
      default:
        return 'from-cyber-green/40 to-cyber-green/20 border-cyber-green/30';
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-white/70">{label}</span>
          {showPercentage && (
            <span className="text-xs text-white/70">{Math.round((value / max) * 100)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full bg-white/5 rounded-full border border-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${getVariantClass()}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
