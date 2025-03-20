import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { BrowserProvider } from "ethers";
import { useConnect } from "wagmi";
import { useNavigate } from "react-router-dom"; // ✅ Import Navigate
import axios from "axios"; // ✅ API Requests

const WalletConnect = () => {
  const { user } = usePrivy();
  const navigate = useNavigate(); // ✅ Initialize Navigate
  const [connectedWallets, setConnectedWallets] = useState({});
  const [error, setError] = useState("");
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const { connect, connectors } = useConnect();

  const connectEthereumWallet = async (walletType, provider) => {
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const ethersProvider = new BrowserProvider(provider);
      updateWalletList(walletType, {
        address: accounts[0],
        provider: ethersProvider,
      });
    } catch (err) {
      setError(`Failed to connect to ${walletType}: ${err.message}`);
    }
  };

  const connectMetaMask = async () => {
    if (window.ethereum?.isMetaMask) {
      await connectEthereumWallet("metamask", window.ethereum);
    } else {
      setError("MetaMask is not installed.");
    }
  };

  const connectCoinbase = async () => {
    const provider =
      window.coinbaseWalletExtension ||
      (window.ethereum?.isCoinbaseWallet ? window.ethereum : null);
    if (provider) {
      await connectEthereumWallet("coinbase", provider);
    } else {
      setError("Coinbase Wallet is not installed.");
    }
  };

  const connectTrustWallet = async () => {
    if (window.trustwallet || window.ethereum?.isTrust) {
      await connectEthereumWallet("trustwallet", window.trustwallet || window.ethereum);
    } else {
      setError("Trust Wallet is not installed.");
    }
  };

  const connectBitGet = async () => {
    const provider = window.bitkeep?.ethereum || window.bitget?.ethereum;
    if (provider) {
      await connectEthereumWallet("bitget", provider);
    } else {
      setError("BitGet Wallet is not installed.");
    }
  };

  const connectPhantom = async () => {
    if (window.solana?.isPhantom) {
      try {
        const response = await window.solana.connect();
        updateWalletList("phantom", {
          address: response.publicKey.toString(),
          provider: window.solana,
        });
      } catch (err) {
        setError(`Failed to connect to Phantom: ${err.message}`);
      }
    } else {
      setError("Phantom Wallet is not installed.");
    }
  };

  const connectWalletConnect = async () => {
    try {
      const wcConnector = connectors.find(
        (connector) => connector.id === "walletConnect"
      );
      if (!wcConnector) {
        setError("WalletConnect connector not available.");
        return;
      }
      const result = await connect({ connector: wcConnector });
      if (result?.data) {
        updateWalletList("walletconnect", {
          address: result.data.account,
          provider: result.data.provider,
        });
      }
    } catch (err) {
      setError(`Failed to connect to WalletConnect: ${err.message}`);
    }
  };

  const updateWalletList = (walletType, walletData) => {
    setConnectedWallets((prev) => ({ ...prev, [walletType]: walletData }));
    localStorage.setItem(`${walletType}_connected`, walletData?.address || "");

    if (user?.id && walletData.address) {
      fetchUserScore(user.id, walletData.address, walletType);
    }

    // ✅ Navigate to Home After Successful Connection
    navigate("/home");
  };

  const fetchUserScore = async (userId, walletAddress, walletType) => {
    try {
      console.log("📤 Sending to backend:", { privyId: userId, walletAddress, walletType });
      
      // Get existing wallet data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // Initialize wallets array if it doesn't exist
      if (!userData.wallets) userData.wallets = [];
      
      // Add new wallet if it doesn't exist yet
      const existingWalletIndex = userData.wallets.findIndex(w => 
        w.address === walletAddress && w.type === walletType
      );
      
      if (existingWalletIndex === -1) {
        userData.wallets.push({
          address: walletAddress,
          type: walletType
        });
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      // Make API call with all relevant data
      const response = await axios.post(
        `${apiBaseUrl}/api/wallet/connect`,
        { 
          privyId: userId, 
          walletAddress,
          walletType
        }
      );
      
      if (response.data.success) {
        console.log("✅ Wallet connected successfully");
        
        // Calculate score
        const scoreResponse = await axios.post(
          `${apiBaseUrl}/api/score/get-score`,
          { 
            privyId: userId, 
            walletAddress,
            walletType,
            walletAddresses: userData.wallets.map(w => w.address)
          }
        );
        
        console.log("✅ Score calculated:", scoreResponse.data);
      } else {
        console.error("❌ Failed to connect wallet:", response.data.error);
      }
    } catch (error) {
      console.error("❌ Failed to fetch user score:", error.response?.data || error);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen text-white overflow-hidden">
      {/* 🔥 Background */}
      <div
    className="absolute inset-0"
    style={{
      background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    }}
  >
        <div className="absolute inset-0 bg-opacity-80 bg-black opacity-60"></div>
      </div>

      {/* 💳 Wallet Connect Card */}
      <div className="relative z-10 bg-gradient-to-b from-gray-900 to-black bg-opacity-70 backdrop-blur-lg shadow-xl rounded-xl p-10 w-[400px] border border-cyan-400 hover:border-orange-500 transition-all duration-500 ease-in-out">
        {/* 🔥 Title */}
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400 mb-5 text-center">
          Connect Your Wallet
        </h2>

        <p className="mb-6 text-gray-400 tracking-wide text-center">
          Choose your preferred wallet to proceed.
        </p>

        {/* 🚀 Wallet Connect Buttons */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={connectMetaMask}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg w-full font-medium shadow-lg hover:bg-orange-600 transition-all transform hover:scale-105"
          >
            Connect MetaMask
          </button>

          <button
            onClick={connectCoinbase}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full font-medium shadow-lg hover:bg-blue-500 transition-all transform hover:scale-105"
          >
            Connect Coinbase
          </button>

          <button
            onClick={connectTrustWallet}
            className="bg-green-600 text-white px-6 py-3 rounded-lg w-full font-medium shadow-lg hover:bg-green-500 transition-all transform hover:scale-105"
          >
            Connect Trust Wallet
          </button>

          <button
            onClick={connectBitGet}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg w-full font-medium shadow-lg hover:bg-purple-500 transition-all transform hover:scale-105"
          >
            Connect BitGet
          </button>

          <button
            onClick={connectPhantom}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg w-full font-medium shadow-lg hover:bg-gray-600 transition-all transform hover:scale-105"
          >
            Connect Phantom
          </button>

          <button
            onClick={connectWalletConnect}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg w-full font-medium shadow-lg hover:bg-teal-500 transition-all transform hover:scale-105"
          >
            Connect WalletConnect
          </button>
        </div>

        {/* 📜 Terms & Conditions */}
        <p className="mt-4 text-sm text-center text-gray-400">
          By connecting, you agree to the{" "}
          <span className="text-cyan-400 cursor-pointer hover:underline">
            Terms & Conditions
          </span>
        </p>
      </div>
    </div>
  );
};

export default WalletConnect;
