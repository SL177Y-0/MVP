
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ScoreType = {
  twitter: number;
  telegram: number;
  wallet: number;
  total: number;
  percentile: number;
  rank: number;
};

type ScoreContextType = {
  scores: ScoreType;
  twitterConnected: boolean;
  telegramConnected: boolean;
  walletConnected: boolean;
  setTwitterScore: (score: number) => void;
  setTelegramScore: (score: number) => void;
  setWalletScore: (score: number) => void;
  setTwitterConnected: (status: boolean) => void;
  setTelegramConnected: (status: boolean) => void;
  setWalletConnected: (status: boolean) => void;
  resetScores: () => void;
};

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export const ScoreProvider = ({ children }: { children: ReactNode }) => {
  const [scores, setScores] = useState<ScoreType>({
    twitter: 0,
    telegram: 0,
    wallet: 0,
    total: 0,
    percentile: 0,
    rank: 0,
  });
  
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const calculateTotal = (twitter: number, telegram: number, wallet: number) => {
    const total = twitter + telegram + wallet;
    // Simple percentile calculation for demo
    const percentile = Math.min(99, Math.round((total / 16200) * 100));
    const rank = Math.max(1, 1000 - Math.round(percentile * 10));
    
    return {
      total,
      percentile,
      rank
    };
  };

  const setTwitterScore = (score: number) => {
    setScores(prev => {
      const { total, percentile, rank } = calculateTotal(score, prev.telegram, prev.wallet);
      return { ...prev, twitter: score, total, percentile, rank };
    });
  };

  const setTelegramScore = (score: number) => {
    setScores(prev => {
      const { total, percentile, rank } = calculateTotal(prev.twitter, score, prev.wallet);
      return { ...prev, telegram: score, total, percentile, rank };
    });
  };

  const setWalletScore = (score: number) => {
    setScores(prev => {
      const { total, percentile, rank } = calculateTotal(prev.twitter, prev.telegram, score);
      return { ...prev, wallet: score, total, percentile, rank };
    });
  };

  const resetScores = () => {
    setScores({
      twitter: 0,
      telegram: 0,
      wallet: 0,
      total: 0,
      percentile: 0,
      rank: 0,
    });
    setTwitterConnected(false);
    setTelegramConnected(false);
    setWalletConnected(false);
  };

  return (
    <ScoreContext.Provider value={{
      scores,
      twitterConnected,
      telegramConnected,
      walletConnected,
      setTwitterScore,
      setTelegramScore,
      setWalletScore,
      setTwitterConnected,
      setTelegramConnected,
      setWalletConnected,
      resetScores
    }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};
