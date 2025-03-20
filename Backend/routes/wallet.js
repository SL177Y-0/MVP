const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { calculateScore } = require("../Services/scoreService");
const Score = require("../models/Score");
const Wallet = require('../models/Wallet');
const { getWalletDetails } = require('../controllers/BlockchainController');
const mongoose = require('mongoose');

// Connect wallet
router.post("/connect", async (req, res) => {
  try {
    const { privyId, walletAddress, chainId } = req.body;
    
    if (!privyId) {
      return res.status(400).json({ 
        success: false, 
        error: "Privy ID is required" 
      });
    }
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: "Wallet address is required" 
      });
    }
    
    console.log(`📢 Connecting wallet: ${walletAddress} to user: ${privyId}`);
    
    // Find user by privyId
    const user = await User.findOne({ privyId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }
    
    // Update user with wallet connection status
    user.walletConnected = true;
    user.walletAddress = walletAddress;
    await user.save();
    
    // Check if wallet already exists
    let wallet = await Wallet.findOne({ 
      userId: user._id, 
      address: walletAddress 
    });
    
    // If wallet doesn't exist, create it
    if (!wallet) {
      wallet = new Wallet({
        userId: user._id,
        address: walletAddress,
        chainId: chainId || null,
        createdAt: new Date()
      });
      
      // Get wallet details from blockchain
      try {
        const walletData = await getWalletDetails(walletAddress);
        if (walletData) {
          wallet.balance = walletData['Native Balance Result'] || 0;
        }
      } catch (error) {
        console.error(`Error fetching wallet details: ${error.message}`);
        // Continue even if wallet details can't be fetched
      }
      
      await wallet.save();
    }
    
    // Update Score entry
    let score = await Score.findOne({ privyId });
    
    if (!score) {
      score = new Score({
        privyId,
        username: user.username,
        email: user.email,
        twitterScore: 0,
        telegramScore: 0,
        totalScore: 0,
        wallets: []
      });
    }
    
    // Check if wallet already exists in score.wallets
    const walletExists = score.wallets.some(w => w.walletAddress === walletAddress);
    
    if (!walletExists) {
      score.wallets.push({
        walletAddress,
        score: 10 // Default initial score
      });
    }
    
    await score.save();
    
    // Calculate new total score
    const walletTotal = score.wallets.reduce((acc, w) => acc + (w.score || 0), 0);
    score.totalScore = (score.twitterScore || 0) + (score.telegramScore || 0) + walletTotal;
    await score.save();
    
    // Get all user's wallets for response
    const userWallets = await Wallet.find({ userId: user._id });
    
    return res.json({
      success: true,
      message: "Wallet connected successfully",
      user: {
        privyId: user.privyId,
        walletConnected: user.walletConnected,
        totalScore: score.totalScore
      },
      wallets: userWallets.map(w => ({
        address: w.address,
        balance: w.balance,
        chainId: w.chainId
      }))
    });
    
  } catch (error) {
    console.error(`❌ Error connecting wallet: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
});

// Disconnect wallet
router.post("/disconnect", async (req, res) => {
  try {
    const { privyId } = req.body;

    if (!privyId) {
      return res.status(400).json({ error: "Missing privyId" });
    }

    // Update user's wallet connection status
    const user = await User.findOneAndUpdate(
      { privyId },
      {
        walletConnected: false,
        walletAddress: null,
      },
      { new: true }
    );

    // Calculate new score
    await calculateScore(privyId);

    res.json({
      success: true,
      message: "Wallet disconnected successfully",
      user,
    });
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    res.status(500).json({ error: "Failed to disconnect wallet" });
  }
});

// Get wallet status
router.get("/status/:privyId", async (req, res) => {
  try {
    const { privyId } = req.params;

    const user = await User.findOne({ privyId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      walletConnected: user.walletConnected,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error("Error getting wallet status:", error);
    res.status(500).json({ error: "Failed to get wallet status" });
  }
});

// Get all wallets for a user
router.get('/:privyId', async (req, res) => {
  try {
    const { privyId } = req.params;
    
    if (!privyId) {
      return res.status(400).json({ 
        success: false, 
        error: "Privy ID is required" 
      });
    }
    
    // Find user by privyId
    const user = await User.findOne({ privyId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }
    
    // Get all wallets for the user
    const wallets = await Wallet.find({ userId: user._id });
    
    return res.json({
      success: true,
      wallets: wallets.map(w => ({
        address: w.address,
        balance: w.balance,
        chainId: w.chainId,
        createdAt: w.createdAt
      }))
    });
    
  } catch (error) {
    console.error(`❌ Error fetching wallets: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
});

module.exports = router; 