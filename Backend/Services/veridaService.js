const axios = require('axios');
const dotenv = require('dotenv');
const tokenService = require('./tokenService');
const logger = require('../utils/logger');

dotenv.config();

// Get the Verida network from environment variables
const VERIDA_NETWORK = process.env.VERIDA_NETWORK || 'testnet';
const VERIDA_API_ENDPOINT = process.env.VERIDA_API_ENDPOINT || process.env.VERIDA_API_BASE_URL || "https://api.verida.ai/api/rest/v1";
const VERIDA_APP_DID = process.env.VERIDA_APP_DID || "did:vda:mainnet:0x87AE6A302aBf187298FC1Fa02A48cFD9EAd2818D";
const VERIDA_AUTH_REDIRECT_URL = process.env.VERIDA_AUTH_REDIRECT_URL || process.env.VERIDA_REDIRECT_URI || "http://localhost:5000/api/verida/auth-callback";
const VERIDA_AUTH_URL = process.env.VERIDA_AUTH_URL || "https://app.verida.ai/auth";

logger.info('Verida Configuration', {
  network: VERIDA_NETWORK,
  endpoint: VERIDA_API_ENDPOINT,
  appDid: VERIDA_APP_DID,
  authUrl: VERIDA_AUTH_URL
});

// The correct encoded schemas
const GROUP_SCHEMA_ENCODED = 'aHR0cHM6Ly9jb21tb24uc2NoZW1hcy52ZXJpZGEuaW8vc29jaWFsL2NoYXQvZ3JvdXAvdjAuMS4wL3NjaGVtYS5qc29u';
const MESSAGE_SCHEMA_ENCODED = 'aHR0cHM6Ly9jb21tb24uc2NoZW1hcy52ZXJpZGEuaW8vc29jaWFsL2NoYXQvbWVzc2FnZS92MC4xLjAvc2NoZW1hLmpzb24%3D';

// Keywords to check for "Engage Bonus"
const ENGAGE_KEYWORDS = ['cluster', 'protocol', 'ai'];

// Helper function for base64 encoding
function btoa(str) {
  return Buffer.from(str).toString('base64');
}

// Helper function to check for keywords in text content
function checkForKeywords(text, keywordMatches) {
  if (!text) return;
  
  const normalizedText = text.toLowerCase();
  
  ENGAGE_KEYWORDS.forEach(keyword => {
    let searchPos = 0;
    const lowerKeyword = keyword.toLowerCase();
    
    while (true) {
      const foundPos = normalizedText.indexOf(lowerKeyword, searchPos);
      if (foundPos === -1) break;
      
      const isWordStart = foundPos === 0 || 
        !normalizedText[foundPos-1].match(/[a-z0-9]/) || 
        normalizedText[foundPos-1] === '#';
        
      const isWordEnd = foundPos + lowerKeyword.length >= normalizedText.length || 
        !normalizedText[foundPos + lowerKeyword.length].match(/[a-z0-9]/);
      
      if (isWordStart && isWordEnd) {
        keywordMatches.keywords[keyword]++;
        keywordMatches.totalCount++;
        break;
      }
      
      searchPos = foundPos + 1;
    }
  });
}

const veridaService = {
  // Store auth token for a user
  storeAuthToken: async (userId, token) => {
    try {
      if (!userId || !token) {
        throw new Error('User ID and token are required');
      }
      
      logger.debug('Storing Verida auth token', { userId });
      
      // Get user DID from the token
      let did = null;
      try {
        did = await veridaService.getUserDID(token);
      } catch (error) {
        logger.warn('Failed to get DID from token', { error: error.message });
      }
      
      // Set token expiry to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Store token in database
      await tokenService.storeToken(userId, 'verida', token, did, expiresAt);
      
      return { success: true, did };
    } catch (error) {
      logger.error('Error storing auth token', { error: error.message });
      throw error;
    }
  },
  
  // Get user DID using the auth token
  getUserDID: async (authToken) => {
    try {
      if (!authToken) {
        throw new Error('Auth token is required');
      }

      logger.debug('Fetching user DID');
      
      // Format auth header correctly
      const authHeader = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      
      // Try to get user profile info with the standard endpoint
      try {
        const response = await axios({
          method: 'GET',
          url: `${VERIDA_API_ENDPOINT}/user`,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        if (response.data?.did) {
          logger.debug('Retrieved DID from profile', { did: response.data.did });
          return response.data.did;
        }
      } catch (error) {
        logger.warn('Profile lookup failed', { error: error.message });
        
        // Try alternative endpoint as fallback
        try {
          const response = await axios({
            method: 'GET',
            url: `${VERIDA_API_ENDPOINT.replace('/api/rest/v1', '')}/api/profile`,
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          if (response.data?.did) {
            logger.debug('Retrieved DID from alternative endpoint', { did: response.data.did });
            return response.data.did;
          }
        } catch (fallbackError) {
          logger.error('Both profile endpoints failed', { error: fallbackError.message });
          throw new Error('Failed to retrieve user DID');
        }
      }
      
      throw new Error('Could not determine user DID');
    } catch (error) {
      logger.error('Error getting user DID', { error: error.message });
      throw error;
    }
  },

  // Get Telegram data (groups and messages) from Verida vault
  getTelegramData: async (userId) => {
    try {
      // Get token from database
      const authToken = await tokenService.getToken(userId, 'verida');
      
      if (!authToken) {
        throw new Error('No valid Verida auth token found');
      }
      
      logger.debug('Querying Verida for Telegram data');
      
      // Format auth header correctly
      const authHeader = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      
      // Initialize counters and data stores
      let groups = 0;
      let messages = 0;
      let groupItems = [];
      let messageItems = [];
      let keywordMatches = {
        totalCount: 0,
        keywords: {}
      };
      
      // Initialize keyword counts
      ENGAGE_KEYWORDS.forEach(keyword => {
        keywordMatches.keywords[keyword] = 0;
      });
      
      // Fetch Telegram groups
      try {
        logger.debug('Fetching Telegram groups');
        const groupResponse = await axios({
          method: 'POST',
          url: `${VERIDA_API_ENDPOINT}/ds/query/${GROUP_SCHEMA_ENCODED}`,
          data: {
            query: {
              sourceApplication: "https://telegram.com"
            },
            options: {
              sort: [{ _id: "desc" }],
              limit: 500
            }
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          timeout: 10000
        });
        
        // Process group data
        if (groupResponse.data?.items && Array.isArray(groupResponse.data.items)) {
          groupItems = groupResponse.data.items;
          groups = groupItems.length;
          logger.info(`Found ${groups} Telegram groups`);
          
          // Check for keywords in group content
          groupItems.forEach(group => {
            const groupText = [
              group.name || '', 
              group.description || '',
              group.subject || ''
            ].join(' ');
            
            if (groupText.trim()) {
              checkForKeywords(groupText, keywordMatches);
            }
          });
        } else {
          logger.debug('No group items found in response');
        }
      } catch (error) {
        logger.error('Error fetching Telegram groups', { error: error.message });
      }
      
      // Fetch Telegram messages
      try {
        logger.debug('Fetching Telegram messages');
        const messageResponse = await axios({
          method: 'POST',
          url: `${VERIDA_API_ENDPOINT}/ds/query/${MESSAGE_SCHEMA_ENCODED}`,
          data: {
            query: {
              sourceApplication: "https://telegram.com"
            },
            options: {
              sort: [{ _id: "desc" }],
              limit: 500
            }
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          timeout: 10000
        });
        
        // Process message data
        if (messageResponse.data?.items && Array.isArray(messageResponse.data.items)) {
          messageItems = messageResponse.data.items;
          messages = messageItems.length;
          logger.info(`Found ${messages} Telegram messages`);
          
          // Check for keywords in message content
          messageItems.forEach(message => {
            // Extract text content from message
            let allTextFields = [];
            
            // Add all string fields from the message object
            Object.entries(message).forEach(([key, value]) => {
              if (typeof value === 'string') {
                allTextFields.push(value);
              } else if (typeof value === 'object' && value !== null) {
                // Check nested objects (like "body" or "data")
                Object.values(value).forEach(nestedValue => {
                  if (typeof nestedValue === 'string') {
                    allTextFields.push(nestedValue);
                  }
                });
              }
            });
            
            const messageText = allTextFields.join(' ');
            
            if (messageText.trim()) {
              checkForKeywords(messageText, keywordMatches);
            }
          });
        } else {
          logger.debug('No message items found in response');
        }
      } catch (error) {
        logger.error('Error fetching Telegram messages', { error: error.message });
      }
      
      // Return all data
      return {
        success: true,
        groups,
        messages,
        keywordMatches
      };
    } catch (error) {
      logger.error('Error querying Verida vault', { error: error.message });
      throw error;
    }
  },

  // Get Telegram counts (simplified version of getTelegramData)
  getTelegramCounts: async (userId) => {
    try {
      // Get token from database
      const authToken = await tokenService.getToken(userId, 'verida');
      
      if (!authToken) {
        throw new Error('No valid Verida auth token found');
      }
      
      logger.debug('Getting Telegram counts');
      
      // Format auth header correctly
      const authHeader = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      
      // Initialize response object
      const counts = {
        groups: 0,
        messages: 0
      };
      
      // Get group count
      try {
        const groupCountResponse = await axios({
          method: 'POST',
          url: `${VERIDA_API_ENDPOINT}/search/count`,
          data: {
            schema: 'https://common.schemas.verida.io/social/chat/group/v0.1.0/schema.json',
            query: {
              sourceApplication: "https://telegram.com"
            }
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          timeout: 10000
        });
        
        if (groupCountResponse.data && typeof groupCountResponse.data.count === 'number') {
          counts.groups = groupCountResponse.data.count;
          logger.debug('Retrieved group count', { count: counts.groups });
        }
      } catch (error) {
        logger.warn('Failed to get group count', { error: error.message });
      }
      
      // Get message count
      try {
        const messageCountResponse = await axios({
          method: 'POST',
          url: `${VERIDA_API_ENDPOINT}/search/count`,
          data: {
            schema: 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json',
            query: {
              sourceApplication: "https://telegram.com"
            }
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          timeout: 10000
        });
        
        if (messageCountResponse.data && typeof messageCountResponse.data.count === 'number') {
          counts.messages = messageCountResponse.data.count;
          logger.debug('Retrieved message count', { count: counts.messages });
        }
      } catch (error) {
        logger.warn('Failed to get message count', { error: error.message });
      }
      
      return counts;
    } catch (error) {
      logger.error('Error getting Telegram counts', { error: error.message });
      throw error;
    }
  },

  // Calculate Verida score based on Telegram data
  calculateVeridaScore: async (userId) => {
    try {
      logger.info('Calculating Verida score', { userId });
      
      // Get Telegram data
      const telegramData = await veridaService.getTelegramData(userId);
      
      // Define score weights
      const weights = {
        groupWeight: 5,      // Points per group
        messageWeight: 1,    // Points per message
        keywordWeight: 10    // Points per keyword match
      };
      
      // Calculate component scores
      const groupScore = telegramData.groups * weights.groupWeight;
      const messageScore = telegramData.messages * weights.messageWeight;
      const keywordScore = telegramData.keywordMatches.totalCount * weights.keywordWeight;
      
      // Calculate raw score (sum of all components)
      const rawScore = groupScore + messageScore + keywordScore;
      
      // No longer cap the score at 100
      const finalScore = rawScore;
      
      logger.debug('Score calculation complete', {
        groupScore,
        messageScore,
        keywordScore,
        rawScore,
        finalScore
      });
      
      // Prepare the result object
      const result = {
        success: true,
        score: finalScore,
        details: {
          groups: {
            count: telegramData.groups,
            score: groupScore
          },
          messages: {
            count: telegramData.messages,
            score: messageScore
          },
          keywords: {
            matches: telegramData.keywordMatches,
            score: keywordScore
          },
          rawScore
        }
      };
      
      return result;
    } catch (error) {
      logger.error('Error calculating Verida score', { error: error.message });
      
      return {
        success: false,
        error: `Failed to calculate Verida score: ${error.message}`,
        score: 0,
        details: {}
      };
    }
  },

  // Generate auth URL for Verida connection
  generateAuthUrl: (redirectUrl) => {
    try {
      logger.debug('Generating Verida auth URL');
      
      // Define scopes needed for Telegram data
      const scopesList = [
        'api:ds-query',
        'api:search-universal',
        'ds:social-email',
        'api:connections-profiles',
        'api:connections-status',
        'api:db-query',
        'api:ds-get-by-id',
        'api:db-get-by-id',
        'api:ds-update',
        'api:search-ds',
        'api:search-chat-threads',
        'ds:r:social-chat-group',
        'ds:r:social-chat-message'
      ];
      
      // Set frontend redirect URL (where to redirect after backend processes the callback)
      const frontendRedirectUrl = redirectUrl || '/connect/telegram';
      
      // Construct URL with multiple scope parameters
      let authUrl = 'https://app.verida.ai/auth?';
      
      // Add each scope individually
      scopesList.forEach(scope => {
        authUrl += `scopes=${encodeURIComponent(scope)}&`;
      });
      
      // Add redirect URL (our backend) and appDID
      authUrl += `redirectUrl=${encodeURIComponent(VERIDA_AUTH_REDIRECT_URL)}`;
      authUrl += `&appDID=${encodeURIComponent(VERIDA_APP_DID)}`;
      authUrl += `&postAuth=${encodeURIComponent(frontendRedirectUrl)}`;
      
      logger.debug('Generated auth URL', { 
        length: authUrl.length,
        scopes: scopesList.length
      });
      
      return authUrl;
    } catch (error) {
      logger.error('Error generating auth URL', { error: error.message });
      throw error;
    }
  }
};

module.exports = veridaService;