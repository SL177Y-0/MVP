/**
 * @deprecated - This file is deprecated. All functionality has been moved to NewScoreController.js.
 * This file only exists for backward compatibility and will be removed in future versions.
 */

const { CollectData, getTotalScore, evaluateUser } = require("./NewScoreController");

// Forward all calls to the new controller for consistency
module.exports = { 
  calculateScore: CollectData, 
  getTotalScore, 
  getTelegramScore: async (req, res) => {
    console.warn("DEPRECATED: Using old scoreController.js getTelegramScore. Please update to use NewScoreController.js");
    try {
      const { privyId } = req.params;
      
      if (!privyId) {
        return res.status(400).json({ error: "Privy ID is required" });
      }
      
      // Forward to evaluateUser which includes Telegram scores
      const evaluation = await evaluateUser(null, null, null, null, privyId);
      return res.json({ telegramScore: evaluation.telegramScore || 0 });
    } catch (error) {
      console.error("❌ Error fetching Telegram score:", error.message);
      return res.status(500).json({ error: "Server Error" });
    }
  }
};