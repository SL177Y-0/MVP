const mongoose = require('mongoose');

/**
 * Token Schema
 * Used to store authentication tokens for various services (Verida, Twitter, etc.)
 */
const TokenSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true,
    index: true
  },
  serviceType: {
    type: String,
    enum: ['verida', 'twitter', 'telegram', 'wallet'],
    required: true
  },
  token: {
    type: String,
    required: true
  },
  did: {
    type: String,
    sparse: true,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Create a compound index for userId and serviceType
TokenSchema.index({ userId: 1, serviceType: 1 }, { unique: true });

// Add TTL index to automatically expire tokens
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Token', TokenSchema); 