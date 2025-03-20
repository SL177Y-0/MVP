import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const Login = () => {
  const { login, authenticated, user } = usePrivy();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  useEffect(() => {
    if (authenticated && user) {
      const username = user?.twitter?.username || null;
      const address = user?.wallet?.address || null;
      const privyId = user?.id || null;
      const email = user?.email?.address || null;

      if (privyId) {
        // Register user with backend
        registerUser(privyId, username, address, email);
        
        // Store user info in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify({
          privyId,
          username,
          address,
          email,
          loginTime: new Date().toISOString()
        }));
        
        console.log("Redirecting to:",` /dashboard/${privyId}/${username || 'guest'}/${address || 'none'}`);
        navigate(`/dashboard/${privyId}/${username || 'guest'}/${address || 'none'}`);
      }
    }
  }, [authenticated, user, navigate, apiBaseUrl]);
  
  // Function to register user with backend
  const registerUser = async (privyId, username, address, email) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/api/user/register`, {
        privyId,
        username,
        walletAddress: address,
        email,
        twitterUsername: username
      });
      
      console.log("User registration successful:", response.data);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center text-white [&h1]:text-shadow [&_h2]:text-shadow [&_h3]:text-shadow [&_h4]:text-shadow [&_th]:text-shadow [&.font-bold]:text-shadow [&_.font-medium]:text-shadow"
      style={{
        background: "linear-gradient(135deg, #010101 0%, #121212 100%)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="min-h-screen backdrop-blur-sm backdrop-filter flex items-center justify-center relative">
        {/* Animated NFT Card */}
        <motion.div
          className="absolute left-52 top-82 transform -translate-y-1/2"
          animate={{
            rotateY: [0, 180, 360], // Full horizontal flip
            x: [0, 5, -5, 0], // Slight horizontal movement for realism
            y: [0, -5, 5, -5, 0], // Floating effect
          }}
          transition={{
            duration: 6, // Slow and smooth full rotation
            repeat: Infinity, // Infinite loop
            ease: "linear", // Constant speed
          }}
          style={{ transformStyle: "preserve-3d" }} // Enables 3D effect
        >
          <img
            src="/nft.png"
            alt="NFT Card"
            className="w-60 h-[320px] rounded-xl shadow-2xl border-4 border-cyan-400 bg-opacity-80 backdrop-blur-md"
          />
        </motion.div>

        {/* Funky & Taller Login Form */}
        <motion.div
          className="relative z-10 left-40 bg-black/30 backdrop-blur-md border border-purple-500/30 shadow-2xl rounded-xl p-10 w-96 h-[440px] hover:border-pink-500 transition-all duration-500 ease-in-out ml-20"
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              "0px 0px 15px rgba(0, 255, 255, 0.5)",
              "0px 0px 25px rgba(255, 105, 180, 0.6)",
              "0px 0px 15px rgba(0, 255, 255, 0.5)",
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Title with a More Cyberpunk Feel */}
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-5">
            Cluster Protocol
          </h2>

          {/* Description Text */}
          <p className="mt-8 mb-5 text-gray-300 tracking-wide font-light text-sm">
            Your Gateway to <span className="text-cyan-400">Metaverse</span> Score Checking
          </p>

          {/* Funky Styled Input */}
          <input
            type="text"
            placeholder="Enter your Email Address"
            className="w-full px-4 py-3 mb-8 rounded-lg bg-black/40 text-white border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm"
          />

          {/* Glowing Animated Button */}
          <motion.button
            onClick={login}
            className="left-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg w-full font-medium shadow-lg hover:shadow-orange-400 transition-all transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
          >
            🚀 Create your Account
          </motion.button>

          {/* Terms & Conditions */}
          <p className="mt-5 text-xs text-gray-500">
            By signing in you agree to the{" "}
            <span className="text-cyan-400 cursor-pointer hover:underline">
              Terms and Conditions
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;