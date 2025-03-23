const veridaService = require('../Services/veridaService');
const tokenService = require('../Services/tokenService');
const logger = require('../utils/logger');

/**
 * Verida controller
 * Handles Verida authentication and data retrieval
 */
const veridaController = {
  /**
   * Generate Verida auth URL
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateAuthUrl: async (req, res) => {
    try {
      const { redirectUrl } = req.query;
      
      if (!redirectUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'redirectUrl is required' 
        });
      }
      
      const authUrl = veridaService.generateAuthUrl(redirectUrl);
      
      res.json({ 
        success: true, 
        authUrl 
      });
    } catch (error) {
      logger.error('Error generating auth URL:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to generate auth URL' 
      });
    }
  },
  
  /**
   * Handle Verida authentication callback
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  handleAuthCallback: async (req, res) => {
    try {
      const { auth_token } = req.query;
      const { userId } = req.body;
      
      if (!auth_token) {
        return res.status(400).json({ 
          success: false, 
          error: 'No auth token provided' 
        });
      }
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'userId is required' 
        });
      }
      
      // Store token and get DID
      const result = await veridaService.storeAuthToken(userId, auth_token);
      
      res.json({
        success: true,
        did: result.did
      });
    } catch (error) {
      logger.error('Error handling auth callback:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to process authentication' 
      });
    }
  },
  
  /**
   * Get Telegram data from Verida vault
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTelegramData: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'userId is required' 
        });
      }
      
      // Check if token is valid
      const isValid = await tokenService.isTokenValid(userId, 'verida');
      
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token', 
          requiresAuth: true 
        });
      }
      
      // Get Telegram data
      const telegramData = await veridaService.getTelegramData(userId);
      
      res.json({
        success: true,
        data: telegramData
      });
    } catch (error) {
      logger.error('Error fetching Telegram data:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch Telegram data' 
      });
    }
  },
  
  /**
   * Get Telegram message and group counts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTelegramCounts: async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'userId is required' 
        });
      }
      
      // Check if token is valid
      const isValid = await tokenService.isTokenValid(userId, 'verida');
      
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or expired token', 
          requiresAuth: true 
        });
      }
      
      // Get counts
      const counts = await veridaService.getTelegramCounts(userId);
      
      res.json({
        success: true,
        data: counts
      });
    } catch (error) {
      logger.error('Error fetching Telegram counts:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch Telegram counts' 
      });
    }
  }
};

module.exports = veridaController; 