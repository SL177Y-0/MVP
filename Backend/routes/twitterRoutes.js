const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");
const Score = require("../models/Score");
const { getUserDetails } = require("../controllers/twitterController");

// Connect Twitter account
router.post("/connect", async (req, res) => {
  try {
    const { privyId, twitterUsername, twitterId } = req.body;
    
    if (!privyId) {
      return res.status(400).json({ 
        success: false, 
        error: "Privy ID is required" 
      });
    }
    
    if (!twitterUsername) {
      return res.status(400).json({ 
        success: false, 
        error: "Twitter username is required" 
      });
    }
    
    console.log(`📢 Connecting Twitter account: ${twitterUsername} to user: ${privyId}`);
    
    // Find user by privyId
    let user = await User.findOne({ privyId });
    
    if (!user) {
      // Create new user if not found
      user = new User({
        privyId,
        username: twitterUsername,
        twitterConnected: true,
        twitterUsername,
        createdAt: new Date()
      });
    } else {
      // Update existing user
      user.twitterConnected = true;
      user.twitterUsername = twitterUsername;
      user.updatedAt = new Date();
    }
    
    await user.save();
    
    // Fetch Twitter user details to calculate score
    const userData = await getUserDetails(twitterUsername);
    
    // Calculate Twitter score
    let twitterScore = 10; // Default base score
    
    if (userData?.data?.user?.result) {
      const twitterUser = userData.data.user.result;
      
      // Calculate score based on user metrics
      if (twitterUser.legacy) {
        const { followers_count, statuses_count, favourites_count, listed_count } = twitterUser.legacy;
        
        // Follower score (max 30)
        if (followers_count >= 10000) twitterScore += 30;
        else if (followers_count >= 1000) twitterScore += 20;
        else if (followers_count >= 100) twitterScore += 10;
        
        // Tweet activity score (max 20)
        if (statuses_count >= 5000) twitterScore += 20;
        else if (statuses_count >= 1000) twitterScore += 15;
        else if (statuses_count >= 100) twitterScore += 10;
        
        // Engagement score - based on favorites (max 15)
        if (favourites_count >= 5000) twitterScore += 15;
        else if (favourites_count >= 1000) twitterScore += 10;
        else if (favourites_count >= 100) twitterScore += 5;
        
        // List memberships (max 15)
        if (listed_count >= 100) twitterScore += 15;
        else if (listed_count >= 10) twitterScore += 10;
        else if (listed_count >= 1) twitterScore += 5;
      }
      
      // Verified account bonus
      if (twitterUser.is_blue_verified) {
        twitterScore += 20;
      }
    }
    
    // Update score in database
    let score = await Score.findOne({ privyId });
    
    if (!score) {
      score = new Score({
        privyId,
        username: twitterUsername,
        twitterScore,
        telegramScore: 0,
        totalScore: twitterScore,
        wallets: []
      });
    } else {
      score.twitterScore = twitterScore;
      
      // Recalculate total score
      const walletTotal = score.wallets?.reduce((acc, w) => acc + (w.score || 0), 0) || 0;
      score.totalScore = twitterScore + (score.telegramScore || 0) + walletTotal;
    }
    
    await score.save();
    
    return res.json({
      success: true,
      message: "Twitter account connected successfully",
      user: {
        privyId: user.privyId,
        twitterConnected: user.twitterConnected,
        twitterUsername: user.twitterUsername
      },
      twitterScore,
      totalScore: score.totalScore
    });
    
  } catch (error) {
    console.error(`❌ Error connecting Twitter account: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
});

// Get Twitter score
router.get("/score/:privyId", async (req, res) => {
  try {
    const { privyId } = req.params;
    
    if (!privyId) {
      return res.status(400).json({ 
        success: false, 
        error: "Privy ID is required" 
      });
    }
    
    // Find user's score
    const score = await Score.findOne({ privyId });
    
    if (!score) {
      return res.status(404).json({ 
        success: false, 
        error: "Score not found" 
      });
    }
    
    return res.json({
      success: true,
      twitterScore: score.twitterScore || 0,
      totalScore: score.totalScore || 0
    });
    
  } catch (error) {
    console.error(`❌ Error getting Twitter score: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
});

module.exports = router;
