import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
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

const DEMO_CHECKPOINTS = [
  { lat: 18.5204, lng: 73.8567, label: "Farm Gate (Pune)" },
  { lat: 18.7481, lng: 73.4072, label: "Checkpoint 1 (Lonavala)" },
  { lat: 18.9894, lng: 73.1175, label: "Checkpoint 2 (Panvel)" },
  { lat: 19.0760, lng: 72.8777, label: "Final Delivery (Mumbai)" },
];

export default function MapTracker({ shipmentId = null, height = "400px" }) {
  const [checkpoints, setCheckpoints] = useState(DEMO_CHECKPOINTS);
  const [livePosition, setLivePosition] = useState(null);

  useEffect(() => {
    if (!shipmentId) return;

    // Listen for real-time order updates from Firestore Orders collection
    const orderDoc = doc(db, "orders", shipmentId);
    const unsubscribe = onSnapshot(orderDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.timeline) {
           const completedPoints = data.timeline.filter(t => t.done && t.coords);
           const points = completedPoints.map(t => ({
             lat: t.coords.lat,
             lng: t.coords.lng,
             label: t.label
           }));
           
           if (points.length > 0) {
             // Fallback routing logic to smoothly draw from point A to point B
             // For production, we'd use a routing API. Since we just have points, we draw direct lines.
             setCheckpoints(points);
             setLivePosition(points[points.length - 1]);
           }
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
      {/* Set a key based on center so the map recenters if coordinates jump magically */}
      <MapContainer key={center.join(',')} center={center} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: "#1B6B3A", weight: 4, opacity: 0.8 }}
        />

        {checkpoints.map((cp, idx) => (
          <Marker key={idx} position={[cp.lat, cp.lng]}>
            <Popup>
              <strong>{cp.label}</strong>
              <br />
              {idx === 0 ? "📦 Dispatch" : idx === checkpoints.length - 1 ? "🏁 Current Position" : `📍 Checkpoint ${idx}`}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
