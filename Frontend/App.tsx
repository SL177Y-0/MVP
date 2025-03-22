
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScoreProvider } from "./context/ScoreContext";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import { AnimatePresence } from "framer-motion";
import Analysis from './pages/Analysis'
import Index from "./pages/Index";
import StartPage from "./pages/StartPage";
import TwitterConnectPage from "./pages/TwitterConnectPage";
import TelegramConnectPage from "./pages/TelegramConnectPage";
import WalletConnectPage from "./pages/WalletConnectPage";
import ScorecardPage from "./pages/ScorecardPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ScoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<StartPage />} />
              <Route path="/index" element={<Index />} />
              <Route path="/start" element={<StartPage />} />
              <Route path="/connect/twitter" element={<TwitterConnectPage />} />
              <Route path="/connect/telegram" element={<TelegramConnectPage />} />
              <Route path="/connect/wallet" element={
                
               
        <WagmiProvider config={config}>
       
  
  <WalletConnectPage/>
 
</WagmiProvider>
} />
              <Route path="/scorecard" element={<ScorecardPage />} />
              <Route path="/dashboard" element={<Analysis/>} />
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </ScoreProvider>
  </QueryClientProvider>
);

export default App;
