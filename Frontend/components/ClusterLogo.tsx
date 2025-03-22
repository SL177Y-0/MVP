
import { motion } from 'framer-motion';

interface ClusterLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ClusterLogo = ({ size = 'md', className = '' }: ClusterLogoProps) => {
  const sizeClass = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  }[size];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className={`font-bold ${sizeClass} flex items-center`}>
        <span className="text-white font-space-grotesk mr-1">Cluster</span>
        <span className="bg-gradient-to-r from-cyber-blue to-cyber-green bg-clip-text text-transparent">Protocol</span>
      </div>
    </motion.div>
  );
};

export default ClusterLogo;
