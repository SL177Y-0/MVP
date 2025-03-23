@echo off
echo ===================================
echo MVP Complete Test Suite
echo ===================================

echo Installing dependencies...
call npm install dotenv fs-extra axios jsdom path

echo.
echo Running comprehensive tests...
node test-all.js

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ All tests passed!
) else (
  echo.
  echo ⚠️ Some tests failed. Check reports for details.
)

echo.
echo Test reports are available in the test-reports directory
echo =================================== 