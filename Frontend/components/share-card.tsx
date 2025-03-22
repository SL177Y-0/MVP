
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ClusterLogo } from '@/components/cluster-logo';

interface ShareCardProps {
  username: string;
  score: string;
  rank: string;
  level: string;
  capturedImageUrl?: string;
}

export function ShareCard({ username, score, rank, level, capturedImageUrl }: ShareCardProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-defi-dark border-2 border-defi-green shadow-lg">
      <AspectRatio ratio={16/9} className="bg-defi-dark">
        <div className="relative w-full h-full flex flex-col">
          {/* Captured content preview area */}
          <div className="flex-1 overflow-hidden">
            {capturedImageUrl ? (
              <img 
                src={capturedImageUrl} 
                alt="Your DeFi Score" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                Loading preview...
              </div>
            )}
          </div>
          
          {/* Bottom info bar */}
          <div className="p-4 bg-black/40 backdrop-blur-sm border-t border-defi-green/30">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg monument-font">{username}</span>
                <span className="text-defi-green text-sm">Score: {score}</span>
              </div>
              
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-white/70 text-xs">RANK</p>
                  <p className="text-white font-bold">{rank}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">LEVEL</p>
                  <p className="text-white font-bold">{level}</p>
                </div>
              </div>
            </div>
            
            {/* Bottom branding */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center">
                <ClusterLogo />
              </div>
              <span className="text-white/70 text-xs">cluster.defi</span>
            </div>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
}
