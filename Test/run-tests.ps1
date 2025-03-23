Write-Host "===================================" -ForegroundColor Cyan
Write-Host "MVP Complete Test Suite" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install dotenv fs-extra axios jsdom path

Write-Host ""
Write-Host "Running comprehensive tests..." -ForegroundColor Yellow
node test-all.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All tests passed!" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "⚠️ Some tests failed. Check reports for details." -ForegroundColor Red
}

Write-Host ""
Write-Host "Test reports are available in the test-reports directory" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan 