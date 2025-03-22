import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { ChevronRight, Twitter, Zap, Trophy, Award, Cpu, BarChart3, Shield, Share2, MessageCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassmorphicCard from '@/components/GlassmorphicCard';
import CyberButton from '@/components/CyberButton';
import GradientText from '@/components/GradientText';
import { Badge } from '@/components/ui/badge';
import ScoreDisplay from '@/components/ScoreDisplay';
import FloatingElements from '@/components/FloatingElements';
import { useScore } from '@/context/ScoreContext';

const Index = () => {
  const navigate = useNavigate();
  const { login, authenticated, user } = usePrivy();
  const { resetScores } = useScore();
  
  
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleStartJourney = async () => {
    try {
      if (!user) {
        await login(); // Open Privy login modal
      }

      // ✅ Once authenticated, send email to backend
      // if (authenticated && user) {
      //   await axios.post(`${apiBaseUrl}/api/user/login`, {
      //     email: user.email,
      //     privyID: user.id,
          
      //   });
      // }

      // ✅ Navigate to Twitter connection page after authentication
      resetScores();
      navigate("/connect/twitter");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
      {/* Improved background gradient - more subtle and elegant */}
      <div className="absolute inset-0 bg-gradient-to-br from-degen-dark via-black to-degen-dark opacity-95 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-degen-green/20 to-degen-accent/10 z-0"></div>
      
      {/* Better distributed floating elements with improved visibility */}
      <FloatingElements 
        type="tweets" 
        count={4} 
        className="opacity-60 z-0" 
        positionStyle="scattered" 
      />
      <FloatingElements 
        type="messages" 
        count={3} 
        className="opacity-55 z-0" 
        positionStyle="wide" 
      />
      <FloatingElements 
        type="wallets" 
        count={6} 
        className="opacity-50 z-0" 
        positionStyle="spaced" 
      />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="relative max-w-md w-full rounded-lg overflow-hidden glassmorphic p-2">
              <img 
                src="https://i.pinimg.com/originals/e0/74/93/e074932c6e8378b79da0b5c512f054a2.gif" 
                alt="Cyberpunk Animation" 
                className="w-full rounded shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent pointer-events-none rounded" />
              <div className="absolute top-4 left-4 bg-cyber-pink/20 px-3 py-1 rounded-full border border-cyber-pink/30">
                <span className="text-xs text-cyber-pink cyber-glow-pink">SYSTEM ONLINE</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-xs text-white/70 mb-1">// CONNECTION SECURE</div>
                <div className="h-1 bg-black/50 rounded overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyber-green"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.3 }}
                className="bg-cyber-blue/10 border border-cyber-blue/30 p-2 rounded-full"
              >
                <Trophy size={18} className="text-cyber-blue" />
              </motion.div>
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.3 }}
                className="bg-cyber-pink/10 border border-cyber-pink/30 p-2 rounded-full"
              >
                <Award size={18} className="text-cyber-pink" />
              </motion.div>
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.3 }}
                className="bg-cyber-green/10 border border-cyber-green/30 p-2 rounded-full"
              >
                <Zap size={18} className="text-cyber-green" />
              </motion.div>
            </div>
          </motion.div>

          <div className="flex flex-col items-center md:items-start z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-2 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/30"
            >
              <span className="text-xs text-cyber-green cyber-glow">CLUSTER PROTOCOL</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 cyber-glow text-white text-center md:text-left"
            >
              Degen <GradientText from="cyber-pink" to="cyber-blue">Score</GradientText> Checker
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-lg md:text-xl mb-8 text-white/70 max-w-lg text-center md:text-left"
            >
              Measure your crypto influence and discover where you rank in the digital frontier.
            </motion.p>

            {user?.email && (
            <GlassmorphicCard className="max-w-md w-full mb-8 relative overflow-hidden group">
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="bg-cyber-green/10 text-cyber-green border-cyber-green/30 px-2 py-1">
                  <Cpu size={12} className="mr-1" /> ELITE STATUS
                </Badge>
              </div>
              
              <div className="mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyber-blue/20 flex items-center justify-center">
                  <Shield size={16} className="text-cyber-blue" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">CryptoWarrior</div>
                  <div className="text-white/50 text-xs flex items-center">
                    <Twitter size={10} className="mr-1" /> @crypto_elite
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <ScoreDisplay score={89} label="Twitter" variant="accent" size="sm" animate={false} />
                <ScoreDisplay score={76} label="Telegram" variant="secondary" size="sm" animate={false} />
                <ScoreDisplay score={94} label="On-chain" variant="primary" size="sm" animate={false} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-sm">Total Influence</div>
                <div className="text-cyber-green text-xl font-bold cyber-glow">837</div>
              </div>
              
              <motion.div 
                className="absolute -bottom-12 -right-12 w-24 h-24 bg-cyber-green/10 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Badge variant="outline" className="bg-cyber-pink/10 text-cyber-pink border-cyber-pink/30 flex items-center">
                  <Share2 size={10} className="mr-1" /> Share
                </Badge>
              </div>
            </GlassmorphicCard>

           )}
            <div className="space-y-4 w-full max-w-md">
              <CyberButton 
                onClick={() => navigate('/dashboard')} 
                variant="outline"
                className="w-full"
                icon={<BarChart3 size={16} />}
              >
                View Demo Dashboard
              </CyberButton>
              
              <CyberButton 
                onClick={handleStartJourney} 
                className="w-full"
                icon={<ChevronRight size={16} />}
              >
                Start Your Journey
              </CyberButton>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-white/50 text-sm max-w-lg text-center md:text-left mt-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-white/10 flex-grow"></div>
                <span className="text-xs text-white/30">TRUSTED BY DEGENS WORLDWIDE</span>
                <div className="h-px bg-white/10 flex-grow"></div>
              </div>
              
              <div className="flex justify-center md:justify-start space-x-4">
                <Badge className="bg-transparent border border-white/20 text-white/40 hover:bg-white/5">
                  <MessageCircle size={12} className="mr-1" /> 2.4k+ Users
                </Badge>
                <Badge className="bg-transparent border border-white/20 text-white/40 hover:bg-white/5">
                  <Trophy size={12} className="mr-1" /> 87k+ Scores
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
       </div>
  );
};

export default Index;
