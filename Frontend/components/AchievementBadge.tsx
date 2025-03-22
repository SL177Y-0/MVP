
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  icon: ReactNode;
  label: string;
  color?: 'green' | 'blue' | 'pink' | 'yellow';
  unlocked?: boolean;
}

const AchievementBadge = ({ 
  icon, 
  label, 
  color = 'green',
  unlocked = true 
}: AchievementBadgeProps) => {
  
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green';
      case 'blue': return 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue';
      case 'pink': return 'bg-cyber-pink/10 border-cyber-pink/30 text-cyber-pink';
      case 'yellow': return 'bg-cyber-yellow/10 border-cyber-yellow/30 text-cyber-yellow';
      default: return 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green';
    }
  };

  const badgeVariants = {
    locked: { 
      opacity: 0.5,
      filter: "grayscale(100%)",
    },
    unlocked: { 
      opacity: 1,
      filter: "grayscale(0%)",
    }
  };

  return (
    <motion.div
      initial="locked"
      animate={unlocked ? "unlocked" : "locked"}
      variants={badgeVariants}
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center p-3 rounded-lg border ${getColorClass()} transition-all relative`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xs text-center">{label}</div>
      
      {unlocked && 
        <motion.div 
          className="absolute inset-0 rounded-lg"
          initial={{ boxShadow: `0 0 0px ${color === 'green' ? '#09FBD3' : color === 'blue' ? '#08F7FE' : color === 'pink' ? '#FE53BB' : '#F5D300'}` }}
          animate={{ 
            boxShadow: [
              `0 0 2px ${color === 'green' ? '#09FBD3' : color === 'blue' ? '#08F7FE' : color === 'pink' ? '#FE53BB' : '#F5D300'}`,
              `0 0 4px ${color === 'green' ? '#09FBD3' : color === 'blue' ? '#08F7FE' : color === 'pink' ? '#FE53BB' : '#F5D300'}`,
              `0 0 2px ${color === 'green' ? '#09FBD3' : color === 'blue' ? '#08F7FE' : color === 'pink' ? '#FE53BB' : '#F5D300'}`
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity 
          }}
        />
      }
    </motion.div>
  );
};

export default AchievementBadge;
