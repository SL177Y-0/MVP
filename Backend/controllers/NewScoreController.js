const { getUserDetails } = require("./twitterController.js");
const { getWalletDetails } = require("./BlockchainController.js");
const { getTelegramData } = require("../Services/veridaService.js");
const Score = require("../models/Score");


async function CollectData(req, res) {
    try {
      console.log("🔍 Request Received:", req.method === "POST" ? req.body : req.params);
  
      let { privyId, username, address } = req.params;
      let { email } = req.body;
  
      if (req.method === "POST") {
        if (!privyId && req.body.privyId) privyId = req.body.privyId;
        if (!username && req.body.userId) username = req.body.userId;
        if (!username && req.body.twitterUsername) username = req.body.twitterUsername;
        if (!address && req.body.walletAddress) address = req.body.walletAddress;
      }
  
      // Use privyId from userDid if not provided directly
      if (!privyId && req.body.userDid) {
        privyId = req.body.userDid;
        console.log(`Using userDid as privyId: ${privyId}`);
      }
  
      if (!privyId) {
        return res.status(400).json({ error: "Provide a Privy ID, userDid, or userId for identification" });
      }
  
      // Extract Telegram-related data
      const { userDid, authToken } = req.body;
  
      console.log(`📢 Fetching data for: PrivyID(${privyId}), Twitter(${username || "None"}), Wallet(${address || "None"}), Verida Auth(${authToken ? "Provided" : "None"})`);
  
      let userData = null;
      let walletData = {};
  
      // ✅ Fetch Twitter Data
      if (username) {
        try {
          userData = await getUserDetails(username);
        } catch (err) {
          console.error("❌ Error fetching Twitter user data:", err.message);
        }
      }
  
      // ✅ Fetch Wallet Data
      if (address) {
        try {
          walletData = await getWalletDetails(address);
          console.log(walletData);
        } catch (err) {
          console.error("❌ Error fetching wallet data:", err.message);
        }
      }
  
      // ✅ Fetch Telegram Data from Verida API (if provided)
      let telegramData = {};
      if (userDid && authToken) {
        try {
          console.log(`📊 Fetching Telegram score for: PrivyID(${privyId}), Verida DID(${userDid})`);
          telegramData = await getTelegramData(userDid, authToken);
        } catch (err) {
          console.error("❌ Error fetching Telegram data:", err.message);
        }
      }
  
      // Fallback if telegramData is undefined
      const telegramGroups = telegramData.groups || [];
      const telegramMessages = telegramData.messages || [];
  
      // Calculate score and save to database if needed
      const scores = await calculateAndSaveScore(privyId, userData, walletData, telegramGroups, telegramMessages, email);
      console.log("🧮 Final Score Breakdown:", scores);

      return res.json({ totalScore: scores.totalScore });

    } catch (error) {
      console.error("❌ Error calculating score:", error.message);
      return res.status(500).json({ error: "Server Error" });
    }
  }
  


const weights = {
    // Twitter weights
    followers: 0.001,           // Per follower
    engagement: 0.0001,         // Per engagement unit (favourites + media + listed)
    verification: 5,            // Flat score if verified
    tweetFreq: 0.001,           // Per tweet
    subscriptions: 2,           // Per subscription
    accountAge: 0.1,            // Per year
    media: 0.01,                // Per media item
    pinned: 5,                  // Flat score if pinned tweet exists
    friends: 0.001,             // Per friend
    listed: 0.01,               // Per list membership
    superFollow: 5,             // Flat score if eligible
    retweets: 0.005,            // NEW: Per retweet
    quotes: 0.005,              // NEW: Per quote tweet
    replies: 0.002,             // NEW: Per reply

    // Wallet weights
    activeChains: 5,            // Per chain
    nativeBalance: 10,          // Per unit of native balance
    tokenHoldings: 2,           // Per token
    nftHoldings: 5,             // Per NFT
    defiPositions: 5,           // Per DeFi position
    web3Domains: 5,             // Flat score if domain exists
    transactionCount: 0.01,     // NEW: Per transaction
    uniqueTokenInteractions: 1, // NEW: Per unique token interacted with

    // Telegram weights
    groupCount: 2,              // Per group
    messageFreq: 0.1,           // Per message
    pinnedMessages: 5,          // Per pinned message
    mediaMessages: 2,           // Per media message
    hashtags: 1,                // Per hashtag
    polls: 2,                   // Flat score if can send polls
    leadership: 5,              // Flat score if has leadership permissions
    botInteractions: 1,         // Per bot interaction
    stickerMessages: 0.5,       // NEW: Per sticker message
    gifMessages: 0.5,           // NEW: Per GIF message
    mentionCount: 1             // NEW: Per mention
};

// Updated badge thresholds with new badges
const badgeThresholds = {
    // Twitter-Based Badges
    "Influence Investor": [1000000, 5000000, 10000000], // Followers
    "Tweet Trader": [5, 10, 20],                       // Tweets / 100
    "Engagement Economist": [1000, 5000, 10000],       // Likes received
    "Media Mogul": [100, 500, 1000],                   // Media count
    "List Legend": [100, 500, 1000],                   // Listed count
    "Verified Visionary": [1, 1, 1],                   // Verified status
    "Pinned Post Pro": [1, 1, 1],                      // Pinned tweet exists
    "Super Follower": [1, 1, 1],                       // Super follow eligible
    "Creator Subscriber": [5, 10, 20],                 // Creator subscriptions
    "Twitter Veteran": [5, 10, 15],                    // Account age in years
    "Retweet King": [100, 500, 1000],                  // NEW: Retweets
    "Quote Master": [50, 200, 500],                    // NEW: Quote tweets
    "Reply Champion": [100, 500, 1000],                // NEW: Replies

    // Wallet-Based Badges
    "Chain Explorer": [2, 5, 10],                      // Active chains
    "Token Holder": [5, 20, 50],                       // Token holdings
    "NFT Collector": [1, 5, 10],                       // NFT holdings
    "DeFi Participant": [1, 3, 5],                     // DeFi positions
    "Gas Spender": [100, 500, 1000],                   // Total gas spent (not fully implemented)
    "Staking Enthusiast": [1, 3, 5],                   // Staking positions (not fully implemented)
    "Airdrop Recipient": [1, 5, 10],                   // Airdrops (not fully implemented)
    "DAO Voter": [1, 5, 10],                           // DAO votes (not fully implemented)
    "Web3 Domain Owner": [1, 1, 1],                    // Web3 domain exists
    "High-Value Trader": [10000, 50000, 100000],       // Transaction volume (not fully implemented)
    "Transaction Titan": [100, 500, 1000],             // NEW: Transaction count
    "Token Interactor": [10, 50, 100],                 // NEW: Unique token interactions

    // Telegram-Based Badges
    "Group Guru": [5, 10, 20],                         // Group count
    "Message Maestro": [100, 500, 1000],               // Message frequency
    "Pinned Message Master": [1, 5, 10],               // Pinned messages
    "Media Messenger": [10, 50, 100],                  // Media messages
    "Hashtag Hero": [10, 50, 100],                     // Hashtag usage
    "Poll Creator": [1, 5, 10],                        // Polls created
    "Leadership Legend": [1, 3, 5],                    // Leadership roles
    "Bot Interactor": [10, 50, 100],                   // Bot interactions
    "Verified Group Member": [1, 3, 5],                // Verified groups (not fully implemented)
    "Quick Responder": [10, 50, 100],                  // Fast responses (not fully implemented)
    "Sticker Star": [10, 50, 100],                     // NEW: Sticker messages
    "GIF Guru": [10, 50, 100],                         // NEW: GIF messages
    "Mention Magnet": [10, 50, 100]                    // NEW: Mentions received
};

// Title requirements (unchanged)
const titleRequirements = {
    "Crypto Connoisseur": ["Crypto Communicator", "Social Connector", "Liquidity Laureate", "Telegram Titan"],
    "Blockchain Baron": ["DeFi Master", "Liquidity Laureate", "Governance Griot", "Staking Veteran", "Gas Gladiator"],
    "Digital Dynamo": ["Twitter Veteran", "Fast Grower", "Engagement Star", "Verified Visionary", "Degen Dualist"],
    "DeFi Dynamo": ["DeFi Master", "Airdrop Veteran", "Dapp Diplomat"],
    "NFT Aficionado": ["NFT Networker", "NFT Whale"],
    "Social Savant": ["Crypto Communicator", "Social Connector", "Twitter Veteran", "Engagement Economist", "Retweet Riches"],
    "Protocol Pioneer": ["Chain Explorer", "Cross-Chain Crusader", "DeFi Drifter"],
    "Token Titan": ["Influence Investor", "Meme Miner", "Tweet Trader"],
    "Chain Champion": ["Bridge Blazer", "Viral Validator", "Social HODLer"],
    "Governance Guru": ["DAO Diplomat", "Community Leader", "Governance Griot"]
};

/**
 * Calculate scores for each category based on user data
 * @param {String} privyId - User's Privy ID
 * @param {Object} twitterData - Twitter API data
 * @param {Object} walletData - Wallet API data
 * @param {Array} telegramGroups - Telegram groups data
 * @param {Array} telegramMessages - Telegram messages data
 * @returns {Object} Scores for each category and total score
 */
async function calculateScore(privyId, twitterData, walletData, telegramGroups, telegramMessages) {
  let socialScore = 0;
  let cryptoScore = 0;
  let nftScore = 0;
  let communityScore = 0;
  let telegramScore = 0;

  // ✅ Twitter Score
  if (twitterData) {
    try {
      const twitter = twitterData.userData?.data?.user?.result;
      socialScore = (
        (twitter?.followers_count || 0) * weights.followers +
        ((twitter?.favourites_count || 0) + (twitter?.media_count || 0) + (twitter?.listed_count || 0)) * weights.engagement +
        (twitterData.result?.is_blue_verified ? weights.verification : 0) +
        (twitter?.statuses_count || 0) * weights.tweetFreq +
        (twitterData.result?.creator_subscriptions_count || 0) * weights.subscriptions +
        ((new Date() - new Date(twitter?.created_at || Date.now())) / (1000 * 60 * 60 * 24 * 365)) * weights.accountAge +
        (twitter?.media_count || 0) * weights.media +
        (twitter?.pinned_tweet_ids_str?.length > 0 ? weights.pinned : 0) +
        (twitter?.friends_count || 0) * weights.friends +
        (twitter?.listed_count || 0) * weights.listed +
        (twitterData.result?.super_follow_eligible ? weights.superFollow : 0) +
        (twitter?.retweet_count || 0) * weights.retweets +
        (twitter?.quote_count || 0) * weights.quotes +
        (twitter?.reply_count || 0) * weights.replies
      );
    } catch (err) {
      console.error("❌ Error calculating Twitter score:", err.message);
    }
  }

  // ✅ Wallet Score
  if (walletData) {
    try {
      const wallet = {
        "Native Balance Result": walletData["Native Balance Result"] || 0,
        "Token Balances Result": walletData["Token Balances Result"] || [],
        "activeChains": walletData["Active Chains Result"]?.activeChains || [],
        "DeFi Positions Summary Result": walletData["DeFi Positions Summary Result"] || [],
        "Resolved Address Result": walletData["Resolved Address Result"],
        "Wallet NFTs Result": walletData["Wallet NFTs Result"] || [],
        "transactionCount": walletData["Transaction Count"] || 0,
        "uniqueTokenInteractions": walletData["Unique Token Interactions"] || 0
      };

      cryptoScore = (
        wallet.activeChains.length * weights.activeChains +
        wallet["Native Balance Result"] * weights.nativeBalance +
        wallet["Token Balances Result"].length * weights.tokenHoldings +
        wallet["DeFi Positions Summary Result"].length * weights.defiPositions +
        (wallet["Resolved Address Result"] ? weights.web3Domains : 0) +
        wallet.transactionCount * weights.transactionCount +
        wallet.uniqueTokenInteractions * weights.uniqueTokenInteractions
      );

      nftScore = wallet["Wallet NFTs Result"].length * weights.nftHoldings;
    } catch (err) {
      console.error("❌ Error calculating Wallet score:", err.message);
    }
  }

  // ✅ Telegram Score
  if (telegramGroups && telegramMessages) {
    try {
      const telegram = Array.isArray(telegramGroups.items) ? telegramGroups.items : [];
      const messages = Array.isArray(telegramMessages.items) ? telegramMessages.items : [];

      communityScore = telegram.length * weights.groupCount;

      telegramScore = (
        telegram.length * weights.groupCount +
        messages.length * weights.messageFreq +
        messages.filter(m => m?.sourceData?.is_pinned).length * weights.pinnedMessages +
        messages.filter(m => m?.sourceData?.content?._ === "messagePhoto").length * weights.mediaMessages +
        messages.reduce((sum, m) => {
          return sum + (m?.sourceData?.content?.caption?.entities || []).filter(e => e?.type?._ === "textEntityTypeHashtag").length;
        }, 0) * weights.hashtags +
        (telegram.some(g => g?.sourceData?.permissions?.can_send_polls) ? weights.polls : 0) +
        (telegram.some(g => g?.sourceData?.permissions?.can_pin_messages) ? weights.leadership : 0) +
        messages.filter(m => m?.sourceData?.via_bot_user_id !== 0).length * weights.botInteractions +
        messages.filter(m => m?.sourceData?.content?._ === "messageSticker").length * weights.stickerMessages +
        messages.filter(m => m?.sourceData?.content?._ === "messageAnimation").length * weights.gifMessages +
        messages.reduce((sum, m) => {
          return sum + (m?.sourceData?.content?.entities || []).filter(e => e?.type?._ === "textEntityTypeMention").length;
        }, 0) * weights.mentionCount
      );
    } catch (err) {
      console.error("❌ Error calculating Telegram score:", err.message);
    }
  }

  // ✅ Fallbacks: If any score is 0, assign a minimum default
  const safeScores = {
    socialScore: socialScore === 0 ? 10 : socialScore,
    cryptoScore: cryptoScore === 0 ? 15 : cryptoScore,
    nftScore: nftScore === 0 ? 5 : nftScore,
    communityScore: communityScore === 0 ? 10 : communityScore,
    telegramScore: telegramScore === 0 ? 5 : telegramScore
  };
  

  const totalScore = 
    Math.min(safeScores.socialScore, 50) +
    Math.min(safeScores.cryptoScore, 40) +
    Math.min(safeScores.nftScore, 30) +
    Math.min(safeScores.communityScore, 20) +
    Math.min(safeScores.telegramScore, 15);

  const result = {
    ...safeScores,
    totalScore
  };

  // ✅ Save or update DB
  if (privyId) {
    try {
      let userScore = await Score.findOne({ privyId });

      if (!userScore) {
        userScore = new Score({
          privyId,
          twitterScore: safeScores.socialScore,
          cryptoScore: safeScores.cryptoScore,
          nftScore: safeScores.nftScore,
          telegramScore: safeScores.telegramScore,
          communityScore: safeScores.communityScore,
          totalScore
        });
      } else {
        if (twitterData) userScore.twitterScore = safeScores.socialScore;
        if (walletData) {
          userScore.cryptoScore = safeScores.cryptoScore;
          userScore.nftScore = safeScores.nftScore;
        }
        if (telegramGroups && telegramMessages) {
          userScore.telegramScore = safeScores.telegramScore;
          userScore.communityScore = safeScores.communityScore;
        }

        userScore.totalScore = totalScore;
      }

      await userScore.save();
    } catch (err) {
      console.error("❌ Error saving score to DB:", err.message);
    }
  }

  return result;
}

/**
 * Calculate scores and save to database
 */
async function calculateAndSaveScore(privyId, userData, walletData, telegramGroups, telegramMessages, email) {
  // First calculate the scores
  const scores = await calculateScore(privyId, userData, walletData, telegramGroups, telegramMessages);
  
  // Save to database with retry logic
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount < MAX_RETRIES) {
    try {
      // Extract username from user data
      const username = userData?.data?.user?.result?.screen_name || null;
      
      // Extract wallet address from wallet data if available
      const walletAddress = walletData?.address || null;
      
      // Find or create user entry
      let userEntry = null;
      try {
        userEntry = await Score.findOne({ privyId }).maxTimeMS(5000); // Add timeout to prevent long-running queries
      } catch (findError) {
        console.warn(`⚠️ Error finding score for ${privyId} (attempt ${retryCount + 1}): ${findError.message}`);
        retryCount++;
        lastError = findError;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        continue;
      }
      
      if (!userEntry) {
        // Create new user entry
        userEntry = new Score({
          privyId,
          username: username || null,
          email: email || null,
          twitterScore: scores.socialScore || 0,
          telegramScore: scores.telegramScore || 0,
          totalScore: scores.totalScore || 0
        });
        
        // Add wallet if available
        if (walletAddress) {
          userEntry.wallets = [{
            walletAddress,
            score: scores.cryptoScore + scores.nftScore || 0
          }];
        }
      } else {
        // Update existing user
        if (username) userEntry.username = username;
        if (email) userEntry.email = email;
        
        userEntry.twitterScore = scores.socialScore || userEntry.twitterScore || 0;
        userEntry.telegramScore = scores.telegramScore || userEntry.telegramScore || 0;
        userEntry.totalScore = scores.totalScore || 0;
        
        // Update wallet if available
        if (walletAddress) {
          const walletScore = scores.cryptoScore + scores.nftScore || 0;
          const existingWalletIndex = userEntry.wallets.findIndex(w => w.walletAddress === walletAddress);
          
          if (existingWalletIndex >= 0) {
            userEntry.wallets[existingWalletIndex].score = walletScore;
          } else {
            userEntry.wallets.push({ walletAddress, score: walletScore });
          }
        }
      }
      
      // Save the updated user entry
      try {
        await userEntry.save();
        console.log(`✅ Successfully saved score for ${privyId}: ${scores.totalScore}`);
        break; // Exit retry loop on success
      } catch (saveError) {
        console.warn(`⚠️ Error saving score for ${privyId} (attempt ${retryCount + 1}): ${saveError.message}`);
        retryCount++;
        lastError = saveError;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    } catch (err) {
      console.error(`❌ Error processing score for ${privyId} (attempt ${retryCount + 1}): ${err.message}`);
      retryCount++;
      lastError = err;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
  
  if (retryCount === MAX_RETRIES) {
    console.error(`❌ Error saving score to DB after ${MAX_RETRIES} attempts: ${lastError.message}`);
  }
  
  // Return calculated scores even if saving fails
  return scores;
}

/**
 * Assign badges based on thresholds
 * @param {Object} twitterData - Twitter API data
 * @param {Object} walletData - Wallet API data
 * @param {Object} telegramGroups - Telegram groups data
 * @param {Object} telegramMessages - Telegram messages data
 * @returns {Object} Assigned badges with levels and values
 */
function assignBadges(twitterData, walletData, telegramGroups, telegramMessages) {
    const twitter = twitterData.result.legacy;
    const wallet = {
        "Native Balance Result": walletData["Native Balance Result"],
        "Token Balances Result": walletData["Token Balances Result"],
        "activeChains": walletData["Active Chains Result"].activeChains,
        "DeFi Positions Summary Result": walletData["DeFi Positions Summary Result"],
        "Resolved Address Result": walletData["Resolved Address Result"],
        "Wallet NFTs Result": walletData["Wallet NFTs Result"],
        "transactionCount": walletData["Transaction Count"] || 0,           // NEW: Default to 0 if not provided
        "uniqueTokenInteractions": walletData["Unique Token Interactions"] || 0 // NEW: Default to 0 if not provided
    };
    const telegram = telegramGroups.items;
    const messages = telegramMessages.items;

    const badges = {};
    const assignLevel = (badge, value) => {
        const [silver, gold, platinum] = badgeThresholds[badge];
        if (value >= platinum) return { level: "Platinum", value };
        if (value >= gold) return { level: "Gold", value };
        if (value >= silver) return { level: "Silver", value };
        return null;
    };

    // Twitter-Based Badges
    badges["Influence Investor"] = assignLevel("Influence Investor", twitter.followers_count);
    badges["Tweet Trader"] = assignLevel("Tweet Trader", twitter.statuses_count / 100);
    badges["Engagement Economist"] = assignLevel("Engagement Economist", twitter.favourites_count);
    badges["Media Mogul"] = assignLevel("Media Mogul", twitter.media_count);
    badges["List Legend"] = assignLevel("List Legend", twitter.listed_count);
    badges["Verified Visionary"] = assignLevel("Verified Visionary", twitterData.result.is_blue_verified ? 1 : 0);
    badges["Pinned Post Pro"] = assignLevel("Pinned Post Pro", twitter.pinned_tweet_ids_str.length > 0 ? 1 : 0);
    badges["Super Follower"] = assignLevel("Super Follower", twitterData.result.super_follow_eligible ? 1 : 0);
    badges["Creator Subscriber"] = assignLevel("Creator Subscriber", twitterData.result.creator_subscriptions_count);
    badges["Twitter Veteran"] = assignLevel("Twitter Veteran", (new Date() - new Date(twitter.created_at)) / (1000 * 60 * 60 * 24 * 365));
    badges["Retweet King"] = assignLevel("Retweet King", twitter.retweet_count || 0);      // NEW: Retweets
    badges["Quote Master"] = assignLevel("Quote Master", twitter.quote_count || 0);        // NEW: Quotes
    badges["Reply Champion"] = assignLevel("Reply Champion", twitter.reply_count || 0);    // NEW: Replies

    // Wallet-Based Badges
    badges["Chain Explorer"] = assignLevel("Chain Explorer", wallet.activeChains.length);
    badges["Token Holder"] = assignLevel("Token Holder", wallet["Token Balances Result"].length);
    badges["NFT Collector"] = assignLevel("NFT Collector", wallet["Wallet NFTs Result"].length);
    badges["DeFi Participant"] = assignLevel("DeFi Participant", wallet["DeFi Positions Summary Result"].length);
    badges["Web3 Domain Owner"] = assignLevel("Web3 Domain Owner", wallet["Resolved Address Result"] ? 1 : 0);
    badges["Transaction Titan"] = assignLevel("Transaction Titan", wallet.transactionCount);          // NEW: Transactions
    badges["Token Interactor"] = assignLevel("Token Interactor", wallet.uniqueTokenInteractions);     // NEW: Unique tokens

    // Telegram-Based Badges
    badges["Group Guru"] = assignLevel("Group Guru", telegram.length);
    badges["Message Maestro"] = assignLevel("Message Maestro", messages.length);
    badges["Pinned Message Master"] = assignLevel("Pinned Message Master", messages.filter(m => m.sourceData.is_pinned).length);
    badges["Media Messenger"] = assignLevel("Media Messenger", messages.filter(m => m.sourceData.content._ === "messagePhoto").length);
    badges["Hashtag Hero"] = assignLevel("Hashtag Hero", messages.reduce((sum, m) => sum + (m.sourceData.content.caption?.entities || []).filter(e => e.type._ === "textEntityTypeHashtag").length, 0));
    badges["Poll Creator"] = assignLevel("Poll Creator", telegram.some(g => g.sourceData.permissions.can_send_polls) ? 1 : 0);
    badges["Leadership Legend"] = assignLevel("Leadership Legend", telegram.some(g => g.sourceData.permissions.can_pin_messages) ? 1 : 0);
    badges["Bot Interactor"] = assignLevel("Bot Interactor", messages.filter(m => m.sourceData.via_bot_user_id !== 0).length);
    badges["Sticker Star"] = assignLevel("Sticker Star", messages.filter(m => m.sourceData.content._ === "messageSticker").length);      // NEW: Stickers
    badges["GIF Guru"] = assignLevel("GIF Guru", messages.filter(m => m.sourceData.content._ === "messageAnimation").length);          // NEW: GIFs
    badges["Mention Magnet"] = assignLevel("Mention Magnet", messages.reduce((sum, m) => sum + (m.sourceData.content.entities || []).filter(e => e.type._ === "textEntityTypeMention").length, 0));  // NEW: Mentions

    return Object.fromEntries(Object.entries(badges).filter(([_, v]) => v));
}

/**
 * Assign a title based on badge combinations
 * @param {Object} badges - Assigned badges
 * @returns {string} Assigned title
 */
function assignTitleBasedOnBadges(badges) {
    for (const [title, requiredBadges] of Object.entries(titleRequirements)) {
        if (requiredBadges.every(badge => badge in badges)) {
            return title;
        }
    }
    return "ALL ROUNDOOR";
}

/**
 * Main evaluation function
 * @param {Object} twitterData - Twitter API data
 * @param {Object} walletData - Wallet API data
 * @param {Object} telegramGroups - Telegram groups data
 * @param {Object} telegramMessages - Telegram messages data
 * @returns {Object} Evaluation result with title, badges, and scores
 */
function evaluateUser(twitterData, walletData, telegramGroups, telegramMessages) {
    const scores = calculateScore(twitterData, walletData, telegramGroups, telegramMessages);
    const badges = assignBadges(twitterData, walletData, telegramGroups, telegramMessages);
    const title = assignTitleBasedOnBadges(badges);

    return {
        title,
        badges,
        scores
    };
}

// Example usage (uncomment and provide data to test)
// const twitterData = /* Your Twitter API data */;
// const walletData = /* Your Wallet API data */;
// const telegramGroups = /* Your Telegram groups data */;
// const telegramMessages = /* Your Telegram messages data */;
// const result = evaluateUser(twitterData, walletData, telegramGroups, telegramMessages);
// console.log(result);

/**
 * Get total score for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTotalScore(req, res) {
  try {
    // Extract all possible identifiers from request
    const { privyId, userId, userDid } = req.params;
    const walletAddress = req.query?.walletAddress;
    
    // Determine which ID to use, in order of preference
    const identifier = privyId || userId || userDid || walletAddress;
    
    if (!identifier) {
      return res.status(400).json({ error: "User identification is required" });
    }
    
    console.log(`📊 Fetching total score for user with identifier: ${identifier}`);
    
    // Maximum retry attempts for database operations
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount < MAX_RETRIES) {
      try {
        // Check if we can find the user by any identifier
        const userEntry = await Score.findOne({ 
          $or: [
            { privyId: identifier },
            { userDid: identifier },
            { userId: identifier },
            { 'wallets.walletAddress': identifier }
          ] 
        }).maxTimeMS(5000); // Add timeout to prevent long-running queries
        
        if (!userEntry) {
          console.log(`⚠️ No score found for user with identifier: ${identifier}`);
          return res.json({ totalScore: 0, note: "No score found for this user" });
        }
        
        console.log(`✅ Found score for user with identifier ${identifier}: ${userEntry.totalScore}`);
        return res.json({ 
          totalScore: userEntry.totalScore,
          twitterScore: userEntry.twitterScore || 0, 
          telegramScore: userEntry.telegramScore || 0,
          wallets: userEntry.wallets || []
        });
      } catch (dbError) {
        console.warn(`⚠️ Database error while fetching score (attempt ${retryCount + 1}): ${dbError.message}`);
        retryCount++;
        lastError = dbError;
        
        // Only wait between retries if we haven't exhausted all attempts
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }
    }
    
    // If we exhaust all retries, return a fallback response
    console.error(`❌ Database error after ${MAX_RETRIES} attempts: ${lastError.message}`);
    return res.json({ 
      totalScore: 0, 
      note: "Default score due to database error",
      error: lastError.message
    });
    
  } catch (error) {
    console.error("❌ Error fetching total score:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

module.exports = { 
  CollectData, 
  calculateScore, 
  calculateAndSaveScore,
  assignBadges, 
  assignTitleBasedOnBadges, 
  evaluateUser, 
  getTotalScore 
};