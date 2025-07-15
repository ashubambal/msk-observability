const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockClusterStatus = {
  brokers: 3,
  totalPartitions: 24,
  totalMessages: "1.2M",
  avgLatency: "2.3ms",
  underReplicatedPartitions: 0
};

const mockTopics = [
  { name: "user-events", partitions: 6, replicationFactor: 3, size: "1.2GB", throughput: "150 KB/s" },
  { name: "order-updates", partitions: 4, replicationFactor: 3, size: "800MB", throughput: "89 KB/s" },
  { name: "system-logs", partitions: 8, replicationFactor: 2, size: "2.1GB", throughput: "245 KB/s" }
];

const mockConsumerGroups = [
  { groupId: "analytics-service", lag: 12, members: 3, status: "Stable", topics: ["user-events"] },
  { groupId: "email-processor", lag: 0, members: 2, status: "Stable", topics: ["order-updates"] },
  { groupId: "monitoring-agent", lag: 156, members: 1, status: "Rebalancing", topics: ["system-logs"] }
];

// API Routes
app.get('/api/cluster-status', (req, res) => {
  res.json(mockClusterStatus);
});

app.get('/api/topics', (req, res) => {
  res.json(mockTopics);
});

app.get('/api/consumer-groups', (req, res) => {
  res.json(mockConsumerGroups);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), mode: 'demo' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MSK InfraLens API', 
    version: '1.0.0',
    mode: 'demo',
    endpoints: ['/api/cluster-status', '/api/topics', '/api/consumer-groups', '/api/health']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MSK InfraLens API server running on port ${PORT}`);
  console.log(`Environment: demo mode`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
