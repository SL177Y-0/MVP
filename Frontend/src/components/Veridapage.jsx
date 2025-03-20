import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Verida from "../Verida/Verida";

const Veridapage = () => {
  const { user } = usePrivy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [realScore, setRealScore] = useState(null);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [badges, setBadges] = useState([]);
  const [connectedWallets, setConnectedWallets] = useState([]);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [veridaConnected, setVeridaConnected] = useState(false);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  // Test algorithm manually
  const testAlgorithm = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // Get wallet addresses
      const walletAddresses = connectedWallets.map(w => w.address);
      
      // Prepare test data
      const testData = {
        privyId: user?.id || 'test-user',
        username: userData.twitterUsername || 'elonmusk', // Default test value
        walletAddresses: walletAddresses,
        // For backward compatibility
        walletAddress: walletAddresses.length > 0 ? walletAddresses[0] : null,
        veridaUserId: userData.veridaUserId,
        veridaConnected: veridaConnected,
        twitterConnected: isTwitterConnected,
        walletConnected: connectedWallets.length > 0,
        email: `${user?.id || 'test'}@example.com`
      };
      
      console.log("📤 Testing algorithm with data:", testData);
      
      const response = await axios.post(
        `${apiBaseUrl}/api/score/get-score`,
        testData
      );
      
      if (response.data.success) {
        console.log("✅ Algorithm test successful:", response.data);
        setRealScore(response.data.scores.totalScore);
        
        setScoreDetails({
          twitter: response.data.scores.socialScore || 0,
          wallet: (response.data.scores.cryptoScore || 0) + (response.data.scores.nftScore || 0),
          telegram: response.data.scores.telegramScore || 0,
        });
        
        setBadges(Object.keys(response.data.badges || {}));
        
        // Update userData with latest score info
        userData.totalScore = response.data.scores.totalScore;
        userData.badges = Object.keys(response.data.badges || {});
        // Store wallet count info
        userData.walletCount = response.data.walletCount || walletAddresses.length;
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        setError(response.data.error || "Algorithm test failed");
      }
    } catch (err) {
      console.error("❌ Error testing algorithm:", err);
      setError(err.response?.data?.error || "Failed to test algorithm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchVeridaScore = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(
          `${apiBaseUrl}/api/score/total-score/${user.id}`
        );
        
        if (response.data.success) {
          setRealScore(response.data.totalScore);
          console.log("✅ Score data:", response.data);
          
          // Set score details if available
          if (response.data.details) {
            setScoreDetails({
              twitter: response.data.details.twitter || 0,
              wallet: response.data.details.wallet || 0,
              telegram: response.data.details.verida || 0
            });
          }
          
          // Set badges if available
          if (response.data.badges && Array.isArray(response.data.badges)) {
            setBadges(response.data.badges);
          }
        } else {
          setError(response.data.error || "Failed to fetch score");
        }
      } catch (err) {
        console.error("❌ Error fetching Verida score:", err);
        setError(err.response?.data?.error || "Failed to fetch score");
      } finally {
        setLoading(false);
      }
    };

    fetchVeridaScore();
    
    // Check localStorage for connection status
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setVeridaConnected(!!userData.veridaConnected);
    setIsTwitterConnected(!!userData.twitterConnected);
    
    // Get connected wallets
    if (userData.wallets && Array.isArray(userData.wallets)) {
      setConnectedWallets(userData.wallets);
    }
  }, [user?.id, veridaConnected]); // Re-fetch when Verida connection status changes

  useEffect(() => {
    let interval;

    if (realScore !== null) {
      interval = setInterval(() => {
        setScore(Math.floor(Math.random() * 9999)); // Rapid score animation
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setScore(realScore);
        setIsAnimationDone(true);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [realScore]);
  
  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center text-white"
      style={{
        background: "linear-gradient(135deg, #010101 0%, #121212 100%)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="min-h-screen backdrop-blur-sm backdrop-filter flex items-center justify-center flex-col">
        {/* Score Card */}
        <motion.div
          className="relative z-10 bg-black/30 backdrop-blur-md border border-purple-500/30 shadow-xl rounded-xl p-8 w-[500px] hover:border-blue-500 transition-all duration-500 ease-in-out flex flex-col items-center justify-center space-y-4"
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              "0px 0px 15px rgba(0, 255, 255, 0.5)",
              "0px 0px 25px rgba(0, 0, 255, 0.6)",
              "0px 0px 15px rgba(0, 255, 255, 0.5)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {/* Title */}
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Your Total Score
          </h2>

          {/* Animated Score */}
          <motion.div
            className={`text-5xl font-bold tracking-wide ${
              isAnimationDone ? "text-green-400" : "text-blue-400"
            }`}
            animate={{
              scale: [1, 1.1, 1],
              textShadow: [
                "0px 0px 15px rgba(0, 255, 255, 0.8)",
                "0px 0px 30px rgba(0, 255, 255, 0.8)",
                "0px 0px 15px rgba(0, 255, 255, 0.8)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {score}
          </motion.div>

          <p className="text-gray-400 text-sm">Your Current Score</p>
          
          {/* Score Components */}
          {scoreDetails && (
            <div className="w-full mt-4 space-y-2">
              <h3 className="text-lg font-semibold text-cyan-400">Score Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 p-2 rounded">
                  <span className="text-gray-400">Twitter: </span>
                  <span className="text-white font-medium">{scoreDetails.twitter}</span>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <span className="text-gray-400">Wallet: </span>
                  <span className="text-white font-medium">{scoreDetails.wallet}</span>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <span className="text-gray-400">Telegram: </span>
                  <span className="text-white font-medium">{scoreDetails.telegram}</span>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <span className="text-gray-400">Total: </span>
                  <span className="text-white font-medium">{realScore}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="w-full mt-4">
              <h3 className="text-lg font-semibold text-cyan-400">Your Badges</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {badges.map((badge, index) => (
                  <span key={index} className="bg-blue-900/40 text-cyan-300 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Connected Wallets */}
          {connectedWallets.length > 0 && (
            <div className="w-full mt-4">
              <h3 className="text-lg font-semibold text-cyan-400">Connected Wallets</h3>
              <div className="space-y-2 mt-2">
                {connectedWallets.map((wallet, index) => (
                  <div key={index} className="bg-black/30 p-2 rounded flex justify-between items-center">
                    <span className="text-gray-300">{formatAddress(wallet.address)}</span>
                    <span className="bg-blue-900/50 text-xs px-2 py-1 rounded text-cyan-300">
                      {wallet.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Test Algorithm Button */}
          <button 
            onClick={testAlgorithm}
            className="mt-4 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-white font-medium transition-all"
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Test Algorithm Now'}
          </button>

          {/* Verida Connect Button */}
          {!veridaConnected && (
            <motion.div
              className="w-full flex justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <Verida setVeridaConnected={setVeridaConnected} />
            </motion.div>
          )}
        </motion.div>

        {/* Connection Status */}
        <div className="bg-black/30 backdrop-blur-md border border-purple-500/30 p-4 rounded-lg mt-4 w-[500px]">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Connection Status</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className={`text-${isTwitterConnected ? "green" : "red"}-400`}>
                Twitter
              </div>
              <div className="text-xs text-gray-400">
                {isTwitterConnected ? "Connected" : "Not Connected"}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-${connectedWallets.length > 0 ? "green" : "red"}-400`}>
                Wallet
              </div>
              <div className="text-xs text-gray-400">
                {connectedWallets.length > 0 ? `${connectedWallets.length} Connected` : "Not Connected"}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-${veridaConnected ? "green" : "red"}-400`}>
                Verida
              </div>
              <div className="text-xs text-gray-400">
                {veridaConnected ? "Connected" : "Not Connected"}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mt-4 w-[500px]">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Veridapage;
