import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { usePrivy } from "@privy-io/react-auth";

function Verida({ setVeridaConnected }) {
  const location = useLocation();
  const { user } = usePrivy();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [score, setScore] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    console.log('🔄 Verida component loaded/updated');
    console.log('📍 Current location:', location.pathname + location.search);
    
    const searchParams = new URLSearchParams(location.search);
    console.log('🔍 URL parameters:', Object.fromEntries(searchParams.entries()));
    
    const status = searchParams.get('status');
    const userIdParam = searchParams.get('userId');
    const errorParam = searchParams.get('error');
    const errorMessage = searchParams.get('message');
    const score = searchParams.get('score');
    
    console.log('👤 User logged in:', user ? 'Yes' : 'No');
    if (user) {
      console.log('👤 User ID:', user.id);
    }
    
    // Check if user has Verida connected in localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.veridaConnected && userData.veridaUserId) {
      console.log('✅ User already has Verida connected:', userData.veridaUserId);
      setConnected(true);
      setUserId(userData.veridaUserId);
      if (typeof setVeridaConnected === 'function') {
        setVeridaConnected(true);
      }
      return;
    }
    
    // Handle error from callback
    if (errorParam) {
      console.error('❌ Authentication error:', errorParam, errorMessage);
      setError(errorMessage || 'Failed to authenticate with Verida.');
      setConnected(false);
      setLoading(false);
      if (typeof setVeridaConnected === 'function') {
        setVeridaConnected(false);
      }
      return;
    }
    
    // Handle successful authentication
    if (status === 'success' && userIdParam) {
      console.log('✅ Authentication successful');
      console.log('🆔 Verida User ID:', userIdParam);
      
      setUserId(userIdParam);
      setConnected(true);
      
      if (typeof setVeridaConnected === 'function') {
        setVeridaConnected(true);
      }
      
      if (user?.id) {
        console.log('🔄 Updating Verida status with backend...');
        updateUserVeridaStatus(userIdParam, score);
      } else {
        console.warn('⚠️ User not logged in, cannot update Verida status');
      }
    }
  }, [location, user, setVeridaConnected]);

  const updateUserVeridaStatus = async (veridaUserId, scoreValue) => {
    console.log(`📤 Updating user Verida status with userId: ${veridaUserId}, score: ${scoreValue || 'not provided'}`);
    
    try {
      if (!user?.id) {
        console.error('❌ No user ID found, cannot update Verida status');
        setError('User not authenticated');
        return;
      }
      
      setLoading(true);
      setError(null);

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // Get wallet addresses if available
      const walletAddresses = userData.wallets ? 
        userData.wallets.map(wallet => wallet.address) : [];
      
      const data = {
        privyId: user.id,
        veridaUserId,
        veridaConnected: true,
        // Include score if available
        score: scoreValue ? parseInt(scoreValue, 10) : undefined,
        // Include wallet information if available
        walletAddresses
      };
      
      console.log(`📤 Sending data to backend:`, data);
      
      const response = await axios.post(`${apiBaseUrl}/api/verida/update-status`, data);
      console.log(`✅ Status update response:`, response.data);
      
      if (response.data.success) {
        console.log('✅ Verida status updated successfully');
        setConnected(true);
        
        // Store Verida connection in localStorage
        userData.veridaConnected = true;
        userData.veridaUserId = veridaUserId;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // If we received a score from the API that wasn't passed in the URL
        if (!scoreValue && response.data.score) {
          console.log(`📊 Setting score from API: ${response.data.score}`);
          setScore(response.data.score);
        } else if (scoreValue) {
          // Set score from URL parameter if available
          const scoreNum = parseInt(scoreValue, 10) || 0;
          console.log(`📊 Setting score from URL parameter: ${scoreNum}`);
          setScore(scoreNum);
        }
        
        // Calculate full score with all connected data sources
        try {
          console.log('📊 Calculating full score with all data sources...');
          
          const scoreData = {
            privyId: user.id,
            veridaUserId,
            walletAddresses
          };
          
          const scoreResponse = await axios.post(`${apiBaseUrl}/api/score/get-score`, scoreData);
          
          if (scoreResponse.data.success) {
            console.log('✅ Full score calculated:', scoreResponse.data);
            
            // Update user data with score information
            userData.totalScore = scoreResponse.data.scores.totalScore;
            userData.badges = Object.keys(scoreResponse.data.badges || {});
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        } catch (scoreError) {
          console.error('❌ Error calculating full score:', scoreError);
        }
      } else {
        console.error('❌ Failed to update Verida status:', response.data.error);
        setError(response.data.error || 'Failed to update Verida status');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error updating Verida status:', error);
      setError('Failed to update Verida status with the server');
      setLoading(false);
    }
  };

  const connectWithVerida = async () => {
    try {
      console.log('🔄 Starting Verida connection process...');
      setLoading(true);
      setError(null);
      
      // Get the authentication URL from the backend
      console.log(`🌐 Requesting auth URL from: ${apiBaseUrl}/api/verida/auth/url`);
      const response = await axios.get(`${apiBaseUrl}/api/verida/auth/url`);
      
      console.log('📥 Auth URL response:', response.data);
      
      if (response.data.success) {
        console.log(`✅ Received auth URL: ${response.data.authUrl}`);
        
        // Check if URL has the expected format (includes scopes)
        if (!response.data.authUrl.includes('scopes=')) {
          console.warn('⚠️ Warning: Auth URL does not contain scopes. This may not work correctly.');
        }
        
        if (!response.data.authUrl.includes('redirectUrl=')) {
          console.warn('⚠️ Warning: Auth URL does not contain a redirect URL. Callback may fail.');
        }
        
        console.log('🔄 Redirecting to Verida for authentication...');
        // Redirect the user to Verida for authentication
        window.location.href = response.data.authUrl;
      } else {
        console.error('❌ Failed to generate auth URL:', response.data.error);
        setError('Failed to generate auth URL');
      }
    } catch (error) {
      console.error('❌ Error connecting to Verida:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      setError('Failed to connect to Verida. Please try again.');
    } finally {
      // Note: We don't set loading to false here because we're redirecting
      // and want to keep the loading state until the redirect happens
    }
  };

  const handleLogout = () => {
    setError(null);
    setLoading(false);
    setConnected(false);
    setUserId(null);
    setScore(null);
    window.location.href = '/varidapage';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-t-4 border-blue-500 rounded-full mx-auto ml-6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="bg-red-100 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-500">Oops! Something went wrong</h2>
          <p className="mt-2 text-red-700">{error}</p>
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg" onClick={handleLogout}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 bg-gradient-to-b from-gray-900 to-black bg-opacity-60 backdrop-blur-xl shadow-lg rounded-xl p-4 w-[230px] mt-4 border border-cyan-400 transition-all duration-500 ease-in-out flex flex-col items-center">
      {connected ? (
        <div className="text-center">
          <div className="text-xl font-bold text-cyan-400 mb-2">
            Verida Connected
          </div>
          {score !== null && (
            <div className="text-md text-white">
              <span className="font-semibold">Score:</span> {score}
            </div>
          )}
        </div>
      ) : (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
          onClick={connectWithVerida}
        >
          Connect with Verida
        </button>
      )}
    </div>
  );
}

export default Verida;