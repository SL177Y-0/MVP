const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Moralis = require("moralis").default;
const scoreRoutes = require('./routes/scoreRoutes.js')
const blockchainRoutes = require("./routes/blockchainRoutes");
const twitterRoutes = require("./routes/twitterRoutes");
const apiRoutes = require('./routes/api.js')
const connectDB = require('./db.js')
const walletRoutes = require('./routes/wallet');
const debugRoutes = require('./routes/debug');
const chartRoutes = require('./routes/chart.js')
const veridaRoutes = require('./routes/veridaRoutes');

// Import for algorithm testing
const { evaluateUser, CollectData } = require("./controllers/NewScoreController");

dotenv.config(); // Load .env variables

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
console.log(`✅ CORS configured for origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

app.use(express.json());

// API Routes
app.use("/api/chart", chartRoutes);
app.use("/api/twitter", twitterRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/verida", veridaRoutes);
app.use("/api/debug", debugRoutes);

// Load blockchain routes
app.use("/api/blockchain", blockchainRoutes);

app.use('/api', apiRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running fine." });
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Use routes
app.use('/api/score', scoreRoutes);

// Test route for algorithm
app.get("/api/test-algorithm", async (req, res) => {
  try {
    console.log("Testing algorithm with full controller flow...");
    
    // Create mock request with test data
    const mockReq = {
      method: "POST",
      body: {
        privyId: "test-user-" + Date.now(),
        twitterUsername: "testuser",
        walletAddress: "0xTestWalletAddress",
        userDid: "did:test:123",
        authToken: "test-token"
      }
    };
    
    // Create a mock response to capture the output
    const mockRes = {
      status: (code) => ({ 
        json: (data) => {
          console.log(`Test returned status ${code} with data:`, data);
          return res.status(code).json(data);
        }
      }),
      json: (data) => {
        console.log("Test completed successfully");
        return res.json({
          success: true,
          result: data
        });
      }
    };
    
    // Call the full controller function
    await CollectData(mockReq, mockRes);
  } catch (error) {
    console.error("Error testing algorithm:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n======================================`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: ${process.env.API_BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`======================================\n`);
});

const startServer = async () => {
  try {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    console.log(`✅ Moralis initialized successfully`);
  } catch (error) {
    console.error("❌ Error starting Moralis:", error);
  }
};

startServer();