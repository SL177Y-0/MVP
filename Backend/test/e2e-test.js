/**
 * End-to-End Test Suite for MVP
 * 
 * This test suite verifies the entire application flow from frontend to backend
 * including API validation, environment variables, and key functionality.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  testTimeout: 30000,
  requiredBackendEnvVars: [
    'MONGODB_URI',
    'PORT',
    'JWT_SECRET',
    'VERIDA_NETWORK',
    'VERIDA_API_ENDPOINT',
    'VERIDA_APP_DID',
    'VERIDA_AUTH_REDIRECT_URL',
    'FRONTEND_URL'
  ],
  requiredFrontendEnvVars: [
    'VITE_VERIDA_NETWORK',
    'VITE_VERIDA_APP_NAME',
    'VITE_API_BASE_URL',
    'VITE_PRIVYID',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID'
  ],
  testUser: {
    privyId: `test-user-${Date.now()}`,
    twitterUsername: 'testuser123',
    walletAddress: `0x${Date.now().toString(16).padStart(40, '0')}`
  }
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Helper functions
function logTest(name, status, details = {}) {
  const result = { name, status, ...details };
  testResults.details.push(result);
  
  let logSymbol = '❓';
  if (status === 'passed') {
    testResults.passed++;
    logSymbol = '✅';
  } else if (status === 'failed') {
    testResults.failed++;
    logSymbol = '❌';
  } else if (status === 'skipped') {
    testResults.skipped++;
    logSymbol = '⚠️';
  }
  
  console.log(`${logSymbol} ${name}`);
  if (details.message) {
    console.log(`   ${details.message}`);
  }
  if (details.error) {
    console.error(`   Error: ${details.error}`);
  }
}

// Check if backend is running
async function isBackendRunning() {
  try {
    await axios.get(`${config.backendUrl}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Test Backend Environment Variables
async function testBackendEnvVars() {
  try {
    console.log('\n📋 Checking Backend Environment Variables...');
    
    // Read .env file
    const envPath = path.resolve(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      logTest('Backend .env file exists', 'failed', { 
        message: 'Backend .env file not found', 
        error: `Expected file at ${envPath}` 
      });
      return;
    }
    
    // Parse .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envContent);
    
    // Check each required variable
    for (const varName of config.requiredBackendEnvVars) {
      if (!envConfig[varName]) {
        logTest(`Backend env variable: ${varName}`, 'failed', {
          error: `Missing required environment variable: ${varName}`
        });
      } else {
        logTest(`Backend env variable: ${varName}`, 'passed');
      }
    }
  } catch (error) {
    logTest('Backend environment variables check', 'failed', {
      error: error.message
    });
  }
}

// Test Frontend Environment Variables
async function testFrontendEnvVars() {
  try {
    console.log('\n📋 Checking Frontend Environment Variables...');
    
    // Read .env file
    const envPath = path.resolve(__dirname, '../../Frontend', '.env');
    if (!fs.existsSync(envPath)) {
      logTest('Frontend .env file exists', 'failed', { 
        message: 'Frontend .env file not found', 
        error: `Expected file at ${envPath}` 
      });
      return;
    }
    
    // Parse .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envContent);
    
    // Check each required variable
    for (const varName of config.requiredFrontendEnvVars) {
      if (!envConfig[varName]) {
        logTest(`Frontend env variable: ${varName}`, 'failed', {
          error: `Missing required environment variable: ${varName}`
        });
      } else {
        logTest(`Frontend env variable: ${varName}`, 'passed');
      }
    }
  } catch (error) {
    logTest('Frontend environment variables check', 'failed', {
      error: error.message
    });
  }
}

// Test API Endpoints
async function testApiEndpoints() {
  console.log('\n🧪 Testing API Endpoints...');
  
  try {
    // Health endpoint
    try {
      const healthResponse = await axios.get(`${config.backendUrl}/api/health`);
      if (healthResponse.status === 200) {
        logTest('Health endpoint', 'passed');
      } else {
        logTest('Health endpoint', 'failed', {
          error: `Unexpected status code: ${healthResponse.status}`
        });
      }
    } catch (error) {
      logTest('Health endpoint', 'failed', {
        error: error.message
      });
    }
    
    // Test score API
    try {
      await axios.get(`${config.backendUrl}/api/score/total-score/${config.testUser.privyId}`);
      logTest('Score endpoint', 'passed');
    } catch (error) {
      // 404 is acceptable for a non-existent user
      if (error.response && error.response.status === 404) {
        logTest('Score endpoint', 'passed', {
          message: 'Correctly returns 404 for non-existent user'
        });
      } else {
        logTest('Score endpoint', 'failed', {
          error: error.message
        });
      }
    }
    
    // Test Verida auth URL endpoint
    try {
      const redirectUrl = 'http://localhost:3000/connect/telegram';
      const veridaAuthResponse = await axios.get(
        `${config.backendUrl}/api/verida/auth-url?redirectUrl=${encodeURIComponent(redirectUrl)}`
      );
      
      if (veridaAuthResponse.data && veridaAuthResponse.data.authUrl) {
        logTest('Verida auth URL endpoint', 'passed');
      } else {
        logTest('Verida auth URL endpoint', 'failed', {
          error: 'Auth URL not returned'
        });
      }
    } catch (error) {
      logTest('Verida auth URL endpoint', 'failed', {
        error: error.message
      });
    }
  } catch (error) {
    logTest('API endpoints test', 'failed', {
      error: error.message
    });
  }
}

// Test Input Validation
async function testInputValidation() {
  console.log('\n🧪 Testing Input Validation...');
  
  try {
    // Test with invalid Twitter username
    try {
      await axios.get(
        `${config.backendUrl}/api/score/get-score/${config.testUser.privyId}/inv@lid/null`
      );
      logTest('Twitter username validation', 'failed', {
        error: 'Invalid username was accepted'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('Twitter username validation', 'passed');
      } else {
        logTest('Twitter username validation', 'failed', {
          error: error.message
        });
      }
    }
    
    // Test with invalid wallet address
    try {
      await axios.get(
        `${config.backendUrl}/api/score/get-score/${config.testUser.privyId}/${config.testUser.twitterUsername}/invalid`
      );
      logTest('Wallet address validation', 'failed', {
        error: 'Invalid wallet address was accepted'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('Wallet address validation', 'passed');
      } else {
        logTest('Wallet address validation', 'failed', {
          error: error.message
        });
      }
    }
  } catch (error) {
    logTest('Input validation test', 'failed', {
      error: error.message
    });
  }
}

// Generate Test Report
async function generateReport() {
  const reportPath = path.resolve(__dirname, `e2e-test-report-${Date.now()}.json`);
  const markdownPath = path.resolve(__dirname, `e2e-test-report-${Date.now()}.md`);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.passed + testResults.failed + testResults.skipped,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped
    },
    details: testResults.details
  };
  
  // Write JSON report
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate Markdown report
  let markdown = `# End-to-End Test Report\n\n`;
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- Total Tests: ${report.summary.total}\n`;
  markdown += `- Passed: ${report.summary.passed}\n`;
  markdown += `- Failed: ${report.summary.failed}\n`;
  markdown += `- Skipped: ${report.summary.skipped}\n\n`;
  
  markdown += `## Test Results\n\n`;
  for (const test of report.details) {
    const symbol = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';
    markdown += `### ${symbol} ${test.name}\n\n`;
    
    if (test.message) {
      markdown += `${test.message}\n\n`;
    }
    
    if (test.error) {
      markdown += `**Error:** ${test.error}\n\n`;
    }
  }
  
  // Write Markdown report
  fs.writeFileSync(markdownPath, markdown);
  
  console.log(`\n📊 Test Reports Generated:`);
  console.log(`- JSON: ${reportPath}`);
  console.log(`- Markdown: ${markdownPath}`);
  
  return {
    reportPath,
    markdownPath
  };
}

// Main test function
async function runTests() {
  console.log('🚀 Starting End-to-End Tests');
  
  // Check if backend is running
  const backendRunning = await isBackendRunning();
  if (!backendRunning) {
    console.log('⚠️ Backend server is not running. Starting server...');
    // TODO: Implement server startup logic if needed
  }
  
  try {
    // Run test suites
    await testBackendEnvVars();
    await testFrontendEnvVars();
    await testApiEndpoints();
    await testInputValidation();
    
    // Generate report
    await generateReport();
    
    // Log summary
    console.log('\n📝 Test Summary:');
    console.log(`- Passed: ${testResults.passed}`);
    console.log(`- Failed: ${testResults.failed}`);
    console.log(`- Skipped: ${testResults.skipped}`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Test run failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests(); 