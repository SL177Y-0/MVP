const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  privyId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: { 
    type: String, 
    default: null 
  },
  email: { 
    type: String, 
    unique: true,
    sparse: true
  },
  twitterConnected: {
    type: Boolean,
    default: false
  },
  twitterUsername: String,
  twitterVerified: { 
    type: Boolean, 
    default: false 
  },
  walletConnected: {
    type: Boolean,
    default: false
  },
  walletAddress: String,
  veridaConnected: { 
    type: Boolean, 
    default: false 
  },
  veridaUserId: String,
  totalScore: {
    type: Number,
    default: 0
  },
  scoreDetails: {
    twitterScore: {
      type: Number,
      default: 0
    },
    walletScore: {
      type: Number,
      default: 0
    },
    veridaScore: {
      type: Number,
      default: 0
    },
    twitterDetails: {
      type: Object,
      default: {}
    },
    walletDetails: {
      type: Object,
      default: {}
    },
    veridaDetails: {
      type: Object,
      default: {}
    }
  },
  lastScoreUpdate: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  versionKey: false,
  minimize: false // Ensure empty objects are stored
});

// Update the updatedAt field on each save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", UserSchema); 