
import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface ScoreCardProps {
  icon: React.ReactNode;
  label: string;
  score: string;
  className?: string;
}

export function ScoreCard({ icon, label, score, className }: ScoreCardProps) {
  return (
    <div className={cn(
      "glass-panel neo-shadow flex items-center justify-between p-4 animate-fade-in",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-6 h-6 text-defi-green">
          {icon}
        </div>
        <span className="text-white/80 text-sm font-medium monument-font">{label}</span>
      </div>
      <span className="text-white font-bold text-lg">{score}</span>
    </div>
  );
}

export function CompactScoreCard({ score, label, className, icon }: { score: string; label: string; className?: string; icon?: React.ReactNode }) {
  return (
    <div className={cn(
      "glass-panel neo-shadow flex items-center gap-2 px-3 py-2 rounded-lg animate-fade-in",
      className
    )}>
      {icon || <Trophy className="w-4 h-4 text-defi-green" />}
      <span className="text-white/70 text-xs">{label}</span>
      <span className="text-white font-bold ml-auto">{score}</span>
    </div>
  );
}
