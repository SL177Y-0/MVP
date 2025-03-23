import axios from 'axios';
import { 
  validateTwitterUsername, 
  validateWalletAddress, 
  validatePrivyId,
  validateVeridaDid,
  validateScoreData 
} from './validators';

// Get the API base URL from the environment variable with a fallback
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 // 30 seconds timeout
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Check if we have an auth token in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem('authToken');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API utility functions
export const getScore = async (privyId: string, username: string, walletAddress: string | null = null) => {
  // Validate inputs
  const privyIdError = validatePrivyId(privyId);
  if (privyIdError) throw new Error(privyIdError);
  
  const usernameError = validateTwitterUsername(username);
  if (usernameError) throw new Error(usernameError);
  
  if (walletAddress) {
    const walletError = validateWalletAddress(walletAddress);
    if (walletError) throw new Error(walletError);
  }
  
  try {
    const response = await api.get(`/api/score/get-score/${privyId}/${username}/${walletAddress || 'null'}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get score:', error);
    throw error;
  }
};

export const postScore = async (data: any) => {
  // Validate data
  const validationError = validateScoreData(data);
  if (validationError) throw new Error(validationError);
  
  try {
    const response = await api.post('/api/score/get-score', data);
    return response.data;
  } catch (error) {
    console.error('Failed to post score:', error);
    throw error;
  }
};

export const connectVerida = async (userDid: string, authToken: string) => {
  // Validate DID
  const didError = validateVeridaDid(userDid);
  if (didError) throw new Error(didError);
  
  if (!authToken) throw new Error('Auth token is required');
  
  try {
    const response = await api.post('/api/score/get-score', { userDid, authToken });
    return response.data;
  } catch (error) {
    console.error('Failed to connect Verida:', error);
    throw error;
  }
};

export default api; 