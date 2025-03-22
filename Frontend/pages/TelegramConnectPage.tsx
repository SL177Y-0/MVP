import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import GlassmorphicCard from '@/components/GlassmorphicCard';
import CyberButton from '@/components/CyberButton';
import PageTransition from '@/components/PageTransition';
import AnimatedCheckmark from '@/components/AnimatedCheckmark';
import FloatingElements from '@/components/FloatingElements';
import ScoreDisplay from '@/components/ScoreDisplay';
import { useScore } from '@/context/ScoreContext';
import Verida from '@/components/Verida';

const telegramTasks = [
  'Checking Group Memberships',
  'Analyzing Activity & Replies',
  'Measuring Influence in Key Groups',
  'Detecting Admin/Mod Roles'
];

const TelegramConnectPage = () => {
  const navigate = useNavigate();
  const { setTelegramScore, setTelegramConnected, twitterConnected } = useScore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [taskStatus, setTaskStatus] = useState<boolean[]>([false, false, false, false]);
  const [completedScan, setCompletedScan] = useState(false);
  const [score, setScore] = useState(0);
  const [veridaStatus, setVeridaStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const targetScore = 5250;
  
  // Animation sequence for after Verida connection
  const startAnimationSequence = () => {
    console.log("🚀 Starting Telegram animation sequence...");
    setIsConnecting(true);
    
    // Step 1: Task animation
    let currentTask = 0;
    const taskInterval = setInterval(() => {
      if (currentTask < taskStatus.length) {
        setTaskStatus(prev => {
          const newStatus = [...prev];
          newStatus[currentTask] = true;
          return newStatus;
        });
        currentTask++;
      } else {
        clearInterval(taskInterval);
        setCompletedScan(true);
        
        // Step 2: Score animation
        let currentScore = 0;
        const scoreIncrement = Math.ceil(targetScore / 50);
        const scoreInterval = setInterval(() => {
          currentScore += scoreIncrement;
          if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(scoreInterval);
            
            // Step 3: Redirect after animation finishes
            setTimeout(() => {
              console.log("✅ Animation complete, redirecting to /scorecard");
              setTelegramScore(targetScore);
              setTelegramConnected(true);
              navigate('/scorecard');
            }, 2000);
          }
          setScore(currentScore);
        }, 30);
      }
    }, 800);
  };
  
  // Handler for Verida connection status changes
  const handleVeridaStatusChange = (status: boolean) => {
    console.log("📱 Verida connection status:", status ? "connected" : "disconnected");
    if (status) {
      setVeridaStatus('connected');
    } else {
      setVeridaStatus('disconnected');
    }
  };
  
  // Start animation when Verida is connected
  useEffect(() => {
    if (veridaStatus === 'connected' && !isConnecting && !completedScan) {
      console.log("🔄 Starting animation for connected Verida");
      startAnimationSequence();
    }
  }, [veridaStatus, isConnecting, completedScan]);
  
  // Manual connect button (fallback)
  const handleConnect = () => {
    startAnimationSequence();
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        <FloatingElements type="messages" count={20} />
        
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md">
          {/* Progress steps */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mb-6"
          >
            {[1, 2, 3, 4].map((_, i) => (
              <div 
                key={i} 
                className={`w-12 h-1 rounded-full ${i <= 2 ? 'bg-cyber-green/70' : 'bg-white/20'}`}
              />
            ))}
          </motion.div>
          
          <GlassmorphicCard className="w-full mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center">
                <MessageSquare size={24} className="text-cyber-blue" />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2 text-white"
            >
              {isConnecting ? "Analyzing Your Telegram" : "Connect Your Telegram"}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 mb-6"
            >
              {isConnecting 
                ? "Your community engagement defines your social rank." 
                : "Your community engagement matters. Let's analyze it!"}
            </motion.p>
            
            {!isConnecting && (
              <div className="relative">
                <Verida onConnectionChange={handleVeridaStatusChange} />
              </div>
            )}
            
            {/* Show Scanning Animation */}
            {isConnecting && (
              <div className="text-left">
                {telegramTasks.map((task, index) => (
                  <AnimatedCheckmark 
                    key={index} 
                    text={task} 
                    completed={taskStatus[index]} 
                    index={index} 
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-2 mt-4">
              {!isConnecting && (
                <button
                  onClick={() => navigate("/scorecard")}
                  className="mt-4 text-white/80 hover:text-white text-sm underline transition-opacity duration-200 ease-in-out"
                >
                  Skip for now
                </button>
              )}
            </div>

            {/* Show Score After Scan */}
            {completedScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-6"
              >
                <ScoreDisplay score={score} label="Points Earned" variant="accent" />
              </motion.div>
            )}
          </GlassmorphicCard>
          
          {/* Connector line animation */}
          {completedScan && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-0.5 h-10 bg-gradient-to-b from-cyber-blue to-transparent mb-4"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default TelegramConnectPage;