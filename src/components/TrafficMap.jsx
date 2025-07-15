import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function TrafficMap({ position, setPosition, setError }) {
  const [mapInitialized, setMapInitialized] = useState(false);
  const [accuracy, setAccuracy] = useState(null);

  // Geolocation API implementation
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using default location.');
      setMapInitialized(true);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPosition([latitude, longitude]);
        setAccuracy(accuracy);
        setMapInitialized(true);
      },
      (err) => {
        setError(`Geolocation error: ${err.message}. Using default location.`);
        setMapInitialized(true);
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [setPosition, setError]);

  if (!mapInitialized) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Initializing map...</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            <div className="map-popup">
              <strong>Your Location</strong>
              <p>Latitude: {position[0].toFixed(6)}</p>
              <p>Longitude: {position[1].toFixed(6)}</p>
              {accuracy && <p>Accuracy: {Math.round(accuracy)} meters</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}