import { useState, useEffect } from "react";
import { auth, twitterProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Twitter } from "lucide-react";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import CyberButton from "@/components/CyberButton";
import PageTransition from "@/components/PageTransition";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";
import FloatingElements from "@/components/FloatingElements";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useScore } from "@/context/ScoreContext";

const twitterTasks = [
  "Checking Crypto Twitter Presence",
  "Analyzing Engagement & Activity",
  "Measuring Follower Quality & Growth",
  "Detecting Viral Impact Score",
];



const TwitterConnectPage = () => {
  const navigate = useNavigate();
  const { setTwitterScore, setTwitterConnected } = useScore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [taskStatus, setTaskStatus] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [completedScan, setCompletedScan] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const [targetScore, setTargetScore] = useState(0); // Dynamic score from backend
const [score, setScore] = useState(0); // For animation

const loginWithTwit = async () => {
  try {
    const result = await signInWithPopup(auth, twitterProvider);
    setUser(result.user);
    setError(null);

    // 🎯 Fetch Twitter score from backend
    const response = await fetch(`${apiBaseUrl}/api/score/get-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        twitterUsername: result.user.displayName
      })
    });

    const data = await response.json();
    const total = Math.round(data?.totalScore || 0);

    setTargetScore(total); // Set real score for animation
  } catch (err) {
    setError(err.message);
  }
};

  // ✅ Use Privy (if needed)
  const { authenticated, user: privyUser } = usePrivy();

  // ✅ Fetch score when user logs in
  useEffect(() => {
    if (!user) return;

    const fetchScore = async () => {
      setLoading(true);
      setError(null);

      try {
        const privyID = user?.email || "guest";
        const username = user?.displayName || "unknown";

        const response = await fetch(
          `${apiBaseUrl}/api/score/get-score/${privyID}/${username}/null`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch score");

        const data = await response.json();
        setScore(data?.score || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [user]);


  useEffect(() => {
    if (user && targetScore) {
      handleConnect();
    }
  }, [user, targetScore]);
  
  // ✅ Login with Twitter
  const loginWithTwitter = async () => {
    try {
      const result = await signInWithPopup(auth, twitterProvider);
      setUser(result.user);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setScore(null);
  };

  // ✅ Handle Connection Process
  const handleConnect = () => {
    setIsConnecting(true);

    let currentTask = 0;
    const taskInterval = setInterval(() => {
      if (currentTask < taskStatus.length) {
        setTaskStatus((prev) => {
          const newStatus = [...prev];
          newStatus[currentTask] = true;
          return newStatus;
        });
        currentTask++;
      } else {
        clearInterval(taskInterval);
        setCompletedScan(true);

        let currentScore = 0;
        const scoreIncrement = Math.ceil(targetScore / 50);
        const scoreInterval = setInterval(() => {
          currentScore += scoreIncrement;
          if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(scoreInterval);

            setTimeout(() => {
              setTwitterScore(targetScore);
              setTwitterConnected(true);
              navigate("/connect/wallet");
            }, 2000);
          }
          setScore(currentScore);
        }, 30);
      }
    }, 800);
  };

  // ✅ Execute `handleConnect()` Immediately After Authentication
  useEffect(() => {
    if (user) {
      handleConnect();
    }
  }, [user]);

  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        <FloatingElements type="tweets" count={20} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mb-6"
          >
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className={`w-12 h-1 rounded-full ${
                  i === 0 ? "bg-cyber-green/70" : "bg-white/20"
                }`}
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
              <div className="w-12 h-12 rounded-full bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center">
                <Twitter size={24} className="text-cyber-green" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2 text-white"
            >
              Connect Your Twitter
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 mb-6"
            >
              Let's analyze your CT engagement, influence & activity.
            </motion.p>

            {!user ? (
  <div className="flex flex-col items-center gap-2">
    <button
      onClick={loginWithTwitter}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
    >
      Sign in with Twitter
    </button>
    <button
      onClick={() => navigate("/connect/wallet")}
      className="mt-4 text-white/80 hover:text-white text-sm underline transition-opacity duration-200 ease-in-out"
    >
      Skip for now
    </button>
  </div>
) : (
  <p className="text-green-500"></p>
)}


            {isConnecting && (
              <div className="text-left">
                {twitterTasks.map((task, index) => (
                  <AnimatedCheckmark
                    key={index}
                    text={task}
                    completed={taskStatus[index]}
                    index={index}
                  />
                ))}
              </div>
            )}

            {completedScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-6"
              >
                <ScoreDisplay score={score} label="Points Earned" variant="primary" />
              </motion.div>
            )}
            
          </GlassmorphicCard>
          
        </div>
      </div>
    </PageTransition>
  );
};

export default TwitterConnectPage;

