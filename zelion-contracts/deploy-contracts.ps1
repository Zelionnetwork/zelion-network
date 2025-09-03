# PowerShell script to deploy contracts
Write-Host "Starting contract deployment..." -ForegroundColor Green
Write-Host ""

# Run deployment
node deploy-standalone.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Deployment failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}

# Verify deployment
Write-Host ""
Write-Host "Verifying deployment..." -ForegroundColor Yellow
node scripts/verify-deployment.js

Write-Host ""
Write-Host "Process complete" -ForegroundColor Cyan
