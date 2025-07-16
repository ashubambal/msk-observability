# MSK InfraLens - Local Kafka Edition

A lightweight Kafka monitoring dashboard optimized for local development. **Real-time data from your local Kafka cluster.**

## ⚡ Quick Start

1. **Prerequisites:**
   - Ensure your local Kafka instance is running on `localhost:9092`
   - Node.js installed
   - Kafka should be accessible and running

2. **Install dependencies:**
   ```powershell
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Start the application:**
   
   **🚀 VS Code Tasks (Recommended):**
   - `Ctrl+Shift+P` → "Tasks: Run Task" → "Start MSK InfraLens Backend"
   - `Ctrl+Shift+P` → "Tasks: Run Task" → "Start MSK InfraLens Frontend"
   
   **Manual:**
   ```powershell
   # Terminal 1 - Backend
   cd backend; npm start
   
   # Terminal 2 - Frontend  
   npm start
   ```

4. **Access the application:**
   - 📊 **Dashboard**: http://localhost:3000
   - 🔧 **Backend API**: http://localhost:8000
   - � **Health Check**: http://localhost:8000/api/health

## 🚀 What's Included

### Real Kafka Integration:
- ✅ **Direct Connection** to local Kafka (localhost:9092)
- ✅ **Live Cluster Metrics** - Real broker status and partition counts
- ✅ **Topic Management** - Live topic details and configurations  
- ✅ **Consumer Monitoring** - Real consumer group lag and status
- ✅ **Demo Data Creation** - Built-in topic and message generation

### Clean & Focused:
- ❌ No Docker dependencies
- ❌ No cloud provider complexity  
- ❌ No mock data fallbacks
- ❌ No unnecessary configuration
- ✅ Pure local Kafka integration

## 🎯 Features

- 🏠 **Cluster Overview** - Live broker metrics and status
- 📝 **Topics Management** - Real topic details and configurations
- 👥 **Consumer Groups** - Live consumer lag and status monitoring  
- 📊 **Real-time Updates** - Live data refresh every 30 seconds
- 🔄 **Demo Setup** - POST `/api/setup-demo` for test data

## 📋 Dependencies

**Frontend (4 packages):**
- react, react-dom, react-scripts, axios

**Backend (3 packages):**
- express, cors, kafkajs

## 📁 Project Structure

```
msk-infralens/
├── src/
│   ├── SimpleDashboard.jsx    # Main dashboard component
│   ├── index.js               # App entry point  
│   └── index.css              # Lightweight styles
├── backend/
│   ├── server.js              # Express server with Kafka integration
│   ├── kafkaService.js        # Kafka connection and data fetching
│   └── package.json           # Backend dependencies
├── public/
│   └── index.html             # HTML template
├── package.json               # Frontend dependencies
└── README.md                  # Documentation
```

## 🔧 Tech Stack

- **Frontend**: React 18 + Custom CSS
- **Backend**: Node.js + Express + KafkaJS
- **Data Source**: Local Apache Kafka
- **API**: RESTful endpoints with real-time JSON data

## 🔄 API Endpoints

- `GET /api/health` - System health and Kafka connection status
- `GET /api/kafka-status` - Kafka connection details
- `GET /api/cluster-status` - Live cluster metadata
- `GET /api/topics` - Real topic information with configurations
- `GET /api/consumer-groups` - Consumer group lag and status
- `POST /api/setup-demo` - Create demo topics and test messages

## 💡 Troubleshooting

**Kafka Not Running:**
- If you see connection errors like `ECONNREFUSED 127.0.0.1:9092`, Kafka is not running
- **Start Kafka**: Navigate to your Kafka installation directory (e.g., `C:\kafka_2.13-3.9.1`)
- Run the start script: `.\start-kafka-services.ps1` or manually start:
  ```powershell
  # Start Zookeeper first
  .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
  
  # Then start Kafka (in a new terminal)
  .\bin\windows\kafka-server-start.bat .\config\server.properties
  ```
- **Verify**: Check if port 9092 is listening: `netstat -ano | Select-String ":9092"`

**Kafka Connection Issues:**
- Ensure Kafka is running: Check for Java process on port 9092
- Restart your local Kafka instance if needed
- Check logs: Backend will show connection status on startup

**Application Issues:**
- Backend not starting: Check if port 8000 is available
- Frontend not loading: Check if port 3000 is available  
- Data not updating: Verify Kafka connection in health endpoint
