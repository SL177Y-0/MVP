
import React from 'react';
import { cn } from '@/lib/utils';

interface TokenBadgeProps {
  name: string;
  className?: string;
  variant?: 'default' | 'highlight';
}

export function TokenBadge({ name, className, variant = 'default' }: TokenBadgeProps) {
  return (
    <div className={cn(
      "px-4 py-1.5 font-medium rounded-full monument-font flex items-center justify-center",
      "border border-white/5",
      "transition-all duration-300",
      variant === 'default' 
        ? "bg-defi-gray text-white/80 hover:bg-defi-gray-light" 
        : "bg-defi-green/20 text-defi-green hover:bg-defi-green/30",
      className
    )}>
      {name}
    </div>
  );
}
