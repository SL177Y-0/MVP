const { getUserDetails } = require("./twitterController.js");
const { getWalletDetails } = require("./BlockchainController.js");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Score = require("../models/Score");
const mongoose = require("mongoose");

let userWallets = {}; // ✅ Store multiple wallet addresses per user

// ✅ Function to update wallet and fetch new score
async function updateWallet(req, res) {
    try {
        const { privyId, username, address } = req.body;

        if (!privyId) {
            return res.status(400).json({ error: "Privy ID is required" });
        }
        if (!address) {
            return res.status(400).json({ error: "Provide wallet address" });
        }

        console.log(`📢 Updating Wallet for: PrivyID(${privyId}) → Wallet(${address})`);

        // Find or create user
        let user = await User.findOne({ privyId });
        if (!user) {
            user = new User({
                privyId,
                username: username || null,
                walletConnected: true,
                walletAddress: address
            });
            await user.save();
        } else {
            // Update user with wallet info
            user.walletConnected = true;
            user.walletAddress = address;
            await user.save();
        }

        // ✅ Add wallet to userWallets object (avoid duplicates)
        if (!userWallets[privyId]) {
            userWallets[privyId] = new Set();
        }
        userWallets[privyId].add(address); // ✅ Add wallet to set (avoids duplicates)

        // ✅ Convert Set to Array
        const walletAddresses = Array.from(userWallets[privyId]);

        // ✅ Fetch user Twitter data if available
        let userData = null;
        if (username) {
            userData = await getUserDetails(username);
        }

        let allWalletData = [];

        // ✅ Fetch data for each wallet and store in Wallet collection
        for (let walletAddress of walletAddresses) {
            const walletData = await getWalletDetails(walletAddress);
            allWalletData.push(walletData);
            
            // Store wallet in Wallet collection
            let wallet = await Wallet.findOne({ 
                userId: user._id, 
                address: walletAddress 
            });
            
            if (!wallet) {
                wallet = new Wallet({
                    userId: user._id,
                    address: walletAddress,
                    chainId: walletData.chainId || null,
                    balance: walletData['Native Balance Result'] || 0
                });
            } else {
                wallet.balance = walletData['Native Balance Result'] || wallet.balance;
                wallet.chainId = walletData.chainId || wallet.chainId;
            }
            
            await wallet.save();
        }

        console.log("✅ Merged Wallet Data:", allWalletData);

        // ✅ Update Score document with wallet info
        let score = await Score.findOne({ privyId });
        if (!score) {
            score = new Score({
                privyId,
                username: username || null,
                wallets: walletAddresses.map(addr => ({
                    walletAddress: addr,
                    score: 10 // Default score, will be updated
                }))
            });
        } else {
            // Update existing wallets and add new ones
            for (let addr of walletAddresses) {
                const walletIndex = score.wallets.findIndex(w => w.walletAddress === addr);
                if (walletIndex >= 0) {
                    // Wallet exists, will be updated by scoreController
                } else {
                    score.wallets.push({
                        walletAddress: addr,
                        score: 10 // Default score, will be updated
                    });
                }
            }
        }
        
        await score.save();

        // ✅ Generate score based on all wallets
        const totalScore = score.totalScore || 0;

        return res.json({ 
            success: true,
            totalScore, 
            wallets: walletAddresses,
            message: "Wallet updated successfully"
        });

    } catch (error) {
        console.error("❌ Error updating wallet:", error);
        return res.status(500).json({ error: "Server Error" });
    }
}

module.exports = { updateWallet };
