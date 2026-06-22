import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from 'leaflet';

// Fix default icons context issue in Leaflet + Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

class MapErrorBoundary extends React.Component<any, any> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[300px] border border-red-500/50 bg-red-900/10 rounded-xl overflow-auto p-4 text-xs font-mono text-red-400">
          <strong>Map Crash Intercepted:</strong><br/>
          {String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}

export interface Waypoint {
  id: string;
  name: string;
  type: 'donor' | 'ngo';
  position: LatLngTuple;
  distanceFromPrev?: number;
}

interface MapRouteTrackerProps {
  waypoints: Waypoint[];
}

function BoundsFitter({ waypoints }: { waypoints: Waypoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints.map(w => w.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, waypoints]);
  return null;
}

export function MapRouteTracker({ waypoints }: MapRouteTrackerProps) {
  const positions = waypoints.map(w => w.position);

  return (
    <MapErrorBoundary>
      <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-800/50 relative z-0">
        <MapContainer 
          key={`map-container-stable-${waypoints.length}`}
          center={waypoints.length > 0 ? waypoints[0].position : [20.5937, 78.9629]} 
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {waypoints.map((wp) => (
          <Marker key={wp.id} position={wp.position} icon={wp.type === 'donor' ? donorIcon : ngoIcon}>
            <Popup className="rounded-xl">
              <div className="font-semibold text-gray-900">{wp.name}</div>
              <div className="text-xs text-gray-600 capitalize">{wp.type}</div>
              {wp.distanceFromPrev !== undefined && (
                <div className="text-xs text-blue-600 mt-1">
                  +{wp.distanceFromPrev.toFixed(1)} km from prev
                </div>
              )}
            </Popup>
          </Marker>
        ))}

        {positions.length > 1 && (
          <Polyline positions={positions} color="#3b82f6" weight={3} dashArray="5, 10" className="animate-pulse" />
        )}
        
        <BoundsFitter waypoints={waypoints} />
      </MapContainer>
    </div>
    </MapErrorBoundary>
  );
}
