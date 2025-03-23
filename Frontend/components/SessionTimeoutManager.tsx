import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from './ui/use-toast';

interface SessionTimeoutManagerProps {
  timeoutDuration: number; // in milliseconds
  warningDuration: number; // in milliseconds
  onTimeout?: () => void;
}

const SessionTimeoutManager = ({ 
  timeoutDuration = 30 * 60 * 1000, // 30 minutes by default
  warningDuration = 5 * 60 * 1000,  // 5 minutes warning by default 
  onTimeout
}: SessionTimeoutManagerProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(timeoutDuration);
  const navigate = useNavigate();

  // Reset timer on user activity
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Handle session timeout
  const handleTimeout = useCallback(() => {
    // Clear local session data
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('privyToken');
    localStorage.removeItem('twitterUsername');
    localStorage.removeItem('userScore');
    localStorage.removeItem('veridaSession');
    
    // Close the warning dialog
    setShowWarning(false);
    
    // Call custom timeout handler if provided
    if (onTimeout) {
      onTimeout();
    }
    
    // Notify user
    toast({
      title: "Session expired",
      description: "Your session has expired. Please log in again.",
      duration: 5000,
    });
    
    // Redirect to start page
    navigate('/start');
  }, [navigate, onTimeout]);

  // Update timer and check for timeout/warning
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivity;
      const timeRemaining = timeoutDuration - timeSinceLastActivity;
      
      setRemainingTime(Math.max(0, timeRemaining));
      
      if (timeSinceLastActivity >= timeoutDuration) {
        // Session timeout
        handleTimeout();
      } else if (timeSinceLastActivity >= (timeoutDuration - warningDuration) && !showWarning) {
        // Show warning
        setShowWarning(true);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastActivity, timeoutDuration, warningDuration, showWarning, handleTimeout]);

  // Setup activity listeners
  useEffect(() => {
    // Events that indicate user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 
      'scroll', 'touchstart', 'click'
    ];
    
    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // Remove event listeners on cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  // Format remaining time for display
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Timeout Warning</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2">
            Your session will expire in {formatTime(remainingTime)}.
          </p>
          <p>
            Would you like to continue your session?
          </p>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleTimeout}>
            Logout Now
          </Button>
          <Button onClick={resetTimer}>
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutManager; 