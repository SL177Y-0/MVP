
import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const ScoreDisplay = ({ 
  score, 
  label, 
  variant = 'primary', 
  size = 'md',
  animate = true
}: ScoreDisplayProps) => {
  
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green';
      case 'secondary':
        return 'bg-cyber-pink/10 border-cyber-pink/30 text-cyber-pink';
      case 'accent':
        return 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue';
      default:
        return 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green';
    }
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-5 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };
  
  const scoreVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    })
  };

  const displayScore = () => {
    if (animate) {
      return (
        <div className="flex justify-center">
          {score.toString().split('').map((digit, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={scoreVariants}
              initial="hidden"
              animate="visible"
              className="inline-block"
            >
              {digit}
            </motion.span>
          ))}
        </div>
      );
    }
    return <div>{score.toLocaleString()}</div>;
  };

  return (
    <div className={`rounded-lg border ${getVariantClass()} ${getSizeClass()}`}>
      <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="font-bold">
        {displayScore()}
      </div>
    </div>
  );
};

export default ScoreDisplay;
