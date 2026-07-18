import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapPanel({ businesses }) {
  const center = businesses[0]
    ? [businesses[0].coordinates?.lat || 51.5072, businesses[0].coordinates?.lng || -0.1276]
    : [51.5072, -0.1276];

  return (
    <div className="glass-panel h-[520px] rounded-[30px] p-3">
      <MapContainer center={center} zoom={4} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {businesses.map((business) => (
          <Marker
            key={business._id}
            position={[business.coordinates?.lat || 40.7128, business.coordinates?.lng || -74.006]}
          >
            <Popup>
              <div className="space-y-2 text-slate-800">
                <p className="font-semibold">{business.name}</p>
                <p className="text-sm">{business.location}</p>
                <p className="text-sm">Score: {business.opportunityScore}</p>
                <Link to={`/business/${business._id}`} className="text-sm text-blue-600 underline">
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapPanel;
