
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  showValues?: boolean;
  className?: string;
}

export function ProgressBar({ value, max, showValues = true, className }: ProgressBarProps) {
  const percentage = (value / max) * 100;
  
  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-2 bg-defi-gray rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-defi-green rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showValues && (
        <div className="flex justify-between mt-1 text-xs text-white/60">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
