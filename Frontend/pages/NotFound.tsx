
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import CyberButton from "@/components/CyberButton";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 px-3 py-1 rounded-full bg-cyber-pink/10 border border-cyber-pink/30 inline-block"
          >
            <span className="text-xs text-cyber-pink">ERROR 404</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl mb-4 text-white font-light"
          >
            Page Not Found
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8 text-white/70 max-w-md mx-auto"
          >
            The destination you're looking for doesn't exist or has been moved.
          </motion.p>
          
          <GlassmorphicCard className="max-w-md mx-auto mb-8">
            <p className="text-white/70 mb-6">
              Would you like to return to a known location in the Cluster Protocol?
            </p>
            <CyberButton 
              onClick={() => navigate('/')} 
              variant="secondary"
              className="w-full"
            >
              Return to Start
            </CyberButton>
          </GlassmorphicCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
