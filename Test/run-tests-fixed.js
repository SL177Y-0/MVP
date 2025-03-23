/**
 * MVP Test Suite (Fixed Version)
 * 
 * This script focuses on checking environment variables and dependencies,
 * which are the most critical aspects to verify for the MVP.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  backendDir: path.resolve(__dirname, 'Backend'),
  frontendDir: path.resolve(__dirname, 'Frontend'),
  testReportDir: path.resolve(__dirname, 'test-reports'),
  requiredBackendEnvVars: [
    'MONGODB_URI',
    'PORT',
    'JWT_SECRET',
    'VERIDA_NETWORK',
    'VERIDA_API_ENDPOINT',
    'VERIDA_APP_DID',
    'FRONTEND_URL'
  ],
  requiredFrontendEnvVars: [
    'VITE_VERIDA_NETWORK',
    'VITE_VERIDA_APP_NAME',
    'VITE_API_BASE_URL',
    'VITE_PRIVYID'
  ]
};

// Create test report directory if it doesn't exist
if (!fs.existsSync(config.testReportDir)) {
  fs.mkdirSync(config.testReportDir, { recursive: true });
}

// Test results
const testResults = {
  env: { passed: 0, failed: 0 },
  deps: { passed: 0, failed: 0 }
};

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables...');
  
  // Backend .env
  const backendEnvPath = path.join(config.backendDir, '.env');
  if (!fs.existsSync(backendEnvPath)) {
    console.log('❌ Backend .env file not found');
    testResults.env.failed++;
  } else {
    const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
    const backendEnv = dotenv.parse(backendEnvContent);
    
    for (const varName of config.requiredBackendEnvVars) {
      if (!backendEnv[varName]) {
        console.log(`❌ Missing required backend env var: ${varName}`);
        testResults.env.failed++;
      } else {
        console.log(`✅ Backend env var found: ${varName}`);
        testResults.env.passed++;
      }
    }
  }
  
  // Frontend .env
  const frontendEnvPath = path.join(config.frontendDir, '.env');
  if (!fs.existsSync(frontendEnvPath)) {
    console.log('❌ Frontend .env file not found');
    testResults.env.failed++;
  } else {
    const frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
    const frontendEnv = dotenv.parse(frontendEnvContent);
    
    for (const varName of config.requiredFrontendEnvVars) {
      if (!frontendEnv[varName]) {
        console.log(`❌ Missing required frontend env var: ${varName}`);
        testResults.env.failed++;
      } else {
        console.log(`✅ Frontend env var found: ${varName}`);
        testResults.env.passed++;
      }
    }
  }
}

// Check dependencies
function checkDependencies() {
  console.log('\n📦 Checking Dependencies...');
  
  // Check Backend dependencies
  const backendPackageJsonPath = path.join(config.backendDir, 'package.json');
  if (!fs.existsSync(backendPackageJsonPath)) {
    console.log('❌ Backend package.json not found');
    testResults.deps.failed++;
  } else {
    console.log('✅ Backend package.json found');
    testResults.deps.passed++;
    
    // Check if type is set correctly
    const backendPackageJson = JSON.parse(fs.readFileSync(backendPackageJsonPath, 'utf8'));
    if (backendPackageJson.type !== 'commonjs') {
      console.log('❌ Backend package.json should have "type": "commonjs"');
      testResults.deps.failed++;
    } else {
      console.log('✅ Backend package.json has correct module type');
      testResults.deps.passed++;
    }
  }
  
  // Check Frontend dependencies via root package.json
  const rootPackageJsonPath = path.resolve(__dirname, 'package.json');
  if (!fs.existsSync(rootPackageJsonPath)) {
    console.log('❌ Root package.json not found');
    testResults.deps.failed++;
  } else {
    console.log('✅ Root package.json found (contains Frontend dependencies)');
    testResults.deps.passed++;
    
    // Check if type is set correctly
    const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
    if (rootPackageJson.type !== 'module') {
      console.log('❌ Root package.json should have "type": "module"');
      testResults.deps.failed++;
    } else {
      console.log('✅ Root package.json has correct module type');
      testResults.deps.passed++;
    }
  }
}

// Check critical API routes
function checkCriticalRoutes() {
  console.log('\n🔍 Checking Critical API Routes...');
  
  // Check if scoreRoutes.js has the getTotalScore export
  const scoreRoutesPath = path.join(config.backendDir, 'routes', 'scoreRoutes.js');
  if (!fs.existsSync(scoreRoutesPath)) {
    console.log('❌ scoreRoutes.js not found');
    testResults.deps.failed++;
  } else {
    console.log('✅ scoreRoutes.js found');
    testResults.deps.passed++;
    
    const scoreRoutesContent = fs.readFileSync(scoreRoutesPath, 'utf8');
    if (!scoreRoutesContent.includes('getTotalScore')) {
      console.log('❌ getTotalScore not referenced in scoreRoutes.js');
      testResults.deps.failed++;
    } else {
      console.log('✅ getTotalScore referenced in scoreRoutes.js');
      testResults.deps.passed++;
    }
  }
  
  // Check if NewScoreController.js exports getTotalScore
  const controllerPath = path.join(config.backendDir, 'controllers', 'NewScoreController.js');
  if (!fs.existsSync(controllerPath)) {
    console.log('❌ NewScoreController.js not found');
    testResults.deps.failed++;
  } else {
    console.log('✅ NewScoreController.js found');
    testResults.deps.passed++;
    
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    if (!controllerContent.includes('module.exports = { CollectData, getTotalScore }')) {
      console.log('❌ getTotalScore not exported from NewScoreController.js');
      testResults.deps.failed++;
    } else {
      console.log('✅ getTotalScore exported from NewScoreController.js');
      testResults.deps.passed++;
    }
  }
}

// Generate test report
function generateReport() {
  const reportPath = path.join(config.testReportDir, `basic-test-report-${Date.now()}.md`);
  
  let report = `# MVP Basic Test Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `### Environment Variables\n`;
  report += `- Passed: ${testResults.env.passed}\n`;
  report += `- Failed: ${testResults.env.failed}\n\n`;
  
  report += `### Dependencies and Routes\n`;
  report += `- Passed: ${testResults.deps.passed}\n`;
  report += `- Failed: ${testResults.deps.failed}\n\n`;
  
  report += `## Recommendations\n\n`;
  
  // Add recommendations based on test results
  if (testResults.env.failed > 0) {
    report += `- ⚠️ Fix missing environment variables before deployment\n`;
  }
  
  if (testResults.deps.failed > 0) {
    report += `- ⚠️ Address dependency issues and route configurations\n`;
  }
  
  // Overall status
  const totalFailed = testResults.env.failed + testResults.deps.failed;
  
  if (totalFailed === 0) {
    report += `\n## Overall Status: ✅ READY FOR DEPLOYMENT\n`;
  } else if (totalFailed <= 2) {
    report += `\n## Overall Status: ⚠️ MINOR ISSUES TO RESOLVE\n`;
  } else {
    report += `\n## Overall Status: ❌ SIGNIFICANT ISSUES PRESENT\n`;
  }
  
  // Write report
  fs.writeFileSync(reportPath, report);
  console.log(`\n📊 Basic test report generated: ${reportPath}`);
  
  return {
    passed: totalFailed === 0,
    reportPath
  };
}

// Main function
function main() {
  console.log('🚀 Starting Basic MVP Test Suite');
  
  // Run checks
  checkEnvironmentVariables();
  checkDependencies();
  checkCriticalRoutes();
  
  // Generate report
  const reportResult = generateReport();
  
  // Print summary
  console.log('\n📝 Test Summary:');
  console.log(`- Environment Variables: ${testResults.env.passed} passed, ${testResults.env.failed} failed`);
  console.log(`- Dependencies and Routes: ${testResults.deps.passed} passed, ${testResults.deps.failed} failed`);
  
  // Exit with appropriate code
  process.exit(reportResult.passed ? 0 : 1);
}

// Run the main function
main(); 