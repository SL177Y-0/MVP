const Token = require('../models/Token');

/**
 * Service to handle token storage and retrieval
 */
const tokenService = {
  /**
   * Store a token for a user and service
   * @param {string} userId - User ID
   * @param {string} serviceType - Service type (verida, twitter, telegram, wallet)
   * @param {string} token - Authentication token
   * @param {string} did - DID (optional)
   * @param {Date} expiresAt - Expiration date (optional)
   * @returns {Promise<Object>} - Stored token object
   */
  storeToken: async (userId, serviceType, token, did = null, expiresAt = null) => {
    try {
      // Find and update or create a new token
      const tokenObj = await Token.findOneAndUpdate(
        { userId, serviceType },
        { 
          token, 
          did: did || undefined,
          expiresAt: expiresAt || undefined
        },
        { upsert: true, new: true }
      );
      
      return tokenObj;
    } catch (error) {
      console.error(`Error storing ${serviceType} token:`, error);
      throw error;
    }
  },

  /**
   * Get a token for a user and service
   * @param {string} userId - User ID
   * @param {string} serviceType - Service type
   * @returns {Promise<string|null>} - Token string or null if not found
   */
  getToken: async (userId, serviceType) => {
    try {
      const tokenObj = await Token.findOne({ 
        userId, 
        serviceType,
        expiresAt: { $gt: new Date() }
      });
      
      return tokenObj ? tokenObj.token : null;
    } catch (error) {
      console.error(`Error retrieving ${serviceType} token:`, error);
      return null;
    }
  },

  /**
   * Get a DID for a user and service
   * @param {string} userId - User ID
   * @param {string} serviceType - Service type
   * @returns {Promise<string|null>} - DID string or null if not found
   */
  getDID: async (userId, serviceType) => {
    try {
      const tokenObj = await Token.findOne({ 
        userId, 
        serviceType,
        did: { $exists: true }
      });
      
      return tokenObj ? tokenObj.did : null;
    } catch (error) {
      console.error(`Error retrieving ${serviceType} DID:`, error);
      return null;
    }
  },

  /**
   * Delete a token for a user and service
   * @param {string} userId - User ID
   * @param {string} serviceType - Service type
   * @returns {Promise<boolean>} - True if token was deleted
   */
  deleteToken: async (userId, serviceType) => {
    try {
      const result = await Token.deleteOne({ userId, serviceType });
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting ${serviceType} token:`, error);
      return false;
    }
  },

  /**
   * Check if a token exists and is valid for a user and service
   * @param {string} userId - User ID
   * @param {string} serviceType - Service type
   * @returns {Promise<boolean>} - True if token exists and is valid
   */
  isTokenValid: async (userId, serviceType) => {
    try {
      const count = await Token.countDocuments({ 
        userId, 
        serviceType,
        expiresAt: { $gt: new Date() }
      });
      
      return count > 0;
    } catch (error) {
      console.error(`Error checking ${serviceType} token validity:`, error);
      return false;
    }
  }
};

module.exports = tokenService; 