import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function SimpleDashboard() {
  const [topics, setTopics] = useState([]);
  const [clusterStatus, setClusterStatus] = useState({});
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cluster');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const fetchKafkaData = useCallback(async () => {
    try {
      setError(null);
      const [topicsRes, clusterRes, consumersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/topics`),
        axios.get(`${API_BASE_URL}/api/cluster-status`),
        axios.get(`${API_BASE_URL}/api/consumer-groups`)
      ]);

      setTopics(topicsRes.data);
      setClusterStatus(clusterRes.data);
      setConsumerGroups(consumersRes.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to connect to backend');
      setIsLoading(false);
      console.error('Error fetching Kafka data:', err);
    }
  }, [API_BASE_URL]);

  const fetchRecentMessages = useCallback(async () => {
    try {
      const messagesRes = await axios.get(`${API_BASE_URL}/api/recent-messages`);
      setMessages(messagesRes.data);
    } catch (err) {
      console.error('Error fetching recent messages:', err);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchKafkaData();
    fetchRecentMessages();
    const interval = setInterval(() => {
      fetchKafkaData();
      fetchRecentMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchKafkaData, fetchRecentMessages]);

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Stable': return 'badge success';
      case 'Rebalancing': return 'badge warning';
      case 'Error': return 'badge danger';
      default: return 'badge';
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>MSK InfraLens</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className={error ? 'badge danger' : 'badge success'}>
            {error ? '🔴 Disconnected' : '🟢 Connected'}
          </span>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'cluster' ? 'active' : ''}`}
          onClick={() => setActiveTab('cluster')}
        >
          🏠 Cluster Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'topics' ? 'active' : ''}`}
          onClick={() => setActiveTab('topics')}
        >
          📝 Topics
        </button>
        <button 
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          📨 Live Messages
        </button>
        <button 
          className={`tab-button ${activeTab === 'consumers' ? 'active' : ''}`}
          onClick={() => setActiveTab('consumers')}
        >
          👥 Consumer Groups
        </button>
      </div>

      {activeTab === 'cluster' && (
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Cluster Overview</h2>
          <div className="grid">
            <div 
              className="card clickable" 
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer' }}
              onClick={() => setActiveTab('cluster')}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{clusterStatus.brokers || 0}</h3>
              <p>Kafka Brokers</p>
            </div>
            <div 
              className="card clickable" 
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', cursor: 'pointer' }}
              onClick={() => setActiveTab('cluster')}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{clusterStatus.totalPartitions || 0}</h3>
              <p>Total Partitions</p>
            </div>
            <div 
              className="card clickable" 
              style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', cursor: 'pointer' }}
              onClick={() => setActiveTab('messages')}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{messages.length || 0}</h3>
              <p>Recent Messages</p>
            </div>
            <div 
              className="card clickable" 
              style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', cursor: 'pointer' }}
              onClick={() => setActiveTab('topics')}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{topics.length || 0}</h3>
              <p>Total Topics</p>
            </div>
            <div 
              className="card clickable" 
              style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', cursor: 'pointer' }}
              onClick={() => setActiveTab('consumers')}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{consumerGroups.length || 0}</h3>
              <p>Total Consumer Groups</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'topics' && (
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Kafka Topics</h2>
          <div className="grid">
            {topics.map((topic, index) => (
              <div key={index} className="card">
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{topic.name}</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <span style={{ color: '#666' }}>Partitions:</span>
                    <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{topic.partitions}</span>
                  </div>
                  <div>
                    <span style={{ color: '#666' }}>Replication:</span>
                    <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{topic.replicationFactor}</span>
                  </div>
                  <div>
                    <span style={{ color: '#666' }}>Size:</span>
                    <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{topic.size}</span>
                  </div>
                  <div>
                    <span style={{ color: '#666' }}>Throughput:</span>
                    <span className="badge" style={{ marginLeft: '8px' }}>{topic.throughput}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Live Message Activity</h2>
          <div style={{ marginBottom: '20px' }}>
            <span className="badge success">🔄 Auto-refresh every 30s</span>
            <span className="badge" style={{ marginLeft: '10px' }}>📊 Recent: {messages.length} messages</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <h3 style={{ color: '#666', marginBottom: '10px' }}>No recent messages</h3>
                <p style={{ color: '#888' }}>Try sending some test messages or check if topics have active producers</p>
                <button 
                  className="button" 
                  style={{ marginTop: '15px' }}
                  onClick={() => {
                    axios.post(`${API_BASE_URL}/api/setup-demo`)
                      .then(() => {
                        setTimeout(fetchRecentMessages, 2000);
                      })
                      .catch(err => console.error('Demo setup failed:', err));
                  }}
                >
                  🚀 Generate Demo Messages
                </button>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="card" style={{ borderLeft: '4px solid #007bff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{msg.topic}</h4>
                      <span style={{ fontSize: '12px', color: '#666' }}>Partition {msg.partition} • Offset {msg.offset}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#888' }}>{msg.timestamp}</span>
                  </div>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', marginBottom: '8px' }}>
                    <strong>Key:</strong> <code style={{ backgroundColor: '#e9ecef', padding: '2px 4px', borderRadius: '2px' }}>{msg.key || 'null'}</code>
                  </div>
                  <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                    <strong>Value:</strong> 
                    <pre style={{ margin: '5px 0 0 0', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {typeof msg.value === 'object' ? JSON.stringify(msg.value, null, 2) : msg.value}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'consumers' && (
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Consumer Groups</h2>
          <div className="grid">
            {consumerGroups.map((group, index) => (
              <div key={index} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{group.groupId}</h3>
                  <span className={getBadgeClass(group.status)}>{group.status}</span>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <span style={{ color: '#666' }}>Lag:</span>
                    <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{group.lag}</span>
                  </div>
                  <div>
                    <span style={{ color: '#666' }}>Members:</span>
                    <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{group.members}</span>
                  </div>
                  <div>
                    <span style={{ color: '#666' }}>Topics:</span>
                    <span style={{ marginLeft: '8px' }}>{group.topics.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading Kafka data...</p>
        </div>
      )}
    </div>
  );
}
