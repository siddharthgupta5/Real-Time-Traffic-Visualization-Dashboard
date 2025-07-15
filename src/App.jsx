import { useState, useEffect } from 'react';
import TrafficMap from './components/TrafficMap';
import NetworkStatus from './components/NetworkStatus';
import TrafficVisualizer from './components/TrafficVisualizer';
import LoadingIndicator from './components/LoadingIndicator';
import './styles.css';

function App() {
  const [position, setPosition] = useState([12.9716, 77.5946]); // Default to Bangalore
  const [trafficData, setTrafficData] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Network Information API
    const updateNetworkInfo = () => {
      if (navigator.connection) {
        setNetworkInfo({
          type: navigator.connection.type,
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData,
          lastUpdated: new Date().toLocaleTimeString()
        });
      }
    };

    if (navigator.connection) {
      updateNetworkInfo();
      navigator.connection.addEventListener('change', updateNetworkInfo);
    }

    // Background Tasks API - Process data when idle
    const processData = () => {
      const mockData = generateMockTrafficData();
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        window.requestIdleCallback(
          () => {
            setTrafficData(mockData);
            setLoading(false);
          },
          { timeout: 2000 }
        );
      } else {
        setTimeout(() => {
          setTrafficData(mockData);
          setLoading(false);
        }, 500);
      }
    };

    processData();

    return () => {
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  const generateMockTrafficData = () => {
    const roads = [];
    const roadNames = [
      "MG Road", "Brigade Road", "Residency Road", "Church Street", 
      "Commercial Street", "Hosur Road", "Old Airport Road", 
      "Outer Ring Road", "Bannerghatta Road", "Kanakapura Road"
    ];
    
    for (let i = 0; i < 15; i++) {
      roads.push({
        id: `road-${i}`,
        name: roadNames[i % roadNames.length] || `Road ${i + 1}`,
        startX: Math.random() * 700 + 50,
        startY: Math.random() * 300 + 50,
        endX: Math.random() * 700 + 50,
        endY: Math.random() * 300 + 50,
        speed: Math.random() * 50,
        congestion: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        vehicles: Math.floor(Math.random() * 50) + 5
      });
    }
    return roads;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Real-Time Traffic Visualization Dashboard</h1>
        <p className="api-subtitle">
          Using Geolocation, Network Information, Canvas, Intersection Observer, and Background Tasks APIs
        </p>
      </header>
      
      {error ? (
        <div className="error">{error}</div>
      ) : loading ? (
        <LoadingIndicator />
      ) : (
        <main>
          <section className="dashboard-section">
            <h2>Your Location</h2>
            <TrafficMap position={position} setPosition={setPosition} setError={setError} />
          </section>
          
          <div className="dashboard-columns">
            <section className="dashboard-section">
              <h2>Network Status</h2>
              <NetworkStatus networkInfo={networkInfo} />
            </section>
            
            <section className="dashboard-section">
              <h2>Traffic Conditions</h2>
              <TrafficVisualizer trafficData={trafficData} position={position} />
            </section>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;