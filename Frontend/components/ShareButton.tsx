
import { useState } from 'react';
import { Twitter, Share2, Download } from 'lucide-react';
import CyberButton from './CyberButton';
import html2canvas from 'html2canvas';

interface ShareButtonProps {
  onShare?: () => void;
}

const ShareButton = ({ onShare }: ShareButtonProps) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const captureAndShare = async () => {
    if (onShare) {
      onShare();
    }
    
    setIsGeneratingImage(true);
    
    try {
      // Target the element to capture
      const element = document.getElementById('scorecard-capture');
      
      if (!element) {
        console.error('Element not found');
        return;
      }
      
      // Generate canvas from the element
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true
      });
      
      // Convert to blob and create URL
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to generate image');
          return;
        }
        
        try {
          // Create a file from blob
          const file = new File([blob], 'cluster-degen-score.png', { type: 'image/png' });
          
          // For sharing on mobile devices
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'My Cluster Degen Score',
              text: 'Check out my degen score on Cluster Protocol!',
              files: [file]
            });
          } else {
            // Fallback for desktop or unsupported browsers
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'cluster-degen-score.png';
            link.click();
            URL.revokeObjectURL(url);
          }
        } catch (error) {
          console.error('Error sharing:', error);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareOnTwitter = () => {
    const text = "Check out my Cluster Protocol Degen Score! I'm in the top percentile of crypto influencers. #ClusterProtocol #DegenScore";
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <CyberButton
        onClick={captureAndShare}
        icon={<Download size={16} />}
        isLoading={isGeneratingImage}
        variant="secondary"
      >
        {isGeneratingImage ? 'Generating...' : 'Download Score Card'}
      </CyberButton>
      
      <CyberButton 
        onClick={shareOnTwitter}
        icon={<Twitter size={16} />}
        variant="accent"
      >
        Share on Twitter
      </CyberButton>
    </div>
  );
};

export default ShareButton;
