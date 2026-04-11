import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import { database, ref, onValue } from "../api/firebaseConfig";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issue in bundled environments
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Demo checkpoint data matching Pune -> Mumbai route
const DEMO_CHECKPOINTS = [
  { lat: 18.5204, lng: 73.8567, label: "Farm Gate (Pune)" },
  { lat: 18.7481, lng: 73.4072, label: "Checkpoint 1 (Lonavala)" },
  { lat: 18.9894, lng: 73.1175, label: "Checkpoint 2 (Panvel)" },
  { lat: 19.0760, lng: 72.8777, label: "Final Delivery (Mumbai)" },
];

/**
 * MapTracker Component
 * Renders an OpenStreetMap with polyline route and marker pins.
 * Listens to Firebase for live coordinate updates when available.
 * 
 * @param {string} shipmentId - The tracking ID to listen for in Firebase
 * @param {boolean} showAllShipments - If true, shows all shipment pins (Admin view)
 * @param {string} height - CSS height for the map container
 */
export default function MapTracker({ shipmentId = "TRK-900A", showAllShipments = false, height = "400px" }) {
  const [checkpoints, setCheckpoints] = useState(DEMO_CHECKPOINTS);
  const [livePosition, setLivePosition] = useState(null);

  useEffect(() => {
    // Listen for real-time checkpoint logs from Firebase
    const logsRef = ref(database, `shipments/${shipmentId}/logs`);
    const unsubscribe = onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const points = Object.values(data)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .map((log) => ({
            lat: log.gps?.latitude || 0,
            lng: log.gps?.longitude || 0,
            label: log.checkpointId || "Unknown",
          }));

        if (points.length > 0) {
          setCheckpoints(points);
          setLivePosition(points[points.length - 1]);
        }
      }
    });

    return () => unsubscribe();
  }, [shipmentId]);

  const polylinePositions = checkpoints.map((cp) => [cp.lat, cp.lng]);
  const center = livePosition
    ? [livePosition.lat, livePosition.lng]
    : [checkpoints[0].lat, checkpoints[0].lng];

  return (
    <div style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden", position: "relative", zIndex: 0 }}>
      <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: "#1B6B3A", weight: 4, opacity: 0.8 }}
        />

        {/* Checkpoint Markers */}
        {checkpoints.map((cp, idx) => (
          <Marker key={idx} position={[cp.lat, cp.lng]}>
            <Popup>
              <strong>{cp.label}</strong>
              <br />
              {idx === 0 ? "📦 Dispatch" : idx === checkpoints.length - 1 ? "🏁 Delivery" : `📍 Checkpoint ${idx}`}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
