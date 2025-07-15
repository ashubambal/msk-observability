@echo off
echo MSK InfraLens - Starting Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

echo Starting backend server...
start "MSK InfraLens Backend" cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo Starting frontend...
echo.
echo Dashboard: http://localhost:3000
echo Backend API: http://localhost:8000
echo.
echo Close this window to stop the frontend.
echo Backend will continue running in its own window.
echo.

npm start
