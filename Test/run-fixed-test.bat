@echo off
echo ===================================
echo MVP Fixed Test Suite
echo ===================================

echo Installing dependencies...
call npm install dotenv fs-extra path

echo.
echo Running fixed tests...
node run-tests-fixed.js

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