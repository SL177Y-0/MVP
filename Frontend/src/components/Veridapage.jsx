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
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [veridaConnected, setVeridaConnected] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    if (!user?.id) return;

    const fetchVeridaScore = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(
          `${apiBaseUrl}/api/score/total-score/${user.id}`
        );
        setRealScore(response.data.totalScore);
        console.log("✅ Real Score Fetched from Verida:", response.data.totalScore);
      } catch (err) {
        console.error("❌ Error fetching Verida score:", err);
        setError(err.response?.data?.error || "Failed to fetch score");
      } finally {
        setLoading(false);
      }
    };

    fetchVeridaScore();
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
          className="relative z-10 bg-black/30 backdrop-blur-md border border-purple-500/30 shadow-xl rounded-xl p-8 w-[400px] hover:border-blue-500 transition-all duration-500 ease-in-out flex flex-col items-center justify-center space-y-4"
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

        {/* Message at the Bottom */}
        <p className="text-gray-400 text-sm mt-4">
          Connect to Verida to increase your score.
        </p>
      </div>
    </div>
  );
};

export default Veridapage;
