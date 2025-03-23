const mongoose = require("mongoose");

// Track connection state
let isConnected = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const connectDB = async () => {
    try {
        // If already connected, return the connection
        if (isConnected) {
            console.log("✅ Using existing MongoDB connection");
            return mongoose.connection;
        }
        
        connectionAttempts++;
        
        // Extract domain from connection string for secure logging
        const connectionString = process.env.MONGODB_URI;
        if (!connectionString) {
            throw new Error("MONGODB_URI environment variable is not set");
        }
        
        const domainMatch = connectionString ? connectionString.match(/@([^/]+)/) : null;
        const dbDomain = domainMatch ? domainMatch[1] : 'unknown';
        
        console.log(`Connecting to MongoDB at ${dbDomain}... (Attempt ${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        
        // Enhanced connection options
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 10, // Maintain up to 10 socket connections
            retryWrites: true, // Enable retryable writes
            retryReads: true, // Enable retryable reads
            connectTimeoutMS: 30000, // Connection timeout
            heartbeatFrequencyMS: 10000, // Check server health more frequently
        });
        
        // Add connection event listeners
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
            
            if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
                console.log(`Attempting to reconnect in 5 seconds (Attempt ${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
                setTimeout(() => {
                    connectDB();
                }, 5000);
            } else {
                console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please check your MongoDB configuration.`);
            }
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
            isConnected = false;
            
            if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
                setTimeout(() => {
                    connectDB();
                }, 5000);
            }
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
            isConnected = true;
            connectionAttempts = 0;
        });
        
        mongoose.connection.on('connected', () => {
            console.log("✅ MongoDB Successfully Connected");
            isConnected = true;
            connectionAttempts = 0;
            
            // Test the connection with a simple query
            try {
                mongoose.connection.db.admin().ping((err, result) => {
                    if (err) {
                        console.error("Database ping failed:", err);
                    } else {
                        console.log("Database ping successful:", result);
                    }
                });
            } catch (pingError) {
                console.warn("Could not perform database ping:", pingError.message);
            }
        });
        
        return mongoose.connection;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        
        // Provide more helpful error information
        if (error.name === 'MongoParseError') {
            console.error("💡 Check your MONGODB_URI in the .env file. It should start with mongodb:// or mongodb+srv://");
        } else if (error.name === 'MongoServerSelectionError') {
            console.error("💡 Cannot reach MongoDB server. Check your network connection, IP whitelist settings, and make sure the MongoDB server is running.");
            console.error("💡 If using MongoDB Atlas, verify that your current IP address is in the IP Access List.");
        } else if (error.message.includes('ENOTFOUND')) {
            console.error("💡 Could not resolve the MongoDB hostname. Check your internet connection and DNS settings.");
        } else if (error.message.includes('ETIMEDOUT')) {
            console.error("💡 Connection timed out. This could be due to network latency or a firewall blocking the connection.");
        } else if (error.message.includes('Authentication failed')) {
            console.error("💡 Authentication failed. Check your username and password in the connection string.");
        }
        
        // Don't exit process to allow tests to continue
        if (process.env.NODE_ENV !== 'test') {
            if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
                console.log(`Attempting to reconnect in 5 seconds (Attempt ${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
                setTimeout(() => {
                    connectDB();
                }, 5000);
            } else {
                console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Exiting...`);
                process.exit(1);
            }
        } else {
            // For tests, don't try to reconnect
            console.warn("Not attempting reconnection because NODE_ENV is set to 'test'");
        }
        
        return null;
    }
};

// Add a utility function to check if connected
const isDbConnected = () => isConnected;

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
