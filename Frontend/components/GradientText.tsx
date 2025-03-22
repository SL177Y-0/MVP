
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  from?: string;
  to?: string;
  className?: string;
}

const GradientText = ({ 
  children, 
  from = 'cyber-blue', 
  to = 'cyber-green',
  className = '' 
}: GradientTextProps) => {
  return (
    <span 
      className={`bg-gradient-to-r from-${from} to-${to} bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
};

export default GradientText;
