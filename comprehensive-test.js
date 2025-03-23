// Comprehensive end-to-end test for Cluster Protocol MVP
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getTotalScore, calculateScore, CollectData } from './Backend/controllers/NewScoreController.js';
import Score from './Backend/models/Score.js';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with proper path resolution
dotenv.config({ path: path.resolve(__dirname, './Backend/.env') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.USE_MEMORY_DB = 'true';

// MongoDB setup
let mongoServer;

// Test data
const TEST_USERS = [
  { 
    privyId: 'test-user-1', 
    username: 'twitteruser1', 
    email: 'user1@test.com',
    walletAddress: '0x123456789abcdef'
  },
  { 
    privyId: 'test-user-2', 
    username: 'twitteruser2', 
    email: 'user2@test.com',
    walletAddress: '0x987654321fedcba'
  },
  { 
    privyId: 'test-user-with-did', 
    userDid: 'did:vda:testnet:0x12345',
    email: 'user3@test.com'
  }
];

// Mock request and response
const mockReq = (body = {}, params = {}, method = 'GET') => ({
  body,
  params,
  method,
  query: {}
});

const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.jsonResponse = null;
  res.json = function(data) {
    this.jsonResponse = data;
    return this;
  };
  return res;
};

// Setup the testing environment
async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');
  
  try {
    // Create an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log(`🧪 Using in-memory MongoDB at: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to in-memory MongoDB');
    
    // Create test data
    for (const user of TEST_USERS) {
      const testUser = new Score({
        privyId: user.privyId,
        username: user.username || null,
        email: user.email || null,
        userDid: user.userDid || null,
        twitterScore: 0,
        telegramScore: 0,
        totalScore: 0,
        wallets: user.walletAddress ? [{ walletAddress: user.walletAddress, score: 0 }] : []
      });
      
      await testUser.save();
    }
    
    console.log('✅ Test users created:', TEST_USERS.length);
    return true;
  } catch (error) {
    console.error(`❌ Error setting up test environment: ${error.message}`);
    return false;
  }
}

// Test User Identity
async function testUserIdentity() {
  console.log('\n🧪 TEST SUITE: User Identity');
  let passCount = 0;
  let failCount = 0;
  
  // Test 1: Get user by privyId
  console.log('\n📋 Test 1: Get user by privyId');
  const req1 = mockReq({}, { privyId: 'test-user-1' });
  const res1 = mockRes();
  await getTotalScore(req1, res1);
  
  if (res1.statusCode === 200 && res1.jsonResponse?.totalScore === 0) {
    console.log('  ✅ Test passed: Found user by privyId');
    passCount++;
  } else {
    console.log('  ❌ Test failed: Could not find user by privyId');
    console.log(`  Response: ${JSON.stringify(res1.jsonResponse)}`);
    failCount++;
  }
  
  // Test 2: Get user by DID
  console.log('\n📋 Test 2: Get user by userDid');
  const req2 = mockReq({}, { privyId: 'did:vda:testnet:0x12345' });
  const res2 = mockRes();
  await getTotalScore(req2, res2);
  
  if (res2.statusCode === 200 && res2.jsonResponse?.totalScore === 0) {
    console.log('  ✅ Test passed: Found user by userDid');
    passCount++;
  } else {
    console.log('  ❌ Test failed: Could not find user by userDid');
    console.log(`  Response: ${JSON.stringify(res2.jsonResponse)}`);
    failCount++;
  }
  
  // Test 3: Get user by wallet address
  console.log('\n📋 Test 3: Get user by wallet address');
  const req3 = mockReq({}, { privyId: '0x123456789abcdef' });
  const res3 = mockRes();
  await getTotalScore(req3, res3);
  
  if (res3.statusCode === 200 && res3.jsonResponse?.totalScore === 0) {
    console.log('  ✅ Test passed: Found user by wallet address');
    passCount++;
  } else {
    console.log('  ❌ Test failed: Could not find user by wallet address');
    console.log(`  Response: ${JSON.stringify(res3.jsonResponse)}`);
    failCount++;
  }
  
  console.log(`\nIdentity Tests Summary: ${passCount} passed, ${failCount} failed`);
  return { passCount, failCount };
}

// Test Score Calculation
async function testScoreCalculation() {
  console.log('\n🧪 TEST SUITE: Score Calculation');
  let passCount = 0;
  let failCount = 0;
  
  // Generate test data
  const mockTwitterData = {
    userData: {
      data: {
        user: {
          result: {
            followers_count: 1000,
            friends_count: 500,
            statuses_count: 200,
            favourites_count: 150,
            listed_count: 10,
            media_count: 50,
            screen_name: 'testuser',
            created_at: new Date(Date.now() - 3*365*24*60*60*1000).toString(), // 3 years ago
            pinned_tweet_ids_str: ['1234567890']
          }
        }
      }
    },
    result: {
      is_blue_verified: true,
      creator_subscriptions_count: 5,
      super_follow_eligible: true,
      legacy: {}
    }
  };
  
  const mockWalletData = {
    "Native Balance Result": 2.5,
    "Token Balances Result": [{ token: "ETH" }, { token: "USDC" }, { token: "UNI" }],
    "Active Chains Result": { activeChains: ["ethereum", "polygon", "arbitrum"] },
    "DeFi Positions Summary Result": [{ protocol: "Uniswap" }, { protocol: "Aave" }],
    "Wallet NFTs Result": [{ id: "nft1" }, { id: "nft2" }, { id: "nft3" }],
    "Transaction Count": 50,
    "Unique Token Interactions": 15,
    "address": "0x123456789abcdef" 
  };
  
  const mockTelegramGroups = { 
    items: [
      { name: "group1", type: "group" }, 
      { name: "group2", type: "channel" }
    ]
  };
  
  const mockTelegramMessages = { 
    items: [
      { text: "Hello world", type: "text" }, 
      { text: "Check out this cluster protocol", type: "text" },
      { media_type: "photo", type: "media" }
    ]
  };
  
  // Test 1: Calculate score with complete data
  console.log('\n📋 Test 1: Calculate score with complete data');
  const scores = await calculateScore(
    'test-user-1', 
    mockTwitterData, 
    mockWalletData, 
    mockTelegramGroups.items, 
    mockTelegramMessages.items
  );
  
  console.log(`  Score breakdown: ${JSON.stringify(scores)}`);
  
  if (scores && scores.totalScore > 0 && 
      scores.socialScore > 0 && 
      scores.cryptoScore > 0 && 
      scores.telegramScore > 0) {
    console.log('  ✅ Test passed: Successfully calculated all score components');
    passCount++;
  } else {
    console.log('  ❌ Test failed: Score calculation incomplete');
    failCount++;
  }
  
  // Test 2: Calculate score with only Twitter data
  console.log('\n📋 Test 2: Calculate score with only Twitter data');
  const twitterOnlyScores = await calculateScore(
    'test-user-1', 
    mockTwitterData, 
    null, 
    [], 
    []
  );
  
  console.log(`  Score breakdown: ${JSON.stringify(twitterOnlyScores)}`);
  
  if (twitterOnlyScores && 
      twitterOnlyScores.totalScore > 0 && 
      twitterOnlyScores.socialScore > 0) {
    console.log('  ✅ Test passed: Successfully calculated score with Twitter data only');
    passCount++;
  } else {
    console.log('  ❌ Test failed: Twitter-only score calculation failed');
    failCount++;
  }
  
  // Test 3: Calculate score with only wallet data
  console.log('\n📋 Test 3: Calculate score with only wallet data');
  const walletOnlyScores = await calculateScore(
    'test-user-1', 
    null, 
    mockWalletData, 
    [], 
    []
  );
  
  console.log(`  Score breakdown: ${JSON.stringify(walletOnlyScores)}`);
  
  if (walletOnlyScores && 
      walletOnlyScores.totalScore > 0 && 
      walletOnlyScores.cryptoScore > 0) {
    console.log('  ✅ Test passed: Successfully calculated score with wallet data only');
    passCount++;
  } else {
    console.log('  ❌ Test failed: Wallet-only score calculation failed');
    failCount++;
  }
  
  // Test 4: Save score and retrieve it
  console.log('\n📋 Test 4: Save and retrieve score');
  const req1 = mockReq(
    { 
      privyId: 'test-user-2',
      walletAddress: '0x987654321fedcba',
      twitterUsername: 'twitteruser2'
    }, 
    {}, 
    'POST'
  );
  const res1 = mockRes();
  await CollectData(req1, res1);
  
  if (res1.statusCode === 200 && res1.jsonResponse?.totalScore > 0) {
    console.log('  ✅ Part 1 passed: Successfully calculated and saved score');
    
    // Now retrieve the score
    const req2 = mockReq({}, { privyId: 'test-user-2' });
    const res2 = mockRes();
    await getTotalScore(req2, res2);
    
    if (res2.statusCode === 200 && 
        res2.jsonResponse?.totalScore > 0 && 
        res2.jsonResponse?.totalScore === res1.jsonResponse?.totalScore) {
      console.log('  ✅ Part 2 passed: Successfully retrieved saved score');
      passCount++;
    } else {
      console.log('  ❌ Part 2 failed: Could not retrieve saved score correctly');
      console.log(`  Expected: ${res1.jsonResponse?.totalScore}, Got: ${res2.jsonResponse?.totalScore}`);
      failCount++;
    }
  } else {
    console.log('  ❌ Part 1 failed: Could not calculate and save score');
    console.log(`  Response: ${JSON.stringify(res1.jsonResponse)}`);
    failCount++;
  }
  
  console.log(`\nScore Calculation Tests Summary: ${passCount} passed, ${failCount} failed`);
  return { passCount, failCount };
}

// Test Error Handling
async function testErrorHandling() {
  console.log('\n🧪 TEST SUITE: Error Handling');
  let passCount = 0;
  let failCount = 0;
  
  // Test 1: Missing user ID
  console.log('\n📋 Test 1: Missing user ID');
  const req1 = mockReq({}, {});
  const res1 = mockRes();
  await getTotalScore(req1, res1);
  
  if (res1.statusCode === 400 && res1.jsonResponse?.error) {
    console.log('  ✅ Test passed: Properly handled missing user ID');
    console.log(`  Error: ${res1.jsonResponse.error}`);
    passCount++;
  } else {
    console.log('  ❌ Test failed: Did not handle missing user ID correctly');
    console.log(`  Response: ${JSON.stringify(res1.jsonResponse)}`);
    failCount++;
  }
  
  // Test 2: Invalid user ID
  console.log('\n📋 Test 2: Invalid user ID');
  const req2 = mockReq({}, { privyId: 'non-existent-user' });
  const res2 = mockRes();
  await getTotalScore(req2, res2);
  
  if (res2.statusCode === 200 && res2.jsonResponse?.totalScore === 0) {
    console.log('  ✅ Test passed: Properly handled non-existent user');
    passCount++;
  } else {
    console.log('  ❌ Test failed: Did not handle non-existent user correctly');
    console.log(`  Response: ${JSON.stringify(res2.jsonResponse)}`);
    failCount++;
  }
  
  // Test 3: Bad data input
  console.log('\n📋 Test 3: Bad data input');
  let badScore;
  try {
    badScore = await calculateScore('test-user-1', { userData: 'invalid' }, { bad: 'data' }, null, undefined);
    console.log(`  Score with bad data: ${JSON.stringify(badScore)}`);
    
    if (badScore && typeof badScore.totalScore === 'number') {
      console.log('  ✅ Test passed: Handled bad data gracefully');
      passCount++;
    } else {
      console.log('  ❌ Test failed: Did not return a valid score with bad data');
      failCount++;
    }
  } catch (error) {
    console.log('  ❌ Test failed: Function threw an error with bad data');
    console.log(`  Error: ${error.message}`);
    failCount++;
  }
  
  console.log(`\nError Handling Tests Summary: ${passCount} passed, ${failCount} failed`);
  return { passCount, failCount };
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting comprehensive tests for Cluster Protocol MVP');
  
  // Setup test environment
  const setupSuccess = await setupTestEnvironment();
  if (!setupSuccess) {
    console.error('❌ Test setup failed. Aborting tests.');
    process.exit(1);
  }
  
  // Run all test suites
  const identityResults = await testUserIdentity();
  const scoreResults = await testScoreCalculation();
  const errorResults = await testErrorHandling();
  
  // Summarize results
  const totalPassed = identityResults.passCount + scoreResults.passCount + errorResults.passCount;
  const totalFailed = identityResults.failCount + scoreResults.failCount + errorResults.failCount;
  const totalTests = totalPassed + totalFailed;
  
  console.log('\n📊 TEST SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed} (${Math.round(totalPassed / totalTests * 100)}%)`);
  console.log(`Failed: ${totalFailed} (${Math.round(totalFailed / totalTests * 100)}%)`);
  console.log('-------------------------------------');
  console.log('User Identity Tests:', `${identityResults.passCount}/${identityResults.passCount + identityResults.failCount} passed`);
  console.log('Score Calculation Tests:', `${scoreResults.passCount}/${scoreResults.passCount + scoreResults.failCount} passed`);
  console.log('Error Handling Tests:', `${errorResults.passCount}/${errorResults.passCount + errorResults.failCount} passed`);
  console.log('=====================================');
  
  // Cleanup
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('👋 Test environment cleaned up');
  
  // Exit with appropriate code
  if (totalFailed > 0) {
    console.log('❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Fatal error during test execution:', error);
  process.exit(1);
}); 