"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon for bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewerProps {
  latitude: number;
  longitude: number;
  label?: string;
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

export default function MapViewer({ latitude, longitude, label }: MapViewerProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div>
      <div className="w-full h-80 rounded-lg border border-gray-300 overflow-hidden">
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={defaultIcon}>
            <Popup>{label || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`}</Popup>
          </Marker>
          <InvalidateSize />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
      </p>
    </div>
  );
}
