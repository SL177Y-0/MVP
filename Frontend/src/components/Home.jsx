import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
import DownloadButton from "../Home/DownloadButton"; // ✅ Import the component
import Verida from "../Verida/Verida";

const Home = () => {
  const { logout, user } = usePrivy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [realScore, setRealScore] = useState(null);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [isAnimationDone, setIsAnimationDone] = useState(false); // ✅ Track animation state
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    if (!user?.id) return;

    const fetchRealScore = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(
          `${apiBaseUrl}/api/score/total-score/${user.id}`
        );
        setRealScore(response.data.totalScore);
        console.log("✅ Real Score Fetched:", response.data.totalScore);
      } catch (err) {
        console.error("❌ Error fetching score:", err);
        setError(err.response?.data?.error || "Failed to fetch score");
      } finally {
        setLoading(false);
      }
    };

    fetchRealScore();
  }, [user?.id]);

  useEffect(() => {
    let interval;

    if (realScore !== null) {
      interval = setInterval(() => {
        setScore(Math.floor(Math.random() * 9999)); // Change score rapidly
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setScore(realScore); // ✅ Show real score after animation
        setIsAnimationDone(true);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [realScore]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
    className="min-h-screen bg-fixed bg-cover bg-center text-white"
    style={{
      background: "linear-gradient(135deg, #010101 0%, #121212 100%)",
      backgroundBlendMode: "overlay",
    }}
  >
    <div className="min-h-screen backdrop-blur-sm backdrop-filter flex items-center justify-center relative flex-col">
      {/* Top Right Buttons */}
      <div className="absolute top-6 right-10 flex space-x-4">
       <Link to='leaderboard'><button className="bg-black/30 backdrop-blur-md border border-purple-500/30 text-white px-5 py-2 rounded-lg shadow-lg hover:bg-purple-900/40 transition">
          Leaderboard
        </button></Link> 

        <button
          onClick={handleLogout}
          className="bg-black/30 backdrop-blur-md border border-purple-500/30 text-white px-5 py-2 rounded-lg shadow-lg hover:bg-purple-900/40 transition"
        >
          Logout
        </button>
      </div>

      {/* Score Card */}
      <motion.div
        className="relative z-10 bg-black/30 backdrop-blur-md border border-purple-500/30 shadow-xl rounded-xl p-8 w-[400px] hover:border-orange-500 transition-all duration-500 ease-in-out flex flex-col items-center justify-center space-y-4"
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
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Animated NFT Card (Now Fits Inside Card) */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{
            rotateY: [0, 180, 360],
            x: [0, 5, -5, 0],
            y: [0, -5, 5, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <img
            src="/nft.png"
            alt="NFT Card"
            className="w-40 h-[220px] rounded-xl shadow-2xl border-4 border-cyan-400 bg-opacity-80 backdrop-blur-md"
          />
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
          YOU ARE <span className="text-orange-500">All Rounder</span>
        </h2>

        {/* Animated or Real Score */}
        <motion.div
          className={`text-5xl font-bold tracking-wide ${
            isAnimationDone ? "text-green-400" : "text-orange-400"
          }`}
          animate={{
            scale: [1, 1.1, 1],
            textShadow: [
              "0px 0px 15px rgba(255, 165, 0, 0.8)",
              "0px 0px 30px rgba(255, 69, 0, 0.8)",
              "0px 0px 15px rgba(255, 165, 0, 0.8)",
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

        <p className="text-gray-400 text-sm">Your Total Score</p>

        {/* Share & Download Buttons (Now Properly Inside) */}
        <motion.div
          className="w-full flex justify-center"
          whileHover={{ scale: 1.05 }}
        >
          <DownloadButton />
        </motion.div>
      </motion.div>
    </div>
  </div>
  );
};

export default Home;
