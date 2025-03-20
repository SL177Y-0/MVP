import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import Verida from "../Verida/Verida";

// Blockchain Networks Data (With Names Displayed)
const blockchainNetworks = [
  { name: "Ethereum", image: "/icons/eth.png", position: "top-10 left-[10%]" },
  { name: "Binance", image: "/icons/binance.png", position: "top-20 right-[15%]" },
  { name: "Fantom", image: "/icons/fantom.png", position: "bottom-[15%] left-[5%]" },
  { name: "zkSync", image: "/icons/zksync.png", position: "bottom-5 right-[20%]" },
  { name: "Optimism", image: "/icons/optimism.png", position: "top-[50%] left-[5%]" },
  { name: "Avalanche", image: "/icons/avalanche.png", position: "bottom-[30%] right-[10%]" },
  { name: "Moonbeam", image: "/icons/moonbeam.png", position: "top-[25%] right-[5%]" },
  { name: "Aurora", image: "/icons/aurora.png", position: "bottom-[2%] left-[45%]" },
];

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout, user } = usePrivy();
  const navigate = useNavigate();
  const { username, address } = useParams();
  const [title, setTitle] = useState("ALL ROUNDOOR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [realScore, setRealScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [finalScore, setFinalScore] = useState(Math.floor(Math.random() * 9000) + 1000);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);
  const [veridaConnected, setVeridaConnected] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState([]);

  // Extract Privy ID
  const privyID = user?.id || "guest";
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  console.log(user.email)
  // Update useEffect for fetching and storing data
  useEffect(() => {
    // 1. Retrieve privyId from user object or params
    const privyId = user?.id || address;
    
    if (!privyId) {
      console.error("❌ No privyId found");
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    
    // 2. Fetch complete user score and details
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch score data
        const response = await axios.get(`${apiBaseUrl}/api/score/total-score/${privyId}`);
        console.log("✅ User score data:", response.data);
        
        if (response.data.totalScore !== undefined) {
          setRealScore(response.data.totalScore);
        }
        
        // Fetch user profile data
        const userResponse = await axios.get(`${apiBaseUrl}/api/user/${privyId}`);
        console.log("✅ User profile data:", userResponse.data);
        
        // Store connection status
        if (userResponse.data.user) {
          setIsTwitterConnected(userResponse.data.user.twitterConnected || false);
          setVeridaConnected(userResponse.data.user.veridaConnected || false);
          setConnectedWallets(userResponse.data.wallets || []);
          
          // Update localStorage with latest user data for persistence
          localStorage.setItem('userData', JSON.stringify({
            privyId,
            twitterConnected: userResponse.data.user.twitterConnected || false,
            veridaConnected: userResponse.data.user.veridaConnected || false,
            walletConnected: userResponse.data.user.walletConnected || false,
            walletAddress: userResponse.data.user.walletAddress,
            veridaUserId: userResponse.data.user.veridaUserId,
            totalScore: response.data.totalScore || 0,
            lastUpdated: new Date().toISOString()
          }));
        }
        
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        setError(err.response?.data?.error || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, apiBaseUrl, address]);
  
  // Connect Twitter function
  const connectTwitter = async () => {
    try {
      // Implementation depends on your Twitter auth flow
      console.log("Connecting Twitter account...");
      // This would typically redirect to Twitter OAuth
    } catch (error) {
      setError("Failed to connect Twitter");
      console.error(error);
    }
  };
  
  // Connect Wallet function (if not using Privy's built-in wallet)
  const connectWallet = async () => {
    try {
      if (!user?.wallet?.address) {
        setError("No wallet connected via Privy");
        return;
      }
      
      const walletAddress = user.wallet.address;
      console.log(`Connecting wallet: ${walletAddress}`);
      
      // Send wallet address to backend
      const response = await axios.post(`${apiBaseUrl}/api/wallet/connect`, {
        privyId: user.id,
        walletAddress,
        chainId: user.wallet.chainId || null
      });
      
      if (response.data.success) {
        console.log("Wallet connected successfully:", response.data);
        
        // Refresh user data to show updated wallet status
        const userResponse = await axios.get(`${apiBaseUrl}/api/user/${user.id}`);
        if (userResponse.data.success && userResponse.data.user) {
          setConnectedWallets([...connectedWallets, { address: walletAddress }]);
          setRealScore(userResponse.data.score?.total || 0);
        }
      }
    } catch (error) {
      setError("Failed to connect wallet");
      console.error(error);
    }
  };
  
  // Connect Verida function
  const connectVerida = async () => {
    try {
      // Get Verida auth URL from backend
      const response = await axios.get(`${apiBaseUrl}/api/verida/auth/url`);
      if (response.data.authUrl) {
        // Redirect to Verida auth
        window.location.href = response.data.authUrl;
      } else {
        setError("Failed to get Verida auth URL");
      }
    } catch (error) {
      setError("Failed to connect Verida");
      console.error(error);
    }
  };
  
  // Update useEffect for score animation
  useEffect(() => {
    // Start animation sequence
    let interval = setInterval(() => {
      setAnimatedScore(Math.floor(Math.random() * 9999));
    }, 100);

    // After a delay, show the real score
    setTimeout(() => {
      clearInterval(interval);
      setAnimatedScore(realScore || 0);
    }, 3000);

    return () => clearInterval(interval);
  }, [realScore]);
  
  // Render connection status buttons/indicators
  const renderConnectionStatus = () => {
    return (
      <div className="flex flex-col space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <span>Twitter</span>
          {isTwitterConnected ? (
            <span className="text-green-500">Connected</span>
          ) : (
            <button 
              onClick={connectTwitter}
              className="bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              Connect
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span>Wallet</span>
          {connectedWallets.length > 0 ? (
            <span className="text-green-500">Connected ({connectedWallets.length})</span>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-purple-500 px-3 py-1 rounded text-white text-sm"
            >
              Connect
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span>Verida</span>
          {veridaConnected ? (
            <span className="text-green-500">Connected</span>
          ) : (
            <button 
              onClick={connectVerida}
              className="bg-cyan-500 px-3 py-1 rounded text-white text-sm"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen text-white overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #010101 0%, #121212 100%)",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Blockchain Network Background Layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full mt-14 bg-gradient-to-b from-gray-800 to-black opacity-20 blur-3xl"></div>
      </div>

      {/* Static Blockchain Logos (With Names) */}
      {blockchainNetworks.map((network, index) => (
        <div key={index} className={`absolute flex items-center space-x-2 ${network.position}`}>
          <img src={network.image} alt={network.name} className="w-10 h-10 opacity-90" />
          <span className="text-gray-300 font-semibold text-lg">{network.name}</span>
        </div>
      ))}

      {/* Logout Button (Top Right) */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-8 bg-red-600 text-white px-5 py-2 rounded-lg shadow-lg hover:bg-red-700 transition"
      >
        Logout
      </button>

      {/* Main Container for Score Card and Verida */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Main Score Card */}
        <motion.div
          className="bg-gradient-to-b from-gray-900 to-black bg-opacity-60 backdrop-blur-xl shadow-lg rounded-xl p-10 w-[400px] h-[500px] border border-cyan-400 hover:border-pink-500 transition-all duration-500 ease-in-out flex flex-col items-center justify-center"
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              "0px 0px 15px rgba(0, 255, 255, 0.5)",
              "0px 0px 25px rgba(255, 105, 180, 0.6)",
              "0px 0px 15px rgba(0, 255, 255, 0.5)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Title */}
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-5">
            Cluster Protocol
          </h2>
          <p className="mb-6 text-gray-300 tracking-wide font-light text-sm text-center">
            Our Gateway to Social & On-Chain Engagement & Chain Abstraction
          </p>

          {/* Dynamic Score Animation */}
          <motion.div
            className="relative text-5xl font-bold text-cyan-400 tracking-wide"
            animate={{
              scale: [1, 1.1, 1],
              textShadow: [
                "0px 0px 15px rgba(0, 255, 255, 0.8)",
                "0px 0px 30px rgba(255, 105, 180, 0.8)",
                "0px 0px 15px rgba(0, 255, 255, 0.8)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {animatedScore}
          </motion.div>

          {/* Sonic Waves Effect */}
          <div className="absolute -z-1 top-[48%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px]">
            <div className="wave absolute w-full h-full border border-cyan-400 opacity-30 animate-ping"></div>
            <div className="wave absolute w-full h-full border border-cyan-400 opacity-20 animate-ping delay-100"></div>
            <div className="wave absolute w-full h-full border border-cyan-400 opacity-10 animate-ping delay-200"></div>
          </div>

          {/* Buttons */}
          <p className="mt-6 text-gray-400">Your Calculated FOMO Score</p>
          <motion.button
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg w-full font-medium shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/wallet")}
          >
            Connect Wallet
          </motion.button>
          <p className="mt-3 text-gray-500 text-sm cursor-pointer hover:text-cyan-400">
            Connect More Wallets To Increase Score
          </p>
        </motion.div>

        {/* Verida Component Container */}
        {renderConnectionStatus()}
      </div>
    </div>
  );
};

export default Dashboard;
