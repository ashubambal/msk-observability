# MSK InfraLens - Optimized

A lightweight Kafka monitoring dashboard for AWS MSK clusters. **Total size: < 1MB** (without node_modules).

## ⚡ Quick Start

1. **Install dependencies:**
   ```powershell
   # PowerShell (Windows)
   npm install
   cd backend
   npm install
   cd ..
   ```
   
   ```bash
   # Bash/Terminal (Linux/Mac)
   npm install && cd backend && npm install && cd ..
   ```

2. **Start the application:**
   
   **🚀 One-Click Start (Choose one):**
   ```cmd
   # Batch file (Windows - Always works)
   start.bat
   ```
   
   ```powershell
   # PowerShell (if execution policy allows)
   PowerShell -ExecutionPolicy Bypass -File "start.ps1"
   ```
   
   **VS Code Tasks (Recommended)**
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run: "Tasks: Run Task" → "Start MSK InfraLens Backend"
   - Run: "Tasks: Run Task" → "Start MSK InfraLens Frontend"
   
   **Manual (Two Terminals)**
   ```powershell
   # Terminal 1 - Backend
   cd backend; npm start
   
   # Terminal 2 - Frontend
   npm start
   ```

3. **Access the application:**
   - 📊 **Dashboard**: http://localhost:3000
   - 🔧 **Backend API**: http://localhost:8000
   - 🎭 **Mode**: Demo with realistic mock data

## 🚀 What's Optimized

**Size Reduction: 450MB → <1MB (99.8% reduction)**

### Removed:
- ❌ All `node_modules` (installable via npm)
- ❌ Tailwind CSS + PostCSS (replaced with simple CSS)
- ❌ Unnecessary UI component libraries
- ❌ AWS SDK dependencies (demo mode only)
- ❌ Complex configuration files
- ❌ PowerShell/batch scripts

### Simplified:
- ✅ **Frontend**: Pure React with inline styles
- ✅ **Backend**: Express.js with mock data only
- ✅ **Dependencies**: Only essential packages
- ✅ **CSS**: Custom lightweight styles
- ✅ **Components**: Single dashboard component

## 📋 Current Dependencies

**Frontend (4 packages):**
- react, react-dom, react-scripts, axios

**Backend (2 packages):**
- express, cors

## 🎯 Features

- 🏠 **Cluster Overview** - Broker metrics and status
- 📝 **Topics Management** - Topic details and throughput
- 👥 **Consumer Groups** - Group status and lag monitoring
- 📊 **Real-time Updates** - Auto-refresh every 30 seconds
- 🎭 **Demo Mode** - Works without AWS setup

## 📁 Project Structure

```
msk-infralens/ (< 1MB)
├── src/
│   ├── SimpleDashboard.jsx    # Main dashboard component
│   ├── index.js               # App entry point  
│   └── index.css              # Lightweight styles
├── backend/
│   ├── server.js              # Express server with mock data
│   └── package.json           # Backend dependencies
├── public/
│   └── index.html             # HTML template
├── start.bat                  # Windows batch startup script
├── start.ps1                  # PowerShell startup script
├── package.json               # Frontend dependencies
└── README.md                  # Documentation
```

## 🔧 Tech Stack

- **Frontend**: React 18 + Custom CSS (no frameworks)
- **Backend**: Node.js + Express (minimal)
- **API**: RESTful endpoints with JSON
- **Demo**: Built-in mock data (no external dependencies)

## 💡 Troubleshooting

**PowerShell Script Issues:**
- If `.\start.ps1` doesn't work, use: `PowerShell -ExecutionPolicy Bypass -File "start.ps1"`
- Or simply use `start.bat` which always works on Windows
- VS Code Tasks are the most reliable method

**For Windows PowerShell users:**
- Use `;` instead of `&&` to chain commands
- Example: `npm install; cd backend; npm install; cd ..`
