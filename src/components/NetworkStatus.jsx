import { useEffect, useState } from 'react';

export default function NetworkStatus({ networkInfo }) {
  const [connectionHistory, setConnectionHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    if (networkInfo) {
      setConnectionHistory(prev => [...prev.slice(-4), networkInfo]);
      setLastUpdated(networkInfo.lastUpdated || new Date().toLocaleTimeString());
    }
  }, [networkInfo]);

  if (!networkInfo) {
    return (
      <div className="network-status">
        <h3>Network Information</h3>
        <div className="network-not-supported">
          <p>⚠️ Network Information API not supported in this browser</p>
          <p className="small">
            This feature requires Chrome, Edge, or Opera on Android
          </p>
        </div>
      </div>
    );
  }

  const getNetworkQuality = () => {
    if (!networkInfo.effectiveType) return { text: 'Unknown', color: '#9E9E9E', icon: '❓' };
    
    if (networkInfo.effectiveType.includes('4g') && networkInfo.downlink > 4) {
      return { text: 'Excellent', color: '#4CAF50', icon: '📶' };
    } else if (networkInfo.effectiveType.includes('3g') && networkInfo.downlink > 2) {
      return { text: 'Good', color: '#FFC107', icon: '📶' };
    } else if (networkInfo.effectiveType.includes('2g')) {
      return { text: 'Poor', color: '#F44336', icon: '📶' };
    }
    return { text: 'Fair', color: '#FF9800', icon: '📶' };
  };

  const quality = getNetworkQuality();

  return (
    <div className="network-status">
      <div className="network-quality-badge" style={{ backgroundColor: `${quality.color}20` }}>
        <span style={{ color: quality.color }}>
          {quality.icon} {quality.text} Connection
        </span>
      </div>
      
      <div className="network-details-grid">
        <div className="detail-item">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{networkInfo.type || 'Unknown'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Effective Type:</span>
          <span className="detail-value">{networkInfo.effectiveType || 'Unknown'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Downlink:</span>
          <span className="detail-value">{networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Unknown'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Latency:</span>
          <span className="detail-value">{networkInfo.rtt ? `${networkInfo.rtt} ms` : 'Unknown'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Data Saver:</span>
          <span className="detail-value">{networkInfo.saveData ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      
      {connectionHistory.length > 1 && (
        <div className="network-history">
          <h4>Connection History:</h4>
          <div className="history-items">
            {connectionHistory.map((conn, index) => (
              <div key={index} className="history-item">
                <span className="history-type">{conn.effectiveType}</span>
                <span className="history-speed">{conn.downlink} Mbps</span>
                <span className="history-latency">{conn.rtt} ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="api-tag">
        Using <strong>Network Information API</strong> for real-time connection data
      </div>
    </div>
  );
}