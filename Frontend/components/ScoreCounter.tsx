
import React, { useState, useEffect, useRef } from 'react';

interface ScoreCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const ScoreCounter = ({ 
  value, 
  duration = 2000, 
  className = '',
  prefix = '',
  suffix = ''
}: ScoreCounterProps) => {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const progress = timestamp - startTimeRef.current;
    const percentage = Math.min(progress / duration, 1);
    
    // Easing function for smoother animation
    const easeOutQuart = (x: number): number => {
      return 1 - Math.pow(1 - x, 4);
    };
    
    const easedPercentage = easeOutQuart(percentage);
    setCount(Math.floor(easedPercentage * value));
    
    if (percentage < 1) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      setCount(value); // Ensure final value is exact
    }
  };
  
  useEffect(() => {
    startTimeRef.current = null;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);
  
  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default ScoreCounter;
