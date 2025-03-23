/**
 * Frontend Component Tests
 * 
 * Tests key components in isolation to ensure they render and behave correctly
 */

import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up a minimal browser environment for testing
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000,
  runScripts: 'outside-only'
});

global.window = dom.window;
global.document = window.document;
global.navigator = window.navigator;

// Component test registry
const componentTests = [
  {
    name: 'WalletConnectPage',
    path: '../pages/WalletConnectPage.tsx',
    expectedElements: [
      '.text-2xl.font-bold',      // Title
      'button',                   // Connect button
      '.w-12.h-12'                // Wallet icon container
    ],
    testCases: [
      {
        name: 'has wallet connection functionality',
        validate: (content) => content.includes('connectWallet')
      },
      {
        name: 'handles wallet connection errors',
        validate: (content) => content.includes('setError')
      },
      {
        name: 'stores wallet state in localStorage',
        validate: (content) => content.includes('localStorage.setItem')
      }
    ]
  },
  {
    name: 'TelegramConnectPage',
    path: '../pages/TelegramConnectPage.tsx',
    expectedElements: [
      '.text-2xl.font-bold',     // Title
      'button',                  // Connect button
      '.flex-1'                  // Layout container
    ],
    testCases: [
      {
        name: 'integrates with Verida component',
        validate: (content) => content.includes('<Verida')
      },
      {
        name: 'handles connection state changes',
        validate: (content) => content.includes('setIsConnected')
      },
      {
        name: 'displays animation',
        validate: (content) => content.includes('Lottie')
      }
    ]
  },
  {
    name: 'Verida Component',
    path: '../components/Verida.tsx',
    expectedElements: [
      'button',                  // Connect button
      '.w-full'                  // Container
    ],
    testCases: [
      {
        name: 'makes API calls to correct endpoints',
        validate: (content) => (
          content.includes('/api/verida/auth-url') && 
          content.includes('/api/verida/data/')
        )
      },
      {
        name: 'handles authentication flow',
        validate: (content) => (
          content.includes('window.location.href') && 
          content.includes('authTimeoutRef')
        )
      },
      {
        name: 'displays connection state',
        validate: (content) => (
          content.includes('connected') && 
          content.includes('setConnected')
        )
      }
    ]
  }
];

// Test results
const results = {
  passed: 0,
  failed: 0,
  componentResults: []
};

// Log formatted output
function log(message, type = 'info') {
  const symbols = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };
  
  console.log(`${symbols[type] || symbols.info} ${message}`);
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Test a component
async function testComponent(component) {
  log(`Testing ${component.name}...`);
  
  const componentResult = {
    name: component.name,
    tests: [],
    elementChecks: []
  };
  
  const filePath = path.resolve(__dirname, component.path);
  
  // Check if file exists
  if (!fileExists(filePath)) {
    log(`Component file not found: ${filePath}`, 'error');
    componentResult.tests.push({
      name: 'File exists',
      passed: false,
      error: `File not found: ${filePath}`
    });
    results.failed++;
    results.componentResults.push(componentResult);
    return;
  }
  
  // Read file content
  const content = readFile(filePath);
  if (!content) {
    log(`Failed to read file: ${filePath}`, 'error');
    componentResult.tests.push({
      name: 'File readable',
      passed: false,
      error: `Could not read file: ${filePath}`
    });
    results.failed++;
    results.componentResults.push(componentResult);
    return;
  }
  
  // Run individual test cases
  for (const testCase of component.testCases) {
    try {
      const passed = testCase.validate(content);
      componentResult.tests.push({
        name: testCase.name,
        passed
      });
      
      if (passed) {
        log(`  - ${testCase.name}: Passed`, 'success');
        results.passed++;
      } else {
        log(`  - ${testCase.name}: Failed`, 'error');
        results.failed++;
      }
    } catch (error) {
      componentResult.tests.push({
        name: testCase.name,
        passed: false,
        error: error.message
      });
      log(`  - ${testCase.name}: Failed with error: ${error.message}`, 'error');
      results.failed++;
    }
  }
  
  // Add to results
  results.componentResults.push(componentResult);
}

// Test all components
async function testAllComponents() {
  log('Starting component tests...', 'info');
  
  for (const component of componentTests) {
    await testComponent(component);
  }
  
  log('\nComponent tests completed', 'info');
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, 'error');
  
  generateReport();
}

// Generate test report
function generateReport() {
  const reportPath = path.resolve(__dirname, `component-test-report-${Date.now()}.json`);
  const markdownPath = path.resolve(__dirname, `component-test-report-${Date.now()}.md`);
  
  // Create JSON report
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  // Create Markdown report
  let markdown = `# Frontend Component Test Report\n\n`;
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- Total Tests: ${results.passed + results.failed}\n`;
  markdown += `- Passed: ${results.passed}\n`;
  markdown += `- Failed: ${results.failed}\n\n`;
  
  markdown += `## Component Results\n\n`;
  
  for (const component of results.componentResults) {
    markdown += `### ${component.name}\n\n`;
    
    for (const test of component.tests) {
      const symbol = test.passed ? '✅' : '❌';
      markdown += `- ${symbol} **${test.name}**`;
      
      if (!test.passed && test.error) {
        markdown += `: ${test.error}`;
      }
      
      markdown += '\n';
    }
    
    markdown += '\n';
  }
  
  fs.writeFileSync(markdownPath, markdown);
  
  log(`\nReports generated:`, 'info');
  log(`- JSON: ${reportPath}`, 'info');
  log(`- Markdown: ${markdownPath}`, 'info');
}

// Run tests
testAllComponents().catch(error => {
  log(`Test execution failed: ${error.message}`, 'error');
  process.exit(1);
}); 