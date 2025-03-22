
import React, { ReactNode, useState, useEffect } from 'react';

interface TransitionEffectProps {
  children: ReactNode;
  isActive?: boolean;
  type?: 'fade' | 'zoom' | 'blur' | 'slide';
  className?: string;
  delay?: number;
}

const TransitionEffect = ({ 
  children, 
  isActive = true, 
  type = 'fade', 
  className = '',
  delay = 0
}: TransitionEffectProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(isActive);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isActive, delay]);
  
  const getAnimationClass = () => {
    if (!mounted) return '';
    
    switch (type) {
      case 'zoom':
        return 'animate-zoom-in';
      case 'blur':
        return 'animate-blur-in';
      case 'slide':
        return 'animate-slide-in-right';
      case 'fade':
      default:
        return 'animate-fade-in-up';
    }
  };
  
  return (
    <div 
      className={`${className} ${getAnimationClass()}`}
      style={{ 
        opacity: 0, 
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards' 
      }}
    >
      {children}
    </div>
  );
};

export default TransitionEffect;
