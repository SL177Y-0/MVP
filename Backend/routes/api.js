const express = require('express');
const router = express.Router();
const veridaService = require('../Services/veridaService.js');
const Score = require("../models/Score");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

// Register or update user
router.post('/user/register', async (req, res) => {
  try {
    const { privyId, username, email, walletAddress, twitterUsername, veridaUserId } = req.body;
    
    if (!privyId) {
      return res.status(400).json({ success: false, error: "Privy ID is required" });
    }
    
    console.log(`📢 Registering/updating user: PrivyID(${privyId})`);
    
    // Find or create user
    let user = await User.findOne({ privyId });
    
    if (!user) {
      // Create new user
      user = new User({
        privyId,
        username: username || null,
        email: email || null,
        createdAt: new Date()
      });
      console.log(`✅ Creating new user with PrivyID: ${privyId}`);
    } else {
      console.log(`✅ Updating existing user with PrivyID: ${privyId}`);
    }
    
    // Update user fields if provided
    if (walletAddress) {
      user.walletConnected = true;
      user.walletAddress = walletAddress;
    }
    
    if (twitterUsername) {
      user.twitterConnected = true;
      user.twitterUsername = twitterUsername;
    }
    
    if (veridaUserId) {
      user.veridaConnected = true;
      user.veridaUserId = veridaUserId;
    }
    
    // Update timestamps
    user.updatedAt = new Date();
    
    await user.save();
    
    // Create or update score entry
    let score = await Score.findOne({ privyId });
    
    if (!score) {
      score = new Score({
        privyId,
        username: username || null,
        email: email || null,
        totalScore: 0,
        twitterScore: 0,
        telegramScore: 0,
        wallets: walletAddress ? [{ walletAddress, score: 10 }] : []
      });
      
      await score.save();
    }
    
    return res.json({
      success: true,
      user: {
        privyId: user.privyId,
        username: user.username,
        twitterConnected: user.twitterConnected,
        walletConnected: user.walletConnected,
        veridaConnected: user.veridaConnected,
        totalScore: score.totalScore
      }
    });
    
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

// Calculate FOMOscore based on Telegram data
router.post('/score', async (req, res) => {
  try {
    const { did, authToken } = req.body;
    
    if (!authToken) {
      return res.status(400).json({ error: 'Auth token is required' });
    }

    let userDid = did;
    // If no DID provided, try to fetch it using the auth token
    if (!did || did === 'unknown') {
      try {
        userDid = await veridaService.getUserDID(authToken);
        console.log('Retrieved DID from auth token:', userDid);
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid DID', 
          message: 'Could not retrieve your Verida DID. Please try reconnecting with Verida.' 
        });
      }
    }

    console.log('Received score request for DID:', userDid);
    
    // Get Telegram data from Verida vault
    try {
      const telegramData = await veridaService.getTelegramData(userDid, authToken);
      
      // Calculate FOMOscore
      const fomoScore = calculateFOMOscore(telegramData);
      console.log('Calculated FOMO score:', fomoScore);
      
      return res.json({ 
        score: fomoScore,
        did: userDid,
        data: {
          groups: telegramData.groups,
          messages: telegramData.messages,
          keywordMatches: telegramData.keywordMatches
        }
      });
    } catch (veridaError) {
      console.error('Error getting Telegram data:', veridaError);
      return res.status(500).json({
        error: 'Failed to fetch Telegram data',
        message: veridaError.message || 'Could not retrieve your Telegram data from Verida'
      });
    }
  } catch (error) {
    console.error('Error calculating FOMOscore:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate FOMOscore', 
      message: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to calculate FOMOscore (scaled 1-10)
function calculateFOMOscore(data) {
  const { groups, messages, keywordMatches } = data;
  
  // Add engage bonus from keywords
  const keywordBonus = keywordMatches ? keywordMatches.totalCount * 0.5 : 0;
  
  // Base calculation - raw activity score
  const rawScore = groups + messages * 0.1 + keywordBonus;
  
  // Scale to 1-10 range using logarithmic scale
  // This handles wide ranges of activity more gracefully
  const scaledScore = 1 + 9 * Math.min(1, Math.log10(rawScore + 1) / Math.log10(101));
  
  // Log the calculation for debugging
  console.log(`Score calculation: groups=${groups}, messages=${messages}, keywordBonus=${keywordBonus}, rawScore=${rawScore}, scaledScore=${scaledScore}`);
  
  // Round to 1 decimal place
  return Math.max(1, Math.min(10, Math.round(scaledScore * 10) / 10));
}

// Get user details with integrated score data
router.get("/user/:privyId", async (req, res) => {
  try {
    const { privyId } = req.params;
    
    if (!privyId) {
      return res.status(400).json({ error: "Privy ID is required" });
    }
    
    console.log(`📢 Fetching user details for PrivyID: ${privyId}`);
    
    // Find user in database
    const user = await User.findOne({ privyId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }
    
    // Find user's wallets
    let wallets = [];
    if (user._id) {
      wallets = await Wallet.find({ userId: user._id });
    }
    
    // Find user's score
    const score = await Score.findOne({ privyId });
    
    return res.json({
      success: true,
      user: {
        ...user.toObject(),
        // Remove sensitive data
        __v: undefined
      },
      wallets: wallets.map(w => ({
        address: w.address,
        balance: w.balance,
        chainId: w.chainId
      })),
      score: score ? {
        total: score.totalScore,
        twitter: score.twitterScore,
        telegram: score.telegramScore,
        wallets: score.wallets,
        badges: score.badges
      } : null
    });
    
  } catch (error) {
    console.error("❌ Error fetching user details:", error.message);
    return res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
});

module.exports = router;