/**
 * Complete MVP Test Suite
 * 
 * This script runs all tests for the MVP application:
 * 1. Environment variable checks
 * 2. Backend API tests
 * 3. Frontend component tests
 * 4. End-to-end flow tests
 * 
 * Usage:
 * node test-all.js
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
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
  requiredBackendPackages: [
    'express',
    'mongoose',
    'axios',
    'jsonwebtoken',
    'cors',
    'dotenv'
  ],
  requiredFrontendPackages: [
    'react',
    'react-dom',
    'react-router-dom',
    'framer-motion',
    'axios',
    'lucide-react',
    'wagmi',
    'lottie-react'
  ]
};

// Create test report directory if it doesn't exist
if (!fs.existsSync(config.testReportDir)) {
  fs.mkdirSync(config.testReportDir, { recursive: true });
}

// Test results
const testResults = {
  env: { passed: 0, failed: 0 },
  deps: { passed: 0, failed: 0 },
  backend: { passed: 0, failed: 0 },
  frontend: { passed: 0, failed: 0 },
  e2e: { passed: 0, failed: 0 }
};

// Helper function to run a command
function runCommand(command, args, cwd, env = process.env) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, { 
      cwd, 
      env: { ...process.env, ...env },
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(output);
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(output);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}\n${stderr}`));
      }
    });
  });
}

// Check if required environment variables are set
async function checkEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables...');
  
  try {
    // Backend .env
    const backendEnvPath = path.join(config.backendDir, '.env');
    if (!fs.existsSync(backendEnvPath)) {
      console.log('❌ Backend .env file not found');
      testResults.env.failed++;
    } else {
      const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
      const backendEnv = dotenv.parse(backendEnvContent);
      const requiredBackendVars = [
        'MONGODB_URI',
        'PORT',
        'JWT_SECRET',
        'VERIDA_NETWORK',
        'VERIDA_API_ENDPOINT',
        'VERIDA_APP_DID',
        'FRONTEND_URL'
      ];
      
      for (const varName of requiredBackendVars) {
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
      const requiredFrontendVars = [
        'VITE_VERIDA_NETWORK',
        'VITE_VERIDA_APP_NAME',
        'VITE_API_BASE_URL',
        'VITE_PRIVYID'
      ];
      
      for (const varName of requiredFrontendVars) {
        if (!frontendEnv[varName]) {
          console.log(`❌ Missing required frontend env var: ${varName}`);
          testResults.env.failed++;
        } else {
          console.log(`✅ Frontend env var found: ${varName}`);
          testResults.env.passed++;
        }
      }
    }
  } catch (error) {
    console.error('Error checking environment variables:', error);
    testResults.env.failed++;
  }
}

// Check dependencies
async function checkDependencies() {
  console.log('\n📦 Checking Dependencies...');
  
  try {
    // Backend package.json
    const backendPackageJsonPath = path.join(config.backendDir, 'package.json');
    if (!fs.existsSync(backendPackageJsonPath)) {
      console.log('❌ Backend package.json not found');
      testResults.deps.failed++;
    } else {
      const backendPackageJsonContent = fs.readFileSync(backendPackageJsonPath, 'utf8');
      const backendPackageJson = JSON.parse(backendPackageJsonContent);
      const backendDeps = { ...backendPackageJson.dependencies, ...backendPackageJson.devDependencies };
      
      for (const pkg of config.requiredBackendPackages) {
        if (!backendDeps[pkg]) {
          console.log(`❌ Missing required backend dependency: ${pkg}`);
          testResults.deps.failed++;
        } else {
          console.log(`✅ Backend dependency found: ${pkg}`);
          testResults.deps.passed++;
        }
      }
    }
    
    // Frontend package.json
    const frontendPackageJsonPath = path.join(config.frontendDir, 'package.json');
    if (!fs.existsSync(frontendPackageJsonPath)) {
      console.log('❌ Frontend package.json not found');
      testResults.deps.failed++;
    } else {
      const frontendPackageJsonContent = fs.readFileSync(frontendPackageJsonPath, 'utf8');
      const frontendPackageJson = JSON.parse(frontendPackageJsonContent);
      const frontendDeps = { ...frontendPackageJson.dependencies, ...frontendPackageJson.devDependencies };
      
      for (const pkg of config.requiredFrontendPackages) {
        if (!frontendDeps[pkg]) {
          console.log(`❌ Missing required frontend dependency: ${pkg}`);
          testResults.deps.failed++;
        } else {
          console.log(`✅ Frontend dependency found: ${pkg}`);
          testResults.deps.passed++;
        }
      }
    }
  } catch (error) {
    console.error('Error checking dependencies:', error);
    testResults.deps.failed++;
  }
}

// Run backend tests
async function runBackendTests() {
  console.log('\n🧪 Running Backend Tests...');
  
  try {
    // Run comprehensive backend test
    await runCommand('node', ['test/comprehensive-backend-test.js'], config.backendDir);
    console.log('✅ Comprehensive backend tests completed');
    testResults.backend.passed++;
    
    // Run e2e test
    await runCommand('node', ['test/e2e-test.js'], config.backendDir);
    console.log('✅ End-to-end backend tests completed');
    testResults.backend.passed++;
  } catch (error) {
    console.error('❌ Backend tests failed:', error.message);
    testResults.backend.failed++;
  }
}

// Run frontend tests
async function runFrontendTests() {
  console.log('\n🧪 Running Frontend Tests...');
  
  try {
    // First check if the test directory exists
    const testDir = path.join(config.frontendDir, 'test');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Copy the component tests to the test directory
    const sourcePath = path.resolve(__dirname, 'Frontend/test/component-tests.js');
    const targetPath = path.join(testDir, 'component-tests.js');
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
    
    // Run component tests
    await runCommand('node', ['test/component-tests.js'], config.frontendDir);
    console.log('✅ Frontend component tests completed');
    testResults.frontend.passed++;
  } catch (error) {
    console.error('❌ Frontend tests failed:', error.message);
    testResults.frontend.failed++;
  }
}

// Generate final report
function generateReport() {
  const reportFile = path.join(config.testReportDir, `complete-test-report-${Date.now()}.md`);
  
  let report = `# MVP Complete Test Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `### Environment Variables\n`;
  report += `- Passed: ${testResults.env.passed}\n`;
  report += `- Failed: ${testResults.env.failed}\n\n`;
  
  report += `### Dependencies\n`;
  report += `- Passed: ${testResults.deps.passed}\n`;
  report += `- Failed: ${testResults.deps.failed}\n\n`;
  
  report += `### Backend Tests\n`;
  report += `- Passed: ${testResults.backend.passed}\n`;
  report += `- Failed: ${testResults.backend.failed}\n\n`;
  
  report += `### Frontend Tests\n`;
  report += `- Passed: ${testResults.frontend.passed}\n`;
  report += `- Failed: ${testResults.frontend.failed}\n\n`;
  
  report += `### End-to-End Tests\n`;
  report += `- Passed: ${testResults.e2e.passed}\n`;
  report += `- Failed: ${testResults.e2e.failed}\n\n`;
  
  report += `## Recommendations\n\n`;
  
  // Add recommendations based on test results
  if (testResults.env.failed > 0) {
    report += `- ⚠️ Fix missing environment variables before deployment\n`;
  }
  
  if (testResults.deps.failed > 0) {
    report += `- ⚠️ Install missing dependencies\n`;
  }
  
  if (testResults.backend.failed > 0) {
    report += `- ⚠️ Address backend test failures\n`;
  }
  
  if (testResults.frontend.failed > 0) {
    report += `- ⚠️ Fix frontend component issues\n`;
  }
  
  if (testResults.e2e.failed > 0) {
    report += `- ⚠️ Resolve end-to-end integration problems\n`;
  }
  
  // Overall status
  const totalFailed = testResults.env.failed + testResults.deps.failed + 
                       testResults.backend.failed + testResults.frontend.failed + 
                       testResults.e2e.failed;
  
  if (totalFailed === 0) {
    report += `\n## Overall Status: ✅ READY FOR DEPLOYMENT\n`;
  } else if (totalFailed <= 3) {
    report += `\n## Overall Status: ⚠️ MINOR ISSUES TO RESOLVE\n`;
  } else {
    report += `\n## Overall Status: ❌ SIGNIFICANT ISSUES PRESENT\n`;
  }
  
  // Write report
  fs.writeFileSync(reportFile, report);
  console.log(`\n📊 Complete test report generated: ${reportFile}`);
  
  return {
    passed: totalFailed === 0,
    reportFile
  };
}

// Main function
async function main() {
  console.log('🚀 Starting Complete MVP Test Suite');
  
  try {
    // Run all checks
    await checkEnvironmentVariables();
    await checkDependencies();
    await runBackendTests();
    await runFrontendTests();
    
    // Generate final report
    const reportResult = generateReport();
    
    // Print summary
    console.log('\n📝 Test Summary:');
    console.log(`- Environment Variables: ${testResults.env.passed} passed, ${testResults.env.failed} failed`);
    console.log(`- Dependencies: ${testResults.deps.passed} passed, ${testResults.deps.failed} failed`);
    console.log(`- Backend Tests: ${testResults.backend.passed} passed, ${testResults.backend.failed} failed`);
    console.log(`- Frontend Tests: ${testResults.frontend.passed} passed, ${testResults.frontend.failed} failed`);
    console.log(`- End-to-End Tests: ${testResults.e2e.passed} passed, ${testResults.e2e.failed} failed`);
    
    // Exit with appropriate code
    process.exit(reportResult.passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 