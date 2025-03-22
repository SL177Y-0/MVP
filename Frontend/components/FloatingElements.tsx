
import React, { useEffect } from 'react';
import { Twitter, MessageCircle, Wallet } from 'lucide-react';

type FloatingElement = {
  id: number;
  left: number;
  top: number;
  scale: number;
  opacity: number;
  delay: number;
  duration: number;
};

interface FloatingElementsProps {
  count?: number;
  type: 'tweets' | 'messages' | 'wallets';
  className?: string;
  positionStyle?: 'default' | 'scattered' | 'wide' | 'spaced';
}

const tweetContents = [
  "Just deployed my first smart contract! #Web3 #Ethereum",
  "NFT minting is live! Who's joining our community? 🔥",
  "This new DEX has crazy low fees. Bullish! 📈",
  "Staking rewards are insane right now. NFA but you should check it out.",
  "GM frens. Who's building in the bear market?",
  "Just bridged to @arbitrum and the speed is incredible! #DeFi"
];

const messageContents = [
  "When is the next token distribution?",
  "Did you see that new governance proposal?",
  "🚨 Presale starting in 24 hours 🚨",
  "The alpha group just shared some new gems",
  "We're launching on mainnet next week!"
];

const walletAddresses = [
  "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
  "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
  "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  "0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC",
  "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
];

// Helper function to get position based on style
const getPositions = (count: number, style: string = 'default') => {
  const elements: FloatingElement[] = [];
  
  for (let i = 0; i < count; i++) {
    let left: number;
    let top: number;
    
    // Different position strategies
    switch (style) {
      case 'scattered':
        // More randomized distribution
        left = 5 + Math.random() * 90; // 5% to 95%
        top = 5 + Math.random() * 90;  // 5% to 95%
        break;
      case 'wide':
        // Spread elements across the width, but clustered vertically
        left = (i * (100 / count)) + (Math.random() * 15 - 7.5);
        top = 20 + Math.random() * 60;
        break;
      case 'spaced':
        // Well-distributed grid-like layout
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const col = i % cols;
        const row = Math.floor(i / cols);
        left = 5 + (col * (90 / (cols - 1 || 1))) + (Math.random() * 10 - 5);
        top = 5 + (row * (90 / (rows - 1 || 1))) + (Math.random() * 10 - 5);
        break;
      default:
        // Default positioning (similar to original)
        left = Math.random() * 100;
        top = Math.random() * 100;
    }
    
    // Ensure positions are within bounds (0-100%)
    left = Math.max(0, Math.min(100, left));
    top = Math.max(0, Math.min(100, top));
    
    elements.push({
      id: i,
      left,
      top,
      scale: 0.1 + Math.random() * 0.2, // Slightly reduced scale for less clutter
      opacity: 0.2 + Math.random() * 0.3, // Increased opacity range for better visibility
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
    });
  }
  
  return elements;
};

const FloatingElements = ({ count = 15, type, className = '', positionStyle = 'default' }: FloatingElementsProps) => {
  const [elements, setElements] = React.useState<FloatingElement[]>([]);

  useEffect(() => {
    // Generate elements with positions based on the selected style
    const generatedElements = getPositions(count, positionStyle);
    setElements(generatedElements);
  }, [count, positionStyle]);
  
  const getRandomContent = (contentArray: string[]) => {
    return contentArray[Math.floor(Math.random() * contentArray.length)];
  };
  
  const renderContent = (elementType: string, elementId: number) => {
    switch (elementType) {
      case 'tweets':
        return (
          <div className="w-40 h-16 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 flex items-start space-x-2 shadow-sm">
            <Twitter size={16} className="text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <div className="w-8 h-2 bg-white/40 rounded-full mb-2"></div>
              <div className="w-full text-xs text-white/70 font-mono truncate line-clamp-2 text-left">
                {getRandomContent(tweetContents)}
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="w-36 h-12 backdrop-blur-sm bg-white/5 border border-white/10 rounded-full p-3 flex items-center space-x-2 shadow-sm">
            <MessageCircle size={14} className="text-blue-400 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <div className="text-xs text-white/70 font-mono truncate text-left">
                {getRandomContent(messageContents)}
              </div>
            </div>
          </div>
        );
      case 'wallets':
        return (
          <div className="max-w-[200px] h-10 px-3 py-2 backdrop-blur-sm bg-white/5 border border-white/10 rounded-md text-xs text-white/60 truncate font-mono flex items-center space-x-2 shadow-sm">
            <Wallet size={12} className="text-degen-glow flex-shrink-0" />
            <span>{getRandomContent(walletAddresses)}</span>
          </div>
        );
      default:
        return <div className="w-8 h-8 glass rounded-full"></div>;
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute animate-float"
          style={{
            left: `${element.left}%`,
            top: `${element.top}%`,
            transform: `scale(${element.scale})`,
            opacity: element.opacity,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`
          }}
        >
          {renderContent(type, element.id)}
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;
