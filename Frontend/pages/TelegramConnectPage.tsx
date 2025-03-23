import React, { useState, useEffect } from 'react';
import Verida from '../components/Verida';
import Lottie from 'lottie-react';
import telegramAnim from '@/assets/telegram-animation.json';
import LayoutWithAnimation from '@/layouts/LayoutWithAnimation';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { usePrivy } from '@privy-io/react-auth';
import CyberButton from '@/components/CyberButton';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TelegramConnectPage = () => {
  const { user } = usePrivy();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [animState, setAnimState] = useState<'initial' | 'connected' | 'completed'>('initial');
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  // Handle connection status change from Verida component
  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    
    if (connected) {
      setAnimState('connected');
      
      // After 2 seconds, change to the completed state
      setTimeout(() => {
        setAnimState('completed');
      }, 2000);
    } else {
      setAnimState('initial');
    }
  };
  
  // Query for user's score
  const { data: scoreData, isLoading: isLoadingScore } = useQuery({
    queryKey: ['score', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        // Use Twitter username as a placeholder if we don't have the actual username
        const placeholderUsername = user.twitter?.username || 'placeholder';
        const response = await axios.get(`${apiBaseUrl}/api/score/total-score/${user.id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch score data:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });
  
  // Effects to check if user already has a Telegram score
  useEffect(() => {
    if (scoreData?.telegram?.score) {
      setIsConnected(true);
      setAnimState('completed');
    }
  }, [scoreData]);
  
  // Animation states
  const initialAnimation = {
    width: '100%',
    height: '100%',
  };
  
  const connectedAnimation = {
    width: '60%',
    height: '60%',
  };
  
  const completedAnimation = {
    width: '40%',
    height: '40%',
    opacity: 0.7,
  };
  
  const getAnimationStyle = () => {
    switch (animState) {
      case 'initial':
        return initialAnimation;
      case 'connected':
        return connectedAnimation;
      case 'completed':
        return completedAnimation;
    }
  };
  
  return (
    <LayoutWithAnimation
      sideContent={
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 mr-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={20} className="text-white/70" />
            </button>
            <h1 className="text-2xl font-bold text-white">Connect Telegram</h1>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-white/70">
                Connect your Telegram account to analyze your group participation and calculate your FOMO score.
              </p>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">How it works</h3>
                <ol className="list-decimal list-inside text-white/70 space-y-2">
                  <li>Connect your Telegram account using Verida</li>
                  <li>We'll analyze your group participation</li>
                  <li>Your FOMO score will be calculated based on activity</li>
                </ol>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Privacy</h3>
                <p className="text-white/70">
                  Your Telegram data is analyzed securely. We don't store messages
                  or personal content - only metrics used for your FOMO score.
                </p>
              </div>
            </div>
            
            {animState === 'completed' && (
              <div className="mt-6">
                <CyberButton
                  onClick={() => navigate('/score')}
                  variant="accent"
                  className="w-full"
                >
                  View Your FOMO Score
                </CyberButton>
              </div>
            )}
          </div>
        </div>
      }
      mainContent={
        <div className="h-full flex flex-col justify-between p-4">
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence>
              <motion.div
                key={animState}
                initial={{ opacity: 0.5, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={getAnimationStyle()}
                className="relative flex items-center justify-center transition-all duration-500"
              >
                <Lottie 
                  animationData={telegramAnim} 
                  loop={animState === 'initial'} 
                  className="max-w-full max-h-full"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="w-full mt-8">
            <Verida onConnectionChange={handleConnectionChange} />
          </div>
        </div>
      }
    />
  );
};

export default TelegramConnectPage;