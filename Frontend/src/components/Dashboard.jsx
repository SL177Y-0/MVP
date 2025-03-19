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

  // Extract Privy ID
  const privyID = user?.id || "guest";
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  console.log(user.email)
  // Fetch Real Score
  useEffect(() => {
    if (privyID) {
      fetchRealScore(privyID);
    }
  }, [privyID]);

  // Fetch Score from API
  const fetchRealScore = async (privyID) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${apiBaseUrl}/api/score/total-score/${privyID}`);
      const data = response.data;
      console.log("✅ Real Score Fetched:", data.totalScore);
      setRealScore(data.totalScore);
    } catch (err) {
      console.error("❌ Error fetching score:", err);
      setError(err.response?.data?.error || "Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

  // Animate Score Before Showing Real Score
  useEffect(() => {
    let interval = setInterval(() => {
      setAnimatedScore(Math.floor(Math.random() * 9999));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setAnimatedScore(realScore); // Replace with actual score
    }, 3000);

    return () => clearInterval(interval);
  }, [realScore]);

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
       
      </div>
    </div>
  );
};

export default Dashboard;
