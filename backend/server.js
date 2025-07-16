const express = require('express');
const cors = require('cors');
const KafkaService = require('./kafkaService');

const app = express();
const PORT = process.env.PORT || 8000;
const kafkaService = new KafkaService();

// Middleware
app.use(cors());
app.use(express.json());

// Security middleware
app.use((req, res, next) => {
  // Remove server information headers
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// API Routes
app.get('/api/cluster-status', async (req, res) => {
  try {
    const clusterStatus = await kafkaService.getClusterMetadata();
    res.json(clusterStatus);
  } catch (error) {
    console.error('Error fetching cluster status:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch cluster status',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.get('/api/topics', async (req, res) => {
  try {
    const topics = await kafkaService.getTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch topics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.get('/api/consumer-groups', async (req, res) => {
  try {
    const consumerGroups = await kafkaService.getConsumerGroups();
    res.json(consumerGroups);
  } catch (error) {
    console.error('Error fetching consumer groups:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch consumer groups',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.get('/api/health', async (req, res) => {
  const health = await kafkaService.healthCheck();
  res.json(health);
});

// Demo setup endpoints
app.post('/api/setup-demo', async (req, res) => {
  try {
    await kafkaService.createDemoTopics();
    await kafkaService.sendDemoMessages();
    
    res.json({ 
      success: true, 
      message: 'Demo topics and messages created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error setting up demo:', error.message);
    res.status(500).json({ error: 'Failed to setup demo', details: error.message });
  }
});

app.get('/api/kafka-status', (req, res) => {
  res.json({
    connected: kafkaService.isConnected,
    mode: 'kafka-local',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MSK InfraLens API', 
    version: '2.0.0',
    mode: 'kafka-local',
    endpoints: ['/api/cluster-status', '/api/topics', '/api/consumer-groups', '/api/health', '/api/setup-demo']
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await kafkaService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await kafkaService.disconnect();
  process.exit(0);
});

// Start server and connect to Kafka
async function startServer() {
  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`🚀 MSK InfraLens API server running on port ${PORT}`);
    console.log(`🔧 Environment: Local Kafka`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });

  // Connect to local Kafka
  console.log('🔌 Connecting to local Kafka...');
  const connected = await kafkaService.connect();
  
  if (connected) {
    console.log('✅ Connected to local Kafka successfully');
    console.log('📝 Create demo data: POST http://localhost:8000/api/setup-demo');
  } else {
    console.log('❌ Failed to connect to local Kafka');
    console.log('💡 Make sure Kafka is running on localhost:9092');
  }
}

startServer();
