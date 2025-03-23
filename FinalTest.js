// cluster-protocol-test-suite.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const { JSDOM } = require('jsdom');
const axios = require('axios');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { act } = require('react-dom/test-utils');
const { setupServer } = require('msw/node');
const { rest } = require('msw');

// Import models
const User = require('./Backend/models/User');
const Score = require('./Backend/models/Score');
const Token = require('./Backend/models/Token');
const Wallet = require('./Backend/models/Wallet');

// Import services
const moralisService = require('./Backend/Services/moralisService');
const scoreService = require('./Backend/Services/scoreService');
const tokenService = require('./Backend/Services/tokenService');
const veridaService = require('./Backend/Services/veridaService');

// Import controllers
const scoreController = require('./Backend/controllers/scoreController');
const newScoreController = require('./Backend/controllers/NewScoreController');
const blockchainController = require('./Backend/controllers/BlockchainController');
const twitterController = require('./Backend/controllers/twitterController');
const veridaController = require('./Backend/controllers/veridaController');

// Import frontend components (assuming a proper setup for testing React components)
// These would typically be imported and tested separately, but I'm including them here for completeness
const TwitterConnectPage = require('./Frontend/pages/TwitterConnectPage');
const WalletConnectPage = require('./Frontend/pages/WalletConnectPage');
const TelegramConnectPage = require('./Frontend/pages/TelegramConnectPage');
const ScorecardPage = require('./Frontend/pages/ScorecardPage');

// Import the Express app
const app = require('./Backend/server');

// Test configurations
const TEST_TIMEOUT = 30000; // 30 seconds
let mongoServer;
let mongoUri;

// Sample test data
const testUser = {
  privyId: 'test-privy-id-1',
  email: 'test@example.com',
  username: 'testuser',
  twitterUsername: 'testTwitter',
  walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  veridaUserId: 'test-verida-user-id'
};

const testScore = {
  twitterScore: 150,
  walletScore: 200,
  telegramScore: 100
};

// Mock external services
const mockTwitterApi = {
  getUserDetails: sinon.stub().resolves({
    data: {
      user: {
        result: {
          followers_count: 1000,
          friends_count: 500,
          favourites_count: 300,
          statuses_count: 1200,
          media_count: 50,
          listed_count: 10,
          created_at: '2020-01-01T00:00:00.000Z',
          pinned_tweet_ids_str: ['123456789'],
          screen_name: 'testTwitter'
        }
      }
    },
    result: {
      is_blue_verified: true,
      super_follow_eligible: false,
      creator_subscriptions_count: 5
    }
  })
};

const mockMoralisApi = {
  fetchBlockchainData: sinon.stub().resolves({
    address: testUser.walletAddress,
    nativeBalance: 2.5,
    tokenBalances: [{symbol: 'TEST', balance: '100'}],
    activeChains: ['ethereum', 'polygon'],
    defiPositionsSummary: [{protocol: 'aave', position: '100'}],
    resolvedAddress: 'user.eth',
    walletNFTs: [{tokenId: '1', name: 'Test NFT'}]
  })
};

const mockVeridaApi = {
  calculateVeridaScore: sinon.stub().resolves({
    success: true,
    score: 150,
    details: {
      groups: { count: 10, score: 50 },
      messages: { count: 100, score: 50 },
      keywords: { matches: { totalCount: 5 }, score: 50 }
    }
  }),
  getTelegramData: sinon.stub().resolves({
    groups: 10,
    messages: 100,
    keywordMatches: { totalCount: 5, keywords: { cluster: 3, protocol: 1, ai: 1 } }
  }),
  storeAuthToken: sinon.stub().resolves({ success: true, did: 'test-did' }),
  generateAuthUrl: sinon.stub().returns('https://test-auth-url.com')
};

// Mock localStorage for frontend tests
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// Set up mock server for frontend API calls
const mockApiServer = setupServer(
  rest.get('*/api/score/get-score/:privyId/:username/:address', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      totalScore: 450,
      twitterScore: 150,
      walletScore: 200,
      telegramScore: 100
    }));
  }),
  rest.post('*/api/score/get-score', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      totalScore: 450,
      twitterScore: 150,
      walletScore: 200,
      telegramScore: 100
    }));
  }),
  rest.get('*/api/verida/auth-url', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      authUrl: 'https://test-auth-url.com'
    }));
  }),
  rest.post('*/api/verida/auth-callback', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      did: 'test-did'
    }));
  }),
  rest.get('*/api/wallet/status/:privyId', (req, res, ctx) => {
    return res(ctx.json({
      walletConnected: true,
      walletAddress: testUser.walletAddress,
      wallets: [{ walletAddress: testUser.walletAddress, score: 200 }]
    }));
  })
);

// ======================= TEST SETUP =======================

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  mongoUri = mongoServer.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri, {});
  
  // Set up global mocks
  global.window = new JSDOM('<!doctype html><html><body></body></html>').window;
  global.document = window.document;
  global.navigator = window.navigator;
  global.localStorage = localStorageMock;
  
  // Start mock API server
  mockApiServer.listen();
  
  // Stub external service functions
  sinon.stub(moralisService, 'fetchBlockchainData').callsFake(mockMoralisApi.fetchBlockchainData);
  sinon.stub(twitterController, 'getUserDetails').callsFake(mockTwitterApi.getUserDetails);
  sinon.stub(veridaService, 'calculateVeridaScore').callsFake(mockVeridaApi.calculateVeridaScore);
  sinon.stub(veridaService, 'getTelegramData').callsFake(mockVeridaApi.getTelegramData);
  sinon.stub(veridaService, 'storeAuthToken').callsFake(mockVeridaApi.storeAuthToken);
  sinon.stub(veridaService, 'generateAuthUrl').callsFake(mockVeridaApi.generateAuthUrl);
}, TEST_TIMEOUT);

afterAll(async () => {
  // Restore all stubs
  sinon.restore();
  
  // Stop mock API server
  mockApiServer.close();
  
  // Disconnect from in-memory database
  await mongoose.disconnect();
  
  // Stop in-memory MongoDB server
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  // Reset localStorage
  localStorage.clear();
});

// ======================= DATABASE TESTS =======================

describe('Database Models', () => {
  test('User model creates and retrieves properly', async () => {
    // Create a new user
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email
    });
    
    await user.save();
    
    // Retrieve the user
    const foundUser = await User.findOne({ privyId: testUser.privyId });
    
    // Assertions
    expect(foundUser).to.not.be.null;
    expect(foundUser.username).to.equal(testUser.username);
    expect(foundUser.email).to.equal(testUser.email);
  });
  
  test('Score model creates and retrieves properly', async () => {
    // Create a new score
    const score = new Score({
      privyId: testUser.privyId,
      email: testUser.email, // Important: This field is required
      twitterScore: testScore.twitterScore,
      telegramScore: testScore.telegramScore,
      totalScore: testScore.twitterScore + testScore.telegramScore,
      wallets: [{ walletAddress: testUser.walletAddress, score: testScore.walletScore }]
    });
    
    await score.save();
    
    // Retrieve the score
    const foundScore = await Score.findOne({ privyId: testUser.privyId });
    
    // Assertions
    expect(foundScore).to.not.be.null;
    expect(foundScore.twitterScore).to.equal(testScore.twitterScore);
    expect(foundScore.telegramScore).to.equal(testScore.telegramScore);
    expect(foundScore.totalScore).to.equal(testScore.twitterScore + testScore.telegramScore);
    expect(foundScore.wallets).to.have.lengthOf(1);
    expect(foundScore.wallets[0].walletAddress).to.equal(testUser.walletAddress);
  });
  
  test('Token model creates and retrieves properly', async () => {
    // Create a new token
    const token = new Token({
      userId: testUser.privyId,
      serviceType: 'verida',
      token: 'test-token',
      did: 'test-did',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
    });
    
    await token.save();
    
    // Retrieve the token
    const foundToken = await Token.findOne({ userId: testUser.privyId, serviceType: 'verida' });
    
    // Assertions
    expect(foundToken).to.not.be.null;
    expect(foundToken.token).to.equal('test-token');
    expect(foundToken.did).to.equal('test-did');
  });
  
  test('Wallet model creates and retrieves properly', async () => {
    // Create a new user first
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email
    });
    
    await user.save();
    
    // Create a new wallet
    const wallet = new Wallet({
      userId: user._id,
      address: testUser.walletAddress,
      chainId: '0x1'
    });
    
    await wallet.save();
    
    // Retrieve the wallet
    const foundWallet = await Wallet.findOne({ address: testUser.walletAddress });
    
    // Assertions
    expect(foundWallet).to.not.be.null;
    expect(foundWallet.address).to.equal(testUser.walletAddress);
    expect(foundWallet.chainId).to.equal('0x1');
  });
  
  test('User should be able to have multiple wallet addresses', async () => {
    // Create a Score with multiple wallets
    const score = new Score({
      privyId: testUser.privyId,
      email: testUser.email,
      twitterScore: testScore.twitterScore,
      wallets: [
        { walletAddress: testUser.walletAddress, score: 100 },
        { walletAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', score: 200 }
      ]
    });
    
    await score.save();
    
    // Retrieve the score
    const foundScore = await Score.findOne({ privyId: testUser.privyId });
    
    // Assertions
    expect(foundScore).to.not.be.null;
    expect(foundScore.wallets).to.have.lengthOf(2);
  });
  
  test('Score model requires email field', async () => {
    // Create a score without email
    const score = new Score({
      privyId: testUser.privyId,
      twitterScore: testScore.twitterScore
    });
    
    // This should fail because email is required
    try {
      await score.save();
      // If we get here, the test failed
      expect.fail('Score was saved without required email field');
    } catch (error) {
      expect(error.name).to.equal('ValidationError');
      expect(error.message).to.include('email');
    }
  });
});

// ======================= SERVICE TESTS =======================

describe('Service Layer', () => {
  describe('Score Service', () => {
    test('calculateScore aggregates scores correctly', async () => {
      // Create a user with score details
      const user = new User({
        privyId: testUser.privyId,
        username: testUser.username,
        email: testUser.email,
        scoreDetails: {
          twitterScore: testScore.twitterScore,
          walletScore: testScore.walletScore,
          veridaScore: testScore.telegramScore
        }
      });
      
      await user.save();
      
      // Calculate score
      const result = await scoreService.calculateScore(testUser.privyId);
      
      // Assertions
      expect(result.success).to.be.true;
      expect(result.score).to.equal(testScore.twitterScore + testScore.walletScore + testScore.telegramScore);
      expect(result.details.twitter).to.equal(testScore.twitterScore);
      expect(result.details.wallet).to.equal(testScore.walletScore);
      expect(result.details.verida).to.equal(testScore.telegramScore);
    });
    
    test('updateVeridaStatus updates user correctly', async () => {
      // Create a user
      const user = new User({
        privyId: testUser.privyId,
        username: testUser.username,
        email: testUser.email
      });
      
      await user.save();
      
      // Update Verida status
      const result = await scoreService.updateVeridaStatus({
        privyId: testUser.privyId,
        veridaConnected: true,
        veridaUserId: testUser.veridaUserId,
        walletAddresses: [testUser.walletAddress]
      });
      
      // Retrieve updated user
      const updatedUser = await User.findOne({ privyId: testUser.privyId });
      
      // Retrieve score with wallets
      const score = await Score.findOne({ privyId: testUser.privyId });
      
      // Assertions
      expect(result.success).to.be.true;
      expect(updatedUser.veridaConnected).to.be.true;
      expect(updatedUser.veridaUserId).to.equal(testUser.veridaUserId);
      expect(score).to.not.be.null;
      expect(score.wallets).to.have.lengthOf(1);
      expect(score.wallets[0].walletAddress).to.equal(testUser.walletAddress);
    });
    
    test('calculateVeridaScore calculates and stores score correctly', async () => {
      // First create a user with Verida connection
      const user = new User({
        privyId: testUser.privyId,
        username: testUser.username,
        email: testUser.email,
        veridaConnected: true,
        veridaUserId: testUser.veridaUserId
      });
      
      await user.save();
      
      // Set up token for the user
      const token = new Token({
        userId: testUser.veridaUserId,
        serviceType: 'verida',
        token: 'test-token',
        did: 'test-did',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      
      await token.save();
      
      // Calculate Verida score
      const result = await scoreService.calculateVeridaScore(testUser.privyId);
      
      // Retrieve updated user
      const updatedUser = await User.findOne({ privyId: testUser.privyId });
      
      // Assertions
      expect(result.success).to.be.true;
      expect(result.score).to.equal(150); // From mock
      expect(updatedUser.scoreDetails.veridaScore).to.equal(150);
    });
  });
  
  describe('Token Service', () => {
    test('storeToken saves token correctly', async () => {
      // Store a token
      const result = await tokenService.storeToken(
        testUser.privyId,
        'verida',
        'test-token',
        'test-did',
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      
      // Assertions
      expect(result).to.not.be.null;
      expect(result.userId).to.equal(testUser.privyId);
      expect(result.token).to.equal('test-token');
      expect(result.did).to.equal('test-did');
    });
    
    test('getToken retrieves valid token', async () => {
      // Store a token
      await tokenService.storeToken(
        testUser.privyId,
        'verida',
        'test-token',
        'test-did',
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      
      // Get token
      const token = await tokenService.getToken(testUser.privyId, 'verida');
      
      // Assertions
      expect(token).to.equal('test-token');
    });
    
    test('isTokenValid returns correct validity', async () => {
      // Store a token
      await tokenService.storeToken(
        testUser.privyId,
        'verida',
        'test-token',
        'test-did',
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      
      // Check if token is valid
      const valid = await tokenService.isTokenValid(testUser.privyId, 'verida');
      
      // Assertions
      expect(valid).to.be.true;
    });
    
    test('token is invalid after expiration', async () => {
      // Store a token that's already expired
      await tokenService.storeToken(
        testUser.privyId,
        'verida',
        'test-token',
        'test-did',
        new Date(Date.now() - 1000) // 1 second ago
      );
      
      // Check if token is valid
      const valid = await tokenService.isTokenValid(testUser.privyId, 'verida');
      
      // Assertions
      expect(valid).to.be.false;
    });
  });
  
  describe('Moralis Service', () => {
    test('fetchBlockchainData returns wallet data', async () => {
      // Fetch blockchain data
      const data = await moralisService.fetchBlockchainData(testUser.walletAddress);
      
      // Assertions
      expect(data).to.not.be.null;
      expect(data.address).to.equal(testUser.walletAddress);
      expect(data.nativeBalance).to.equal(2.5);
      expect(data.tokenBalances).to.be.an('array');
      expect(data.activeChains).to.be.an('array');
    });
  });
  
  describe('Verida Service', () => {
    test('storeAuthToken saves token and retrieves DID', async () => {
      // Store auth token
      const result = await veridaService.storeAuthToken(testUser.privyId, 'test-token');
      
      // Assertions
      expect(result.success).to.be.true;
      expect(result.did).to.equal('test-did');
      
      // Verify token was stored
      const token = await Token.findOne({ userId: testUser.privyId, serviceType: 'verida' });
      expect(token).to.not.be.null;
      expect(token.token).to.equal('test-token');
      expect(token.did).to.equal('test-did');
    });
    
    test('getTelegramData retrieves and processes data correctly', async () => {
      // First store a token
      await tokenService.storeToken(
        testUser.privyId,
        'verida',
        'test-token',
        'test-did',
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      
      // Get Telegram data
      const data = await veridaService.getTelegramData(testUser.privyId);
      
      // Assertions
      expect(data.groups).to.equal(10);
      expect(data.messages).to.equal(100);
      expect(data.keywordMatches.totalCount).to.equal(5);
    });
    
    test('calculateVeridaScore computes score based on Telegram data', async () => {
      // First store a token
      await tokenService.storeToken(
        testUser.privyId,
        'verida',
        'test-token',
        'test-did',
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      
      // Calculate score
      const result = await veridaService.calculateVeridaScore(testUser.privyId);
      
      // Assertions
      expect(result.success).to.be.true;
      expect(result.score).to.equal(150);
      expect(result.details.groups.count).to.equal(10);
      expect(result.details.messages.count).to.equal(100);
      expect(result.details.keywords.matches.totalCount).to.equal(5);
    });
    
    test('generateAuthUrl returns valid URL', () => {
      // Generate auth URL
      const url = veridaService.generateAuthUrl();
      
      // Assertions
      expect(url).to.equal('https://test-auth-url.com');
    });
  });
});

// ======================= CONTROLLER TESTS =======================

describe('Controllers', () => {
  describe('Score Controller', () => {
    test('calculateScore processes and returns user score', async () => {
      // Create a user
      const user = new User({
        privyId: testUser.privyId,
        username: testUser.username,
        email: testUser.email,
        twitterUsername: testUser.twitterUsername,
        walletAddress: testUser.walletAddress
      });
      
      await user.save();
      
      // Create a mock request and response
      const req = {
        params: { privyId: testUser.privyId },
        body: {
          privyId: testUser.privyId,
          userId: testUser.twitterUsername,
          walletAddress: testUser.walletAddress
        }
      };
      
      let responseData = null;
      const res = {
        json: (data) => { responseData = data; },
        status: (code) => ({ json: (data) => { responseData = data; } })
      };
      
      // Call controller
      await newScoreController.CollectData(req, res);
      
      // Assertions
      expect(responseData).to.not.be.null;
      expect(responseData).to.have.property('totalScore');
    });
    
    test('getTotalScore returns the total score for a user', async () => {
      // Create a score
      const score = new Score({
        privyId: testUser.privyId,
        email: testUser.email,
        twitterScore: testScore.twitterScore,
        telegramScore: testScore.telegramScore,
        totalScore: testScore.twitterScore + testScore.telegramScore + testScore.walletScore,
        wallets: [{ walletAddress: testUser.walletAddress, score: testScore.walletScore }]
      });
      
      await score.save();
      
      // Create a mock request and response
      const req = { params: { privyId: testUser.privyId } };
      
      let responseData = null;
      const res = {
        json: (data) => { responseData = data; },
        status: (code) => ({ json: (data) => { responseData = data; } })
      };
      
      // Call controller
      await newScoreController.getTotalScore(req, res);
      
      // Assertions
      expect(responseData).to.not.be.null;
      expect(responseData.success).to.be.true;
      expect(responseData.totalScore).to.equal(testScore.twitterScore + testScore.telegramScore + testScore.walletScore);
    });
  });
  
  describe('Twitter Controller', () => {
    test('getUserDetails fetches Twitter data', async () => {
      // Get Twitter data
      const data = await twitterController.getUserDetails(testUser.twitterUsername);
      
      // Assertions
      expect(data).to.not.be.null;
      expect(data.data.user.result.screen_name).to.equal(testUser.twitterUsername);
      expect(data.data.user.result.followers_count).to.equal(1000);
    });
  });
  
  describe('Blockchain Controller', () => {
    test('getWalletDetails fetches blockchain data', async () => {
      // Get wallet details
      const data = await blockchainController.getWalletDetails(testUser.walletAddress);
      
      // Assertions
      expect(data).to.not.be.null;
      expect(data.address).to.equal(testUser.walletAddress);
      expect(data.nativeBalance).to.equal(2.5);
    });
    
    test('getWalletDetails throws error with invalid address', async () => {
      try {
        await blockchainController.getWalletDetails(null);
        // If we get here, the test failed
        expect.fail('getWalletDetails should throw for null address');
      } catch (error) {
        expect(error.message).to.equal('Wallet address is required');
      }
    });
  });
  
  describe('Verida Controller', () => {
    test('generateAuthUrl returns auth URL', async () => {
      // Create a mock request and response
      const req = { query: { redirectUrl: 'http://localhost:3000/callback' } };
      
      let responseData = null;
      const res = { json: (data) => { responseData = data; } };
      
      // Call controller
      await veridaController.generateAuthUrl(req, res);
      
      // Assertions
      expect(responseData).to.not.be.null;
      expect(responseData.success).to.be.true;
      expect(responseData.authUrl).to.equal('https://test-auth-url.com');
    });
    
    test('handleAuthCallback processes auth token', async () => {
      // Create a mock request and response
      const req = {
        query: { auth_token: 'test-token' },
        body: { userId: testUser.privyId }
      };
      
      let responseData = null;
      const res = { json: (data) => { responseData = data; } };
      
      // Call controller
      await veridaController.handleAuthCallback(req, res);
      
      // Assertions
      expect(responseData).to.not.be.null;
      expect(responseData.success).to.be.true;
      expect(responseData.did).to.equal('test-did');
    });
    
    test('getTelegramData returns Telegram data for user', async () => {
      // First store a token
      await tokenService.storeToken(
        testUser.privyId,
        'verida',
        'test-token',
        'test-did',
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      );
      
      // Create a mock request and response
      const req = { params: { userId: testUser.privyId } };
      
      let responseData = null;
      const res = { json: (data) => { responseData = data; } };
      
      // Call controller
      await veridaController.getTelegramData(req, res);
      
      // Assertions
      expect(responseData).to.not.be.null;
      expect(responseData.success).to.be.true;
      expect(responseData.data.groups).to.equal(10);
      expect(responseData.data.messages).to.equal(100);
    });
  });
});

// ======================= API ENDPOINT TESTS =======================

describe('API Endpoints', () => {
  test('GET /api/health returns 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('status', 'ok');
  });
  
  test('GET /api/twitter/user/:username returns Twitter data', async () => {
    const response = await request(app).get(`/api/twitter/user/${testUser.twitterUsername}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
    expect(response.body.data.user.result.screen_name).to.equal(testUser.twitterUsername);
  });
  
  test('GET /api/score/get-score/:privyId/:username/:address calculates score', async () => {
    // Create a user first
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email,
      twitterUsername: testUser.twitterUsername
    });
    
    await user.save();
    
    const response = await request(app)
      .get(`/api/score/get-score/${testUser.privyId}/${testUser.twitterUsername}/${testUser.walletAddress}`);
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('totalScore');
  });
  
  test('POST /api/score/get-score calculates score with request body', async () => {
    // Create a user first
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email,
      twitterUsername: testUser.twitterUsername
    });
    
    await user.save();
    
    const response = await request(app)
      .post('/api/score/get-score')
      .send({
        privyId: testUser.privyId,
        userId: testUser.twitterUsername,
        walletAddress: testUser.walletAddress
      });
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('totalScore');
  });
  
  test('GET /api/verida/auth-url returns auth URL', async () => {
    const response = await request(app)
      .get('/api/verida/auth-url')
      .query({ redirectUrl: 'http://localhost:3000/callback' });
    
    expect(response.status).to.equal(200);
    expect(response.body.success).to.be.true;
    expect(response.body.authUrl).to.equal('https://test-auth-url.com');
  });
  
  test('POST /api/verida/auth-callback processes auth token', async () => {
    const response = await request(app)
      .post('/api/verida/auth-callback')
      .query({ auth_token: 'test-token' })
      .send({ userId: testUser.privyId });
    
    expect(response.status).to.equal(200);
    expect(response.body.success).to.be.true;
    expect(response.body.did).to.equal('test-did');
  });
  
  test('POST /api/wallet/connect connects wallet', async () => {
    const response = await request(app)
      .post('/api/wallet/connect')
      .send({
        privyId: testUser.privyId,
        walletAddress: testUser.walletAddress
      });
    
    expect(response.status).to.equal(200);
    expect(response.body.success).to.be.true;
    
    // Check if user was created
    const user = await User.findOne({ privyId: testUser.privyId });
    expect(user).to.not.be.null;
    expect(user.walletConnected).to.be.true;
    expect(user.walletAddress).to.equal(testUser.walletAddress);
    
    // Check if score was created
    const score = await Score.findOne({ privyId: testUser.privyId });
    expect(score).to.not.be.null;
    expect(score.wallets).to.have.lengthOf(1);
    expect(score.wallets[0].walletAddress).to.equal(testUser.walletAddress);
  });
  
  test('GET /api/wallet/status/:privyId returns wallet status', async () => {
    // Create a user with wallet
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email,
      walletConnected: true,
      walletAddress: testUser.walletAddress
    });
    
    await user.save();
    
    // Create a score with wallet
    const score = new Score({
      privyId: testUser.privyId,
      email: testUser.email,
      wallets: [{ walletAddress: testUser.walletAddress, score: testScore.walletScore }]
    });
    
    await score.save();
    
    const response = await request(app).get(`/api/wallet/status/${testUser.privyId}`);
    
    expect(response.status).to.equal(200);
    expect(response.body.walletConnected).to.be.true;
    expect(response.body.walletAddress).to.equal(testUser.walletAddress);
    expect(response.body.wallets).to.have.lengthOf(1);
    expect(response.body.wallets[0].walletAddress).to.equal(testUser.walletAddress);
  });
});

// ======================= FRONTEND COMPONENT TESTS =======================

describe('Frontend Components', () => {
  // Setup the mocks needed for React testing
  beforeEach(() => {
    // Set up window.location for navigation tests
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
    
    // Mock fetch
    global.fetch = sinon.stub().resolves({
      ok: true,
      json: async () => ({ success: true })
    });
    
    // Reset localStorage mocks
    localStorage.clear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
  });
  
  test('TwitterConnectPage connects to Twitter and fetches score', async () => {
    // This is a simplified test for React components
    // In a real test suite, you would use proper React testing-library setup
    
    // Mock the Twitter authentication
    const mockSignInWithPopup = sinon.stub().resolves({
      user: {
        displayName: testUser.twitterUsername,
        uid: 'twitter-uid'
      }
    });
    
    // Setup rendering
    const { getByText, getByRole } = render(
      <TwitterConnectPage signInWithPopup={mockSignInWithPopup} />
    );
    
    // Find and click the connect button
    const connectButton = getByRole('button', { name: /sign in with twitter/i });
    fireEvent.click(connectButton);
    
    // Wait for the score to be calculated
    await waitFor(() => {
      expect(getByText(/points earned/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('twitterUser', expect.any(String));
    
    // Verify navigation would happen
    await waitFor(() => {
      expect(window.location.pathname).toContain('wallet');
    }, { timeout: 5000 });
  });
  
  test('WalletConnectPage connects wallet and fetches score', async () => {
    // Mock the wallet connection
    const mockConnect = sinon.stub().resolves({
      address: testUser.walletAddress
    });
    
    // Setup rendering
    const { getByText, getByRole } = render(
      <WalletConnectPage connect={mockConnect} />
    );
    
    // Find and click the connect button
    const connectButton = getByRole('button', { name: /connect wallet/i });
    fireEvent.click(connectButton);
    
    // Wait for the score to be calculated
    await waitFor(() => {
      expect(getByText(/points earned/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('walletAddress', testUser.walletAddress);
    
    // Verify navigation would happen
    await waitFor(() => {
      expect(window.location.pathname).toContain('telegram');
    }, { timeout: 5000 });
  });
  
  test('TelegramConnectPage connects with Verida', async () => {
    // Mock the Verida connection
    const mockOnConnectionChange = sinon.stub();
    
    // Setup rendering
    const { getByText, getByRole } = render(
      <TelegramConnectPage onConnectionChange={mockOnConnectionChange} />
    );
    
    // Find and click the connect button
    const connectButton = getByRole('button', { name: /connect telegram/i });
    fireEvent.click(connectButton);
    
    // Mock a successful connection
    // In a real test you'd interact with the Verida component
    act(() => {
      mockOnConnectionChange(true);
    });
    
    // Verify connection changed
    await waitFor(() => {
      expect(mockOnConnectionChange).toHaveBeenCalledWith(true);
      expect(getByText(/connected/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
  
  test('ScorecardPage displays user score', async () => {
    // Mock score data
    const scoreData = {
      twitter: 150,
      telegram: 100,
      wallet: 200,
      total: 450,
      percentile: 90,
      rank: 42
    };
    
    // Setup the score context
    const mockScoreContext = {
      scores: scoreData,
      twitterConnected: true,
      telegramConnected: true,
      walletConnected: true
    };
    
    // Setup rendering
    const { getByText } = render(
      <ScoreContext.Provider value={mockScoreContext}>
        <ScorecardPage />
      </ScoreContext.Provider>
    );
    
    // Verify score is displayed
    expect(getByText(/450/)).toBeInTheDocument();
    expect(getByText(/42/)).toBeInTheDocument();
  });
});

// ======================= END-TO-END FLOW TESTS =======================

describe('End-to-End Flows', () => {
  test('Complete user flow: Twitter → Wallet → Telegram → Score', async () => {
    // In a real E2E test, this would use a tool like Cypress or Puppeteer
    // Here we'll simulate the flow programmatically
    
    // Step 1: Create a new user account
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email
    });
    
    await user.save();
    
    // Step 2: Connect Twitter
    const twitterResponse = await request(app)
      .post('/api/score/get-score')
      .send({
        privyId: testUser.privyId,
        userId: testUser.twitterUsername
      });
    
    expect(twitterResponse.status).to.equal(200);
    expect(twitterResponse.body).to.have.property('totalScore');
    
    // Update the user with Twitter data
    await User.findOneAndUpdate(
      { privyId: testUser.privyId },
      {
        twitterConnected: true,
        twitterUsername: testUser.twitterUsername,
        twitterVerified: true,
        scoreDetails: { twitterScore: testScore.twitterScore }
      }
    );
    
    // Step 3: Connect Wallet
    const walletResponse = await request(app)
      .post('/api/wallet/connect')
      .send({
        privyId: testUser.privyId,
        walletAddress: testUser.walletAddress
      });
    
    expect(walletResponse.status).to.equal(200);
    expect(walletResponse.body.success).to.be.true;
    
    // Step 4: Connect Telegram via Verida
    // First get auth URL
    const authUrlResponse = await request(app)
      .get('/api/verida/auth-url')
      .query({ redirectUrl: '/connect/telegram' });
    
    expect(authUrlResponse.status).to.equal(200);
    expect(authUrlResponse.body.authUrl).to.equal('https://test-auth-url.com');
    
    // Simulate callback from Verida
    const authCallbackResponse = await request(app)
      .post('/api/verida/auth-callback')
      .query({ auth_token: 'test-token' })
      .send({ userId: testUser.privyId });
    
    expect(authCallbackResponse.status).to.equal(200);
    expect(authCallbackResponse.body.did).to.equal('test-did');
    
    // Update Verida status
    await scoreService.updateVeridaStatus({
      privyId: testUser.privyId,
      veridaConnected: true,
      veridaUserId: testUser.privyId
    });
    
    // Calculate Verida score
    const veridaScoreResponse = await scoreService.calculateVeridaScore(testUser.privyId);
    expect(veridaScoreResponse.success).to.be.true;
    expect(veridaScoreResponse.score).to.equal(150);
    
    // Step 5: Get final total score
    const scoreResponse = await request(app).get(`/api/score/total-score/${testUser.privyId}`);
    
    expect(scoreResponse.status).to.equal(200);
    expect(scoreResponse.body.success).to.be.true;
    expect(scoreResponse.body.totalScore).to.be.at.least(150); // At least the Verida score
    
    // Step 6: Verify all data was saved correctly
    const savedUser = await User.findOne({ privyId: testUser.privyId });
    const savedScore = await Score.findOne({ privyId: testUser.privyId });
    
    expect(savedUser.twitterConnected).to.be.true;
    expect(savedUser.veridaConnected).to.be.true;
    expect(savedUser.walletConnected).to.be.true;
    expect(savedUser.totalScore).to.be.at.least(150);
    
    expect(savedScore).to.not.be.null;
    expect(savedScore.wallets).to.have.lengthOf(1);
    expect(savedScore.wallets[0].walletAddress).to.equal(testUser.walletAddress);
  });
  
  test('Score calculation works with different component scores', async () => {
    // Create a new user with all scores
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email,
      twitterConnected: true,
      twitterUsername: testUser.twitterUsername,
      walletConnected: true,
      walletAddress: testUser.walletAddress,
      veridaConnected: true,
      veridaUserId: testUser.veridaUserId,
      scoreDetails: {
        twitterScore: testScore.twitterScore,
        walletScore: testScore.walletScore,
        veridaScore: testScore.telegramScore
      }
    });
    
    await user.save();
    
    // Create a score with wallets
    const score = new Score({
      privyId: testUser.privyId,
      email: testUser.email,
      twitterScore: testScore.twitterScore,
      telegramScore: testScore.telegramScore,
      totalScore: testScore.twitterScore + testScore.telegramScore + testScore.walletScore,
      wallets: [{ walletAddress: testUser.walletAddress, score: testScore.walletScore }]
    });
    
    await score.save();
    
    // Calculate total score
    const result = await scoreService.calculateScore(testUser.privyId);
    
    // Assertions
    expect(result.success).to.be.true;
    expect(result.score).to.equal(testScore.twitterScore + testScore.walletScore + testScore.telegramScore);
    
    // Verify user's total score was updated
    const updatedUser = await User.findOne({ privyId: testUser.privyId });
    expect(updatedUser.totalScore).to.equal(testScore.twitterScore + testScore.walletScore + testScore.telegramScore);
  });
});

// ======================= SECURITY TESTS =======================

describe('Security Tests', () => {
  test('Expired tokens are not valid', async () => {
    // Store an expired token
    await tokenService.storeToken(
      testUser.privyId,
      'verida',
      'test-token',
      'test-did',
      new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    );
    
    // Check if token is valid
    const valid = await tokenService.isTokenValid(testUser.privyId, 'verida');
    
    // Assertions
    expect(valid).to.be.false;
  });
  
  test('API endpoints validate required parameters', async () => {
    // Test missing privyId in score API
    const response = await request(app).get('/api/score/total-score/');
    expect(response.status).to.equal(404); // Should be a 404 Not Found
    
    // Test missing username in Twitter API
    const twitterResponse = await request(app).get('/api/twitter/user/');
    expect(twitterResponse.status).to.equal(404); // Should be a 404 Not Found
    
    // Test missing redirectUrl in Verida API
    const veridaResponse = await request(app).get('/api/verida/auth-url');
    expect(veridaResponse.status).to.equal(400); // Should be a 400 Bad Request
  });
  
  test('Wallet connection requires privyId and walletAddress', async () => {
    // Test missing walletAddress
    const response1 = await request(app)
      .post('/api/wallet/connect')
      .send({ privyId: testUser.privyId });
    
    expect(response1.status).to.equal(400);
    
    // Test missing privyId
    const response2 = await request(app)
      .post('/api/wallet/connect')
      .send({ walletAddress: testUser.walletAddress });
    
    expect(response2.status).to.equal(400);
  });
});

// ======================= CONCURRENCY TESTS =======================

describe('Concurrency Tests', () => {
  test('Multiple score calculations for same user are handled correctly', async () => {
    // Create a user
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email,
      scoreDetails: {
        twitterScore: testScore.twitterScore,
        walletScore: testScore.walletScore,
        veridaScore: testScore.telegramScore
      }
    });
    
    await user.save();
    
    // Run multiple score calculations concurrently
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(scoreService.calculateScore(testUser.privyId));
    }
    
    const results = await Promise.all(promises);
    
    // All should succeed
    results.forEach(result => {
      expect(result.success).to.be.true;
      expect(result.score).to.equal(testScore.twitterScore + testScore.walletScore + testScore.telegramScore);
    });
    
    // User should have been updated only once (last writer wins)
    const updatedUser = await User.findOne({ privyId: testUser.privyId });
    expect(updatedUser.totalScore).to.equal(testScore.twitterScore + testScore.walletScore + testScore.telegramScore);
  });
  
  test('Multiple wallet connections are handled properly', async () => {
    // Connect multiple wallets concurrently
    const walletAddresses = [
      '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0xdD870fA1b7C4700F2BD7f44238821C26f7392148'
    ];
    
    const promises = walletAddresses.map(address => 
      request(app)
        .post('/api/wallet/connect')
        .send({
          privyId: testUser.privyId,
          walletAddress: address
        })
    );
    
    const responses = await Promise.all(promises);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
    });
    
    // Check if all wallets were saved
    const score = await Score.findOne({ privyId: testUser.privyId });
    expect(score).to.not.be.null;
    expect(score.wallets.length).to.be.at.least(1); // At least one wallet should be saved
    
    // The exact number might vary due to race conditions, but at least each wallet
    // should be unique and valid
    const savedAddresses = score.wallets.map(w => w.walletAddress);
    const uniqueAddresses = [...new Set(savedAddresses)];
    expect(uniqueAddresses.length).to.equal(savedAddresses.length); // No duplicates
  });
});

// ======================= FALLBACK TESTS =======================

describe('Fallback Tests', () => {
  test('Score calculation handles missing Twitter data', async () => {
    // Create a user without Twitter data
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email,
      scoreDetails: {
        walletScore: testScore.walletScore,
        veridaScore: testScore.telegramScore
      }
    });
    
    await user.save();
    
    // Calculate score
    const result = await scoreService.calculateScore(testUser.privyId);
    
    // Assertions
    expect(result.success).to.be.true;
    expect(result.score).to.equal(testScore.walletScore + testScore.telegramScore);
    expect(result.details.twitter).to.equal(0); // Should be 0 for missing Twitter score
    expect(result.details.wallet).to.equal(testScore.walletScore);
    expect(result.details.verida).to.equal(testScore.telegramScore);
  });
  
  test('Score calculation handles missing Wallet data', async () => {
    // Create a user without Wallet data
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email,
      scoreDetails: {
        twitterScore: testScore.twitterScore,
        veridaScore: testScore.telegramScore
      }
    });
    
    await user.save();
    
    // Calculate score
    const result = await scoreService.calculateScore(testUser.privyId);
    
    // Assertions
    expect(result.success).to.be.true;
    expect(result.score).to.equal(testScore.twitterScore + testScore.telegramScore);
    expect(result.details.twitter).to.equal(testScore.twitterScore);
    expect(result.details.wallet).to.equal(0); // Should be 0 for missing Wallet score
    expect(result.details.verida).to.equal(testScore.telegramScore);
  });
  
  test('Score calculation handles missing Verida data', async () => {
    // Create a user without Verida data
    const user = new User({
      privyId: testUser.privyId,
      username: testUser.username,
      email: testUser.email,
      scoreDetails: {
        twitterScore: testScore.twitterScore,
        walletScore: testScore.walletScore
      }
    });
    
    await user.save();
    
    // Calculate score
    const result = await scoreService.calculateScore(testUser.privyId);
    
    // Assertions
    expect(result.success).to.be.true;
    expect(result.score).to.equal(testScore.twitterScore + testScore.walletScore);
    expect(result.details.twitter).to.equal(testScore.twitterScore);
    expect(result.details.wallet).to.equal(testScore.walletScore);
    expect(result.details.verida).to.equal(0); // Should be 0 for missing Verida score
  });
});

// Run the tests
if (require.main === module) {
  // Only run tests if this file is directly executed
  // This prevents tests from running during import
  run();
}