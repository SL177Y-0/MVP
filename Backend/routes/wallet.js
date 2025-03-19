const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { calculateScore } = require("../Services/scoreService");

// Connect wallet
router.post("/connect", async (req, res) => {
  try {
    const { privyId, walletAddress } = req.body;

    if (!privyId || !walletAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update user's wallet connection status
    const user = await User.findOneAndUpdate(
      { privyId },
      {
        walletConnected: true,
        walletAddress,
        $setOnInsert: { privyId },
      },
      { upsert: true, new: true }
    );

    // Calculate new score
    await calculateScore(privyId);

    res.json({
      success: true,
      message: "Wallet connected successfully",
      user,
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    res.status(500).json({ error: "Failed to connect wallet" });
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

module.exports = router; 