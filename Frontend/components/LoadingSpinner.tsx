import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'secondary' | 'accent';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary', 
  text,
  fullScreen = false
}) => {
  // Size mappings
  const sizeMap = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  // Color mappings
  const colorMap = {
    primary: 'border-t-cyber-pink',
    white: 'border-t-white',
    secondary: 'border-t-cyber-green',
    accent: 'border-t-cyber-blue'
  };
  
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm" 
    : "flex flex-col items-center justify-center";
  
  return (
    <div className={containerClasses}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className={`${sizeMap[size]} border-4 border-gray-800/70 ${colorMap[color]} rounded-full`}
      />
      {text && (
        <p className="mt-3 text-white/80 font-medium text-sm">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 