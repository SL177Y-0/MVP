
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassMorphicCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const GlassMorphicCard = ({ children, className, style }: GlassMorphicCardProps) => {
  return (
    <div 
      className={cn(
        "glass-card p-8 md:p-10 transition-all duration-300 max-w-md w-full mx-auto",
        className
      )}
      style={style}
    >
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-30"></div>
        <div className="absolute inset-0 backdrop-blur-lg"></div>
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="absolute left-0 w-[1px] h-full bg-gradient-to-b from-white/30 via-transparent to-transparent"></div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassMorphicCard;
