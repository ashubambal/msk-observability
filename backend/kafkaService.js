const { Kafka, logLevel } = require('kafkajs');

class KafkaService {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'msk-infralens-api',
      brokers: ['localhost:9092', '127.0.0.1:9092'],
      logLevel: logLevel.WARN,
      connectionTimeout: 10000,
      requestTimeout: 30000,
    });

    this.admin = this.kafka.admin();
    this.consumer = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      console.log('🔌 Attempting to connect to Kafka...');
      await this.admin.connect();
      this.isConnected = true;
      console.log('✅ Connected to Kafka successfully');
      
      // Test the connection by fetching metadata
      const metadata = await this.admin.fetchTopicMetadata();
      console.log(`📊 Found ${metadata.topics.length} topics`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Kafka:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
      }
      await this.admin.disconnect();
      this.isConnected = false;
      console.log('Disconnected from Kafka');
    } catch (error) {
      console.error('Error disconnecting from Kafka:', error.message);
    }
  }

  async getClusterMetadata() {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Kafka');
      }

      const metadata = await this.admin.fetchTopicMetadata();
      const brokers = await this.admin.describeCluster();
      
      let totalPartitions = 0;
      let underReplicatedPartitions = 0;

      metadata.topics.forEach(topic => {
        totalPartitions += topic.partitions.length;
        topic.partitions.forEach(partition => {
          if (partition.replicas.length > partition.isr.length) {
            underReplicatedPartitions++;
          }
        });
      });

      return {
        brokers: brokers.brokers.length,
        totalPartitions,
        totalMessages: "Live", // Would need consumer to get actual count
        avgLatency: "< 1ms", // Would need metrics collection
        underReplicatedPartitions,
        clusterId: brokers.clusterId,
        controller: brokers.controller
      };
    } catch (error) {
      console.error('Error fetching cluster metadata:', error.message);
      throw error;
    }
  }

  async getTopics() {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Kafka');
      }

      const metadata = await this.admin.fetchTopicMetadata();
      const topics = [];

      for (const topic of metadata.topics) {
        if (!topic.name.startsWith('__')) { // Filter out internal topics
          const configs = await this.admin.describeConfigs({
            resources: [{ type: 2, name: topic.name }] // 2 = TOPIC
          });

          const topicConfig = configs.resources[0]?.configEntries || [];
          const replicationFactor = topic.partitions[0]?.replicas.length || 1;

          topics.push({
            name: topic.name,
            partitions: topic.partitions.length,
            replicationFactor,
            size: "Dynamic", // Would need to calculate actual size
            throughput: "Live", // Would need metrics collection
            configs: topicConfig.reduce((acc, config) => {
              acc[config.configName] = config.configValue;
              return acc;
            }, {})
          });
        }
      }

      return topics;
    } catch (error) {
      console.error('Error fetching topics:', error.message);
      throw error;
    }
  }

  async getConsumerGroups() {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to Kafka');
      }

      const groups = await this.admin.listGroups();
      const consumerGroups = [];

      for (const group of groups.groups) {
        if (group.groupId && !group.groupId.startsWith('__')) {
          try {
            const groupDesc = await this.admin.describeGroups([group.groupId]);
            const offsets = await this.admin.fetchOffsets({
              groupId: group.groupId,
              topics: [] // Empty to get all topics for this group
            });

            let totalLag = 0;
            const topics = new Set();

            // Calculate lag (simplified - would need more complex logic for accurate lag)
            offsets.forEach(offset => {
              topics.add(offset.topic);
              offset.partitions.forEach(partition => {
                if (partition.offset && partition.high && partition.high !== '-1') {
                  totalLag += Math.max(0, parseInt(partition.high) - parseInt(partition.offset));
                }
              });
            });

            const groupInfo = groupDesc.groups[0];
            consumerGroups.push({
              groupId: group.groupId,
              lag: totalLag,
              members: groupInfo?.members?.length || 0,
              status: groupInfo?.state || 'Unknown',
              topics: Array.from(topics),
              protocolType: groupInfo?.protocolType || 'consumer'
            });
          } catch (error) {
            console.warn(`Could not get details for group ${group.groupId}:`, error.message);
          }
        }
      }

      return consumerGroups;
    } catch (error) {
      console.error('Error fetching consumer groups:', error.message);
      throw error;
    }
  }

  async getRecentMessages(limit = 20) {
    try {
      // For now, return sample messages to test the UI
      const sampleMessages = [
        {
          topic: 'user-events',
          partition: 0,
          offset: '12345',
          key: 'user-123',
          value: {
            event: 'user_login',
            userId: 'user-123',
            timestamp: new Date().toISOString(),
            metadata: { source: 'web', ip: '192.168.1.100' }
          },
          timestamp: new Date().toLocaleString(),
          headers: {}
        },
        {
          topic: 'order-updates',
          partition: 1,
          offset: '67890',
          key: 'order-456',
          value: {
            orderId: 'order-456',
            status: 'shipped',
            customerId: 'customer-789',
            amount: 129.99
          },
          timestamp: new Date(Date.now() - 30000).toLocaleString(),
          headers: {}
        },
        {
          topic: 'system-logs',
          partition: 2,
          offset: '54321',
          key: null,
          value: 'INFO: Application started successfully',
          timestamp: new Date(Date.now() - 60000).toLocaleString(),
          headers: { level: 'INFO' }
        }
      ];

      return sampleMessages;
    } catch (error) {
      console.error('Error fetching recent messages:', error.message);
      return [];
    }
  }

  async createDemoTopics() {
    try {
      const topics = [
        {
          topic: 'user-events',
          numPartitions: 6,
          replicationFactor: 1,
          configEntries: [
            { name: 'cleanup.policy', value: 'delete' },
            { name: 'retention.ms', value: '604800000' } // 7 days
          ]
        },
        {
          topic: 'order-updates',
          numPartitions: 4,
          replicationFactor: 1,
          configEntries: [
            { name: 'cleanup.policy', value: 'delete' },
            { name: 'retention.ms', value: '259200000' } // 3 days
          ]
        },
        {
          topic: 'system-logs',
          numPartitions: 8,
          replicationFactor: 1,
          configEntries: [
            { name: 'cleanup.policy', value: 'delete' },
            { name: 'retention.ms', value: '86400000' } // 1 day
          ]
        }
      ];

      await this.admin.createTopics({ topics });
      console.log('✅ Demo topics created successfully');
      return true;
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('📝 Demo topics already exist');
        return true;
      }
      console.error('Error creating demo topics:', error.message);
      throw error;
    }
  }

  async sendDemoMessages() {
    try {
      const producer = this.kafka.producer();
      await producer.connect();

      const messages = [
        {
          topic: 'user-events',
          messages: [
            { key: 'user1', value: JSON.stringify({ userId: 1, action: 'login', timestamp: new Date() }) },
            { key: 'user2', value: JSON.stringify({ userId: 2, action: 'purchase', timestamp: new Date() }) },
            { key: 'user3', value: JSON.stringify({ userId: 3, action: 'logout', timestamp: new Date() }) },
          ]
        },
        {
          topic: 'order-updates',
          messages: [
            { key: 'order1', value: JSON.stringify({ orderId: 1, status: 'shipped', timestamp: new Date() }) },
            { key: 'order2', value: JSON.stringify({ orderId: 2, status: 'delivered', timestamp: new Date() }) },
          ]
        },
        {
          topic: 'system-logs',
          messages: [
            { key: 'system', value: JSON.stringify({ level: 'INFO', message: 'System startup complete', timestamp: new Date() }) },
            { key: 'system', value: JSON.stringify({ level: 'WARN', message: 'High memory usage detected', timestamp: new Date() }) },
          ]
        }
      ];

      for (const topicMessages of messages) {
        await producer.send(topicMessages);
      }

      await producer.disconnect();
      console.log('✅ Demo messages sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending demo messages:', error.message);
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { 
          status: 'disconnected', 
          mode: 'kafka-local',
          error: 'Not connected to Kafka' 
        };
      }

      const metadata = await this.admin.fetchTopicMetadata();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mode: 'kafka-local',
        topicsCount: metadata.topics.filter(t => !t.name.startsWith('__')).length,
        brokersConnected: true,
        kafkaVersion: 'Local Instance'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        mode: 'kafka-local'
      };
    }
  }
}

module.exports = KafkaService;
