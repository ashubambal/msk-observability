import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function SimpleDashboard() {
  const [topics, setTopics] = useState([]);
  const [clusterStatus, setClusterStatus] = useState({});
  const [consumerGroups, setConsumerGroups] = useState([]);
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
      // Log error for debugging in development only
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching Kafka data:', err);
      }
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchKafkaData();
    const interval = setInterval(() => {
      fetchKafkaData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchKafkaData]);

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
