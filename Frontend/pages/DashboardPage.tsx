
import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import GlassmorphicCard from '@/components/GlassmorphicCard';
import ProgressBar from '@/components/ProgressBar';
import { useScore } from '@/context/ScoreContext';
import { useNavigate } from 'react-router-dom';
import CyberButton from '@/components/CyberButton';
import { 
  Activity, 
  Twitter, 
  MessageCircle, 
  Wallet, 
  Award, 
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

const DashboardPage = () => {
  const { scores } = useScore();
  const navigate = useNavigate();

  const leaderboard = [
    { rank: 1, name: 'CryptoKing', score: 16200 },
    { rank: 2, name: 'DegenMaster', score: 15850 },
    { rank: 3, name: 'NFTWhale', score: 15600 },
    { rank: 4, name: 'SolanaSage', score: 15300 },
    { rank: 5, name: 'ApeTrader', score: 15100 }
  ];

  const improvementTips = [
    { text: "Post more viral tweets for +10% boost", icon: <Twitter size={14} /> },
    { text: "Engage in high-quality groups for extra points", icon: <MessageCircle size={14} /> },
    { text: "Diversify your DeFi exposure", icon: <Activity size={14} /> },
    { text: "Increase NFT flipping activity", icon: <TrendingUp size={14} /> }
  ];

  return (
    <PageTransition className="bg-gradient-dark">
      <div className="container py-12 px-4 mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-6 text-center"
        >
          Your Degen Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Score Panel */}
          <GlassmorphicCard className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-cyber-green/10 p-3 rounded-lg">
                <Award className="h-6 w-6 text-cyber-green" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Total Degen Score</h2>
                <p className="text-white/60 text-sm">You're in the top {100 - scores.percentile}% of all users</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="text-center md:text-left">
                <span className="text-4xl md:text-5xl font-bold text-white">{scores.total}</span>
                <span className="text-2xl text-white/60">/16200</span>
              </div>
              <div className="flex-1">
                <ProgressBar 
                  value={scores.total} 
                  max={16200}
                  label="Overall Score" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Twitter size={14} className="text-cyber-green" />
                  <h3 className="text-white/80 text-sm">Twitter Score</h3>
                </div>
                <p className="text-2xl font-bold text-white">{scores.twitter}</p>
                <ProgressBar value={scores.twitter} max={5400} variant="primary" showPercentage={false} />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={14} className="text-cyber-pink" />
                  <h3 className="text-white/80 text-sm">Telegram Score</h3>
                </div>
                <p className="text-2xl font-bold text-white">{scores.telegram}</p>
                <ProgressBar value={scores.telegram} max={5400} variant="secondary" showPercentage={false} />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={14} className="text-cyber-blue" />
                  <h3 className="text-white/80 text-sm">Wallet Score</h3>
                </div>
                <p className="text-2xl font-bold text-white">{scores.wallet}</p>
                <ProgressBar value={scores.wallet} max={5400} variant="accent" showPercentage={false} />
              </div>
            </div>
          </GlassmorphicCard>

          {/* Leaderboard Panel */}
          <GlassmorphicCard>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-cyber-yellow/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-cyber-yellow" />
              </div>
              <h2 className="text-xl font-semibold text-white">Leaderboard</h2>
            </div>
            
            <div className="space-y-4">
              {leaderboard.map((user, index) => (
                <motion.div 
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-6 w-6 flex items-center justify-center rounded-full ${
                      user.rank === 1 ? 'bg-cyber-yellow/20 text-cyber-yellow' : 
                      user.rank === 2 ? 'bg-white/20 text-white' : 
                      user.rank === 3 ? 'bg-cyber-pink/20 text-cyber-pink' : 
                      'bg-white/10 text-white/70'
                    }`}>
                      {user.rank}
                    </span>
                    <span className="text-white">{user.name}</span>
                  </div>
                  <span className="text-white font-semibold">{user.score}</span>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="flex items-center justify-between bg-cyber-green/10 p-3 rounded-lg border border-cyber-green/30"
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 flex items-center justify-center rounded-full bg-cyber-green/20 text-cyber-green">
                    {scores.rank}
                  </span>
                  <span className="text-white">You</span>
                </div>
                <span className="text-white font-semibold">{scores.total}</span>
              </motion.div>
            </div>
          </GlassmorphicCard>

          {/* Improvement Tips Panel */}
          <GlassmorphicCard>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-cyber-blue/10 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-cyber-blue" />
              </div>
              <h2 className="text-xl font-semibold text-white">Improvement Tips</h2>
            </div>
            
            <div className="space-y-4">
              {improvementTips.map((tip, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="flex items-center gap-3 bg-white/5 p-3 rounded-lg"
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10">
                    {tip.icon}
                  </div>
                  <span className="text-white/90">{tip.text}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6">
              <CyberButton 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  Upgrade My Score <ArrowUpRight size={14} />
                </span>
              </CyberButton>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
