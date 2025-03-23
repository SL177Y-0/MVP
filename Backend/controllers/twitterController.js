const axios = require("axios");

// Get RapidAPI credentials from environment variables
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'twitter241.p.rapidapi.com';

// Check if RapidAPI key is available
if (!RAPIDAPI_KEY) {
    console.warn('❌ WARNING: RAPIDAPI_KEY environment variable is not set. Using mock Twitter data instead.');
}

// Function to delay execution (used for retrying)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data to use when API key is not available
const getMockTwitterData = (username) => {
    console.log(`🔧 Using mock Twitter data for: ${username}`);
    return {
        userData: {
            data: {
                user: {
                    result: {
                        id: '1234567890',
                        screen_name: username,
                        name: username,
                        followers_count: 100,
                        friends_count: 50,
                        statuses_count: 200,
                        favourites_count: 150,
                        listed_count: 5,
                        media_count: 20,
                        profile_image_url_https: 'https://via.placeholder.com/48',
                        created_at: new Date(Date.now() - 3*365*24*60*60*1000).toString(), // 3 years ago
                        description: 'Mock Twitter user for testing',
                        pinned_tweet_ids_str: ['1234567890'],
                        entities: { description: { urls: [] } }
                    }
                }
            }
        },
        result: {
            is_blue_verified: false,
            legacy: {
                followers_count: 100,
                friends_count: 50,
                statuses_count: 200,
                favourites_count: 150,
                listed_count: 5,
                media_count: 20,
                profile_image_url_https: 'https://via.placeholder.com/48',
                created_at: new Date(Date.now() - 3*365*24*60*60*1000).toString(), // 3 years ago
                description: 'Mock Twitter user for testing',
                pinned_tweet_ids_str: ['1234567890']
            },
            creator_subscriptions_count: 2,
            super_follow_eligible: false,
            retweet_count: 15,
            quote_count: 10,
            reply_count: 25
        }
    };
};

exports.getUserDetails = async (username, retries = 3) => {
    if (!username) {
        throw new Error("Username is required");
    }

    // Return mock data if API key is not set
    if (!RAPIDAPI_KEY) {
        console.log(`ℹ️ No RapidAPI key, returning mock data for: ${username}`);
        return getMockTwitterData(username);
    }

    console.log(`🔍 Fetching Twitter data for: ${username}`);

    const options = {
        method: "GET",
        url: `https://${RAPIDAPI_HOST}/user`,
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        },
        params: { username } // ✅ Use params instead of body
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.request(options);
            console.log("✅ Twitter API Response received");

            if (!response.data || !response.data.result) {
                console.warn(`⚠️ Twitter API returned no data for ${username}, using mock data`);
                return getMockTwitterData(username);
            }

            return response.data.result; // ✅ Return user data
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.warn(`⏳ Rate limit hit. Retrying in 5 seconds... (Attempt ${attempt}/${retries})`);
                if (attempt < retries) {
                    await delay(5000); // Wait 5 seconds before retrying
                    continue; // Retry the request
                } else {
                    console.warn(`⚠️ Rate limit exceeded after ${retries} attempts, using mock data`);
                    return getMockTwitterData(username);
                }
            } else {
                console.error("❌ Error fetching Twitter user data:", error.response?.data || error.message);
                
                // Use mock data on error as fallback
                if (attempt === retries) {
                    console.warn(`⚠️ Failed to fetch Twitter data after ${retries} attempts, using mock data`);
                    return getMockTwitterData(username);
                }
                
                // Wait before retrying
                if (attempt < retries) {
                    await delay(2000 * attempt); // Increasing backoff delay
                    continue;
                }
            }
        }
    }
};
