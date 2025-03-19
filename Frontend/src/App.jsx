import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import WalletConnect from "./Home/WalletConnect";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { usePrivy } from "@privy-io/react-auth";
import Verida from './Verida/Verida'
import Home from "./components/Home";
import Leaderboard from "./components/Leaderboard";
import Veridapage from "./components/Veridapage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { authenticated } = usePrivy();
  return authenticated ? children : <Navigate to="/" />;
}

function App() {

  return (
    <Routes>
      <Route path="/Home" element={<Home/>} />
      
      <Route path="/wallet" element={
        <WagmiProvider config={config}>
              <QueryClientProvider client={queryClient}>
        
        <WalletConnect/>
        </QueryClientProvider>
      </WagmiProvider>
        
        } />
        <Route path="/verida" element={<Verida/>} />
        <Route path="/Home/Leaderboard" element={<Leaderboard/>} />
        <Route path="/varidapage" element={<Veridapage/>} />
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard/:privyId/:username/:address"
        element={
          <ProtectedRoute>
                <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
