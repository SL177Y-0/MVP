import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking implemented fixes...');

// List of files to check
const filesToCheck = [
  { 
    path: 'Backend/controllers/twitterController.js', 
    shouldNotContain: ['d02e91c4e9msh', 'hardcoded'],
    shouldContain: ['process.env.RAPIDAPI_KEY']
  },
  { 
    path: 'Frontend/firebase.ts', 
    shouldNotContain: ['AIzaSy', 'hardcoded config'],
    shouldContain: ['import.meta.env.VITE_FIREBASE_API_KEY']
  },
  {
    path: 'Frontend/pages/Leaderboard.tsx',
    shouldContain: ['loading', 'error', 'try', 'catch']
  },
  {
    path: 'Backend/services/tokenService.js',
    shouldContain: ['storeToken', 'getToken', 'deleteToken']
  }
];

let passedChecks = 0;
let totalChecks = 0;

// Check each file
filesToCheck.forEach(file => {
  try {
    console.log(`\n📄 Checking ${file.path}...`);
    
    const filePath = path.join(__dirname, file.path);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${file.path}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for strings that should not be present
    if (file.shouldNotContain) {
      file.shouldNotContain.forEach(str => {
        totalChecks++;
        if (content.includes(str)) {
          console.error(`❌ File ${file.path} still contains: ${str}`);
        } else {
          console.log(`✅ File ${file.path} does not contain: ${str}`);
          passedChecks++;
        }
      });
    }
    
    // Check for strings that should be present
    if (file.shouldContain) {
      file.shouldContain.forEach(str => {
        totalChecks++;
        if (content.includes(str)) {
          console.log(`✅ File ${file.path} contains: ${str}`);
          passedChecks++;
        } else {
          console.error(`❌ File ${file.path} does not contain: ${str}`);
        }
      });
    }
  } catch (error) {
    console.error(`❌ Error checking ${file.path}:`, error.message);
  }
});

// Print summary
console.log(`\n📊 Results: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('✅ All fixes were implemented successfully!');
} else {
  console.log(`❌ Some fixes need attention: ${totalChecks - passedChecks} checks failed.`);
} 