
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BadgeProps {
  icon: ReactNode;
  label: string;
  value?: string | number;
  color?: 'green' | 'blue' | 'pink' | 'yellow';
}

const Badge = ({ icon, label, value, color = 'green' }: BadgeProps) => {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'border-cyber-green/30 bg-cyber-green/10 text-cyber-green';
      case 'blue': return 'border-cyber-blue/30 bg-cyber-blue/10 text-cyber-blue';
      case 'pink': return 'border-cyber-pink/30 bg-cyber-pink/10 text-cyber-pink';
      case 'yellow': return 'border-cyber-yellow/30 bg-cyber-yellow/10 text-cyber-yellow';
      default: return 'border-cyber-green/30 bg-cyber-green/10 text-cyber-green';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 p-3 rounded-lg border ${getColorClass()}`}
    >
      <div className="text-lg">{icon}</div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
        {value && <div className="font-semibold">{value}</div>}
      </div>
    </motion.div>
  );
};

export default Badge;
