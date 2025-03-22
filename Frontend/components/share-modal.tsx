
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Twitter, Download, Copy, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ShareCard } from '@/components/share-card';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  score: string;
  rank: string;
  level: string;
  imageUrl?: string;
  isGenerating: boolean;
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  username, 
  score, 
  rank, 
  level,
  imageUrl,
  isGenerating
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  const shareToTwitter = () => {
    if (!imageUrl) return;
    
    const text = `Check out my DeFi score! Rank #${rank} - Level ${level}`;
    const url = "https://cluster.defi";
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    
    window.open(shareUrl, '_blank');
  };
  
  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `defi-score-${username}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image downloaded",
      description: "Your score card has been saved to your device.",
      duration: 3000,
    });
  };
  
  const copyToClipboard = async () => {
    if (!imageUrl) return;
    
    try {
      // For modern browsers
      const blob = await fetch(imageUrl).then(r => r.blob());
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Your score card has been copied and is ready to paste.",
        duration: 3000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy image:', err);
      toast({
        title: "Failed to copy",
        description: "Please try downloading the image instead.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] glass-panel neo-shadow border-defi-green/50">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg text-white monument-font">SHARE YOUR SCORE</DialogTitle>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-white/70" />
          </button>
        </DialogHeader>
        
        <div className="py-4">
          <ShareCard 
            username={username}
            score={score}
            rank={rank}
            level={level}
            capturedImageUrl={imageUrl}
          />
          
          {isGenerating && (
            <div className="mt-4 text-center text-white/70">
              Generating your shareable score card...
            </div>
          )}
          
          {!isGenerating && imageUrl && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button 
                onClick={shareToTwitter}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DA1F2] text-white hover:bg-[#1a94df] transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </button>
              <button 
                onClick={downloadImage}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-defi-green text-black hover:bg-defi-green-light transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
