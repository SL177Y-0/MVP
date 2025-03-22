
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CircularGaugeProps {
  value: number;
  maxValue: number;
  size?: number;
  thickness?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  showLabel?: boolean;
  label?: string;
}

const CircularGauge = ({
  value,
  maxValue,
  size = 280,
  thickness = 20,
  color = 'cyber-blue',
  bgColor = 'white/10',
  showValue = true,
  showLabel = true,
  label
}: CircularGaugeProps) => {
  const [progress, setProgress] = useState(0);
  
  // Calculate percentage and angles
  const percentage = Math.min(100, Math.round((value / maxValue) * 100));
  const radius = size / 2 - thickness;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;
  
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`${bgColor}`}
          strokeWidth={thickness}
          className={`bg-${bgColor}`}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`bg-${color}`}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`stroke-${color}`}
        />
      </svg>
      
      {/* Value in the center */}
      {showValue && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-baseline">
              <span className={`text-6xl font-bold text-${color} cyber-glow-blue`}>
                {value}
              </span>
              <span className="text-xl text-white/50 ml-1">/ {maxValue}</span>
            </div>
            
            {showLabel && label && (
              <span className="text-sm text-white/70 mt-1">{label}</span>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CircularGauge;
