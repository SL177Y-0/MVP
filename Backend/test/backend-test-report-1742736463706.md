# Backend Test Report

**Test ID:** backend-test-1742736458061  
**Date:** 3/23/2025, 6:57:38 PM  
**Duration:** 5.56 seconds  

## Summary

- **Total Tests:** 13
- **Successful:** 4
- **Errors:** 8
- **Warnings:** 0
- **Success Rate:** 30.77%

## Database Schema

- **Collections:** users, scores, wallets
- **Email Index:** Properly configured

## Test Results

| Test | Status | Details |
|------|--------|--------|
| MongoDB Connection | ✅ | Connected to MongoDB |
| User Email Index | ✅ | Found proper email index with partial filter expression |
| Score Collection | ✅ | Score collection exists with indexes |
| Database Schema | ✅ | Found 3 collections |
| Start Server | ❌ | Failed to start server |
| Create Test Users | ❌ | Failed to create test users |
| Wallet Connect | ❌ | No test users available for wallet connect test |
| Verify Wallet Status | ❌ | Failed to verify wallet status |
| Check Score Records | ❌ | Failed to check score records |
| Email Uniqueness | ❌ | Failed to test email uniqueness |
| Null Email Handling | ❌ | Error testing null email handling |
| Cleanup | ❌ | Failed to clean up test data |
| Stop Server | ⚠️ | Server was not started by this script, skipping stop |

## Errors

### Start Server

- **Message:** Failed to start server
- **Error:** C:\Users\SL177Y\Pictures\MVP\Backend\node_modules\express\lib\router\route.js:216
        throw new Error(msg);
        ^

Error: Route.get() requires a callback function but got a [object Undefined]
    at Route.<computed> [as get] (C:\Users\SL177Y\Pictures\MVP\Backend\node_modules\express\lib\router\route.js:216:15)
    at proto.<computed> [as get] (C:\Users\SL177Y\Pictures\MVP\Backend\node_modules\express\lib\router\index.js:521:19)
    at Object.<anonymous> (C:\Users\SL177Y\Pictures\MVP\Backend\routes\scoreRoutes.js:13:8)
    at Module._compile (node:internal/modules/cjs/loader:1562:14)
    at Object..js (node:internal/modules/cjs/loader:1699:10)
    at Module.load (node:internal/modules/cjs/loader:1313:32)
    at Function._load (node:internal/modules/cjs/loader:1123:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:217:24)
    at Module.require (node:internal/modules/cjs/loader:1335:12)

Node.js v22.13.0

- **Timestamp:** 3/23/2025, 6:57:43 PM

### Create Test Users

- **Message:** Failed to create test users
- **Error:** Cannot find module './models/User'
Require stack:
- C:\Users\SL177Y\Pictures\MVP\Backend\test\comprehensive-backend-test.js
- **Timestamp:** 3/23/2025, 6:57:43 PM

### Wallet Connect

- **Message:** No test users available for wallet connect test
- **Timestamp:** 3/23/2025, 6:57:43 PM

### Verify Wallet Status

- **Message:** Failed to verify wallet status
- **Error:** Cannot find module './models/User'
Require stack:
- C:\Users\SL177Y\Pictures\MVP\Backend\test\comprehensive-backend-test.js
- **Timestamp:** 3/23/2025, 6:57:43 PM

### Check Score Records

- **Message:** Failed to check score records
- **Error:** Cannot find module './models/Score'
Require stack:
- C:\Users\SL177Y\Pictures\MVP\Backend\test\comprehensive-backend-test.js
- **Timestamp:** 3/23/2025, 6:57:43 PM

### Email Uniqueness

- **Message:** Failed to test email uniqueness
- **Error:** Cannot find module './models/User'
Require stack:
- C:\Users\SL177Y\Pictures\MVP\Backend\test\comprehensive-backend-test.js
- **Timestamp:** 3/23/2025, 6:57:43 PM

### Null Email Handling

- **Message:** Error testing null email handling
- **Error:** Cannot find module './models/User'
Require stack:
- C:\Users\SL177Y\Pictures\MVP\Backend\test\comprehensive-backend-test.js
- **Timestamp:** 3/23/2025, 6:57:43 PM

### Cleanup

- **Message:** Failed to clean up test data
- **Error:** Cannot find module './models/User'
Require stack:
- C:\Users\SL177Y\Pictures\MVP\Backend\test\comprehensive-backend-test.js
- **Timestamp:** 3/23/2025, 6:57:43 PM


## Recommendations

- Verify the email uniqueness constraint in the User model.
- Ensure partial filter expression is properly configured for the email field.
- Check the wallet connect route implementation.
- Verify error handling for duplicate key errors.
- Verify the server.js file location and ensure all dependencies are installed.
