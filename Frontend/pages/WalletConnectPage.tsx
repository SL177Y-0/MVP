import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useConnect, Connector } from "wagmi";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import CyberButton from "@/components/CyberButton";
import PageTransition from "@/components/PageTransition";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";
import FloatingElements from "@/components/FloatingElements";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useScore } from "@/context/ScoreContext";

const walletTasks: string[] = [
  "Checking DEX Trades & Interactions",
  "Analyzing NFT Flip Performance",
  "Measuring DeFi Exposure & Farming Activity",
  "Detecting Blue-Chip Token Holdings",
];

const WalletConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { connect, connectors } = useConnect();
  const { setWalletScore, setWalletConnected: updateGlobalWalletState } = useScore();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [taskStatus, setTaskStatus] = useState<boolean[]>(Array(walletTasks.length).fill(false));
  const [completedScan, setCompletedScan] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const targetScore = 6750;

  // Animation sequence
  const startAnimationSequence = () => {
    console.log("🚀 Starting animation sequence...");
    setIsConnecting(true);
    
    // Step 1: Task animation
    let currentTask = 0;
    const taskInterval = setInterval(() => {
      if (currentTask < walletTasks.length) {
        setTaskStatus((prev) => {
          const newStatus = [...prev];
          newStatus[currentTask] = true;
          return newStatus;
        });
        currentTask++;
      } else {
        clearInterval(taskInterval);
        setCompletedScan(true);
        
        // Step 2: Score animation 
        let currentScore = 0;
        const scoreIncrement = Math.ceil(targetScore / 50);
        const scoreInterval = setInterval(() => {
          currentScore += scoreIncrement;
          if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(scoreInterval);
            
            // Step 3: Redirect after animation finishes
            setTimeout(() => {
              console.log("✅ Animation complete, redirecting to /connect/telegram");
              // Update global score context
              setWalletScore(targetScore);
              updateGlobalWalletState(true);
              navigate("/connect/telegram");
            }, 2000);
          }
          setScore(currentScore);
        }, 30);
      }
    }, 800);
  };

  // Check if Wallet is already connected on component mount
  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      console.log("🔄 Wallet Found:", storedWallet);
      setWalletAddress(storedWallet);
      setIsWalletConnected(true);
    }
  }, []);

  // Effect to trigger animation sequence when wallet state changes
  useEffect(() => {
    if (isWalletConnected && !completedScan) {
      console.log("🔄 Starting animation for connected wallet");
      startAnimationSequence();
    }
  }, [isWalletConnected, completedScan]);

  // Function to Connect Wallet via WalletConnect
  const connectWallet = async () => {
    try {
      // Reset any previous errors
      setError(null);
      
      const wcConnector: Connector | undefined = connectors.find((c) => c.id === "walletConnect");
      if (!wcConnector) {
        setError("WalletConnect is not available on this browser.");
        return;
      }

      // Show connecting state immediately
      setIsConnecting(true);

      try {
        // Connect with wcConnector
        await connect({ connector: wcConnector } as any);
        
        // Since we can't reliably get the address from the result in all wagmi versions,
        // we'll use a placeholder and the app will need to get the actual address elsewhere
        const address = "connected-wallet";
        
        // Store wallet info
        localStorage.setItem("walletAddress", address);
        setWalletAddress(address);
        setIsWalletConnected(true);
        
        // Note: The animation will now be triggered by the useEffect that watches isWalletConnected
      } catch (connectError: any) {
        console.error("❌ Connection error:", connectError?.message || connectError);
        setError(connectError?.message || "Failed to connect wallet. Please try again.");
        setIsConnecting(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown wallet connection error";
      console.error("❌ WalletConnect Error:", errorMessage);
      setError(errorMessage);
      setIsConnecting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        <FloatingElements type="wallets" count={25} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md">
          {/* Progress steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mb-6"
          >
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className={`w-12 h-1 rounded-full ${i <= 1 ? "bg-cyber-green/70" : "bg-white/20"}`}
              />
            ))}
          </motion.div>

          <GlassmorphicCard className="w-full mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-cyber-pink/10 border border-cyber-pink/30 flex items-center justify-center">
                <Wallet size={24} className="text-cyber-pink" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2 text-white"
            >
              {isConnecting ? "Analyzing Your Wallet" : "Connect Your Wallet"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 mb-6"
            >
              {isConnecting
                ? "Your on-chain activity defines your degen rank."
                : "Tap below to connect and verify your on-chain presence."}
            </motion.p>

            {!isConnecting && (
              <div className="flex flex-col items-center gap-2 mt-4">
                {error && (
                  <div className="text-red-400 text-sm mb-4 p-2 bg-red-900/20 rounded">
                    {error}
                  </div>
                )}
                <CyberButton
                  onClick={connectWallet}
                  className="w-full"
                  variant="secondary"
                  icon={<Wallet size={18} />}
                >
                  Connect Wallet
                </CyberButton>
                <button
                  onClick={() => navigate("/connect/telegram")}
                  className="mt-4 text-white/80 hover:text-white text-sm underline transition-opacity duration-200 ease-in-out"
                >
                  Skip for now
                </button>
              </div>
            )}

            {/* Show Scanning Animation */}
            {isConnecting && (
              <div className="text-left">
                {walletTasks.map((task, index) => (
                  <AnimatedCheckmark
                    key={index}
                    text={task}
                    completed={taskStatus[index]}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Show Score After Scan */}
            {completedScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-6"
              >
                <ScoreDisplay score={score} label="Points Earned" variant="secondary" />
              </motion.div>
            )}
          </GlassmorphicCard>

          {/* Connector line animation */}
          {completedScan && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-0.5 h-10 bg-gradient-to-b from-cyber-pink to-transparent mb-4"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default WalletConnectPage;