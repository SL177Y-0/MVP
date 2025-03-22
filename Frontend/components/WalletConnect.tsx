import { useState } from "react";
import { useConnect } from "wagmi";

const WalletConnectButton = () => {
  const [error, setError] = useState("");
  const { connect, connectors } = useConnect();

  const connectWalletConnect = async () => {
    try {
      const wcConnector = connectors.find((connector) => connector.id === "walletConnect");

      if (!wcConnector) {
        setError("WalletConnect is not available.");
        return;
      }

      const result = await connect({ connector: wcConnector });

      if (result?.data) {
        console.log("✅ WalletConnect Address:", result.data.account);
      }
    } catch (err) {
      setError(`Failed to connect with WalletConnect: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <button
        onClick={connectWalletConnect}
        className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-500 transition"
      >
        Connect WalletConnect
      </button>
  
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default WalletConnectButton;
