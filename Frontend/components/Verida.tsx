import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CyberButton from '@/components/CyberButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorToast from '@/components/ErrorToast';

interface VeridaProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

function Verida({ onConnectionChange }: VeridaProps) {
  const location = useLocation();
  const [connected, setConnected] = useState(false);
  const [fomoUser, setFomoUser] = useState<any>(null);
  const [fomoData, setFomoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState({ visible: false, message: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const [authTimeoutExpired, setAuthTimeoutExpired] = useState(false);
  const [configValid, setConfigValid] = useState(true);
  
  // Environment variables
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const veridaNetwork = import.meta.env.VITE_VERIDA_NETWORK || 'mainnet';
  const veridaAppName = import.meta.env.VITE_VERIDA_APP_NAME || 'fomoscore';
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Validate configuration on mount
  useEffect(() => {
    if (!apiBaseUrl) {
      console.error('Missing VITE_API_BASE_URL environment variable');
      setError('Missing API configuration. Please contact support.');
      setConfigValid(false);
    }
    
    if (!veridaNetwork || !veridaAppName) {
      console.error('Missing Verida configuration variables');
      setError('Missing Verida configuration. Please contact support.');
      setConfigValid(false);
    }
    
    // Log configuration for debugging
    console.log('Verida Configuration:', {
      apiBaseUrl,
      veridaNetwork,
      veridaAppName
    });
  }, []);
  
  // Clear any existing timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    };
  }, []);

  // Notify parent component when connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(connected);
    }
  }, [connected, onConnectionChange]);

  // Check for connection params in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const userIdParam = searchParams.get('userId');
    const errorParam = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    // Clear URL params without refreshing the page
    if (status || userIdParam || errorParam) {
      window.history.replaceState({}, document.title, location.pathname);
    }

    if (errorParam) {
      console.error('Authentication error:', errorParam, errorMessage);
      setError(errorMessage || 'Failed to authenticate with Verida.');
      setErrorToast({
        visible: true,
        message: errorMessage || 'Failed to authenticate with Verida.'
      });
      return;
    }

    if (status === 'success' && userIdParam) {
      console.log("✅ Authentication successful with user ID:", userIdParam);
      setUserId(userIdParam);
      setConnected(true);
      
      // Stop loading and clear timeout
      setLoading(false);
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      
      // Fetch Telegram data for this user
      fetchTelegramData(userIdParam);
    }
  }, [location]);

  const fetchTelegramData = async (userId: string) => {
    try {
      setLoading(true);
      console.log("📤 Fetching Telegram data for user:", userId);

      const response = await axios.get(
        `${apiBaseUrl}/api/verida/data/${userId}`
      );

      const data = response.data;
      console.log("✅ Verida data received:", data);
      setFomoData(data);
      
      // Make sure we're marked as connected
      setConnected(true);
    } catch (error: any) {
      console.error("❌ Failed to fetch Telegram data:", error.response?.data || error);
      setError("Failed to retrieve your Telegram data. Please try again.");
      setErrorToast({
        visible: true,
        message: "Failed to retrieve your Telegram data."
      });
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectWithVerida = async () => {
    try {
      if (!configValid) {
        throw new Error('Invalid configuration. Please contact support.');
      }
      
      setLoading(true);
      setError(null);
      setAuthTimeoutExpired(false);
      
      // Set an auth timeout (2 minutes)
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      
      authTimeoutRef.current = setTimeout(() => {
        setAuthTimeoutExpired(true);
        setLoading(false);
        setErrorToast({
          visible: true,
          message: 'Authentication timed out. Please try again.'
        });
      }, 120000); // 2 minutes
      
      // Get the auth URL from our backend
      const response = await axios.get(`${apiBaseUrl}/api/verida/auth-url`, {
        params: {
          network: veridaNetwork,
          appName: veridaAppName
        }
      });
      
      if (!response.data.authUrl) {
        throw new Error('Failed to generate Verida authentication URL');
      }
      
      console.log('Redirecting to Verida:', response.data.authUrl);
      window.location.href = response.data.authUrl;
    } catch (error: any) {
      console.error('Failed to start Verida authentication:', error);
      setError(error.message || 'Failed to connect to Verida');
      setErrorToast({
        visible: true,
        message: error.message || 'Failed to connect to Verida'
      });
      setLoading(false);
    }
  };

  if (authTimeoutExpired) {
    return (
      <div className="w-full px-4">
        <div className="text-center mb-4">
          <div className="text-red-400 mb-2">Authentication timed out</div>
          <p className="text-white/70 text-sm mb-4">
            The connection to Verida timed out. Please try again.
          </p>
          <CyberButton
            onClick={connectWithVerida}
            variant="accent"
            className="w-full"
          >
            Try Again
          </CyberButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-6">
        <LoadingSpinner size="lg" />
        <p className="text-white/70 mt-4 text-center">
          {connected 
            ? "Analyzing your Telegram data..." 
            : "Connecting to Verida..."}
        </p>
        <p className="text-white/50 mt-2 text-sm text-center">
          This may take a moment
        </p>
      </div>
    );
  }

  if (connected && userId) {
    return (
      <div className="w-full px-4">
        <div className="mb-4 flex items-center justify-center">
          <div className="w-4 h-4 bg-cyber-green rounded-full mr-2"></div>
          <span className="text-cyber-green font-medium">Connected</span>
        </div>
        
        {fomoData ? (
          <div className="p-3 bg-white/5 rounded-lg mb-4">
            <div className="mb-2">
              <span className="text-white/70">Groups: </span>
              <span className="text-white font-medium">{fomoData.groups || 0}</span>
            </div>
            <div className="mb-2">
              <span className="text-white/70">Messages: </span>
              <span className="text-white font-medium">{fomoData.messages || 0}</span>
            </div>
            <div>
              <span className="text-white/70">Keywords: </span>
              <span className="text-white font-medium">{fomoData.keywordMatches?.totalCount || 0}</span>
            </div>
          </div>
        ) : null}
        
        <CyberButton
          onClick={() => {
            setUserId(null);
            setFomoData(null);
            setConnected(false);
          }}
          variant="accent"
          className="w-full"
        >
          Reset Connection
        </CyberButton>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      {error && (
        <div className="mb-4 text-red-400 text-sm p-2 bg-red-900/20 rounded">
          {error}
        </div>
      )}
      
      <CyberButton
        onClick={connectWithVerida}
        variant="accent"
        className="w-full"
      >
        Connect Telegram
      </CyberButton>
      
      {errorToast.visible && (
        <ErrorToast 
          visible={errorToast.visible}
          message={errorToast.message} 
          onClose={() => setErrorToast({ visible: false, message: '' })} 
        />
      )}
    </div>
  );
}

export default Verida;