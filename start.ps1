# MSK InfraLens - Simple Startup Script for PowerShell
Write-Host "Starting MSK InfraLens..." -ForegroundColor Green

# Check if Node.js is available
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Start backend in background
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Job -Name "MSK-Backend" -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    npm start
} | Out-Null

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Dashboard will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend API available at: http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend. Backend runs in background." -ForegroundColor Gray

npm start
