"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
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

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
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

function ClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 17);
  }, [map, lat, lng]);
  return null;
}

export default function MapPicker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  const [marker, setMarker] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  const defaultCenter: [number, number] = [latitude || -7.2756, longitude || 112.7517];

  const handleClick = useCallback(
    (lat: number, lng: number) => {
      setMarker([lat, lng]);
      onLocationChange(lat, lng);
    },
    [onLocationChange]
  );

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMarker([lat, lng]);
        setFlyTo([lat, lng]);
        onLocationChange(lat, lng);
      },
      (err) => {
        console.error("Geolocation error:", err.code, err.message);
        const messages: Record<number, string> = {
          1: "Akses lokasi ditolak. Izinkan akses lokasi di pengaturan browser.",
          2: "Lokasi tidak tersedia. Pastikan GPS/Wi-Fi aktif.",
          3: "Permintaan lokasi timeout. Coba lagi.",
        };
        alert(messages[err.code] || "Tidak dapat mengakses lokasi.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleGetLocation}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Auto Detect Lokasi (GPS)
        </button>
        <span className="text-xs text-gray-500">atau klik pada peta</span>
      </div>
      <div className="w-full h-64 rounded-lg border border-gray-300 overflow-hidden">
        <MapContainer
          center={defaultCenter}
          zoom={15}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationChange={handleClick} />
          <InvalidateSize />
          {marker && <Marker position={marker} icon={defaultIcon} />}
          {flyTo && <FlyToLocation lat={flyTo[0]} lng={flyTo[1]} />}
        </MapContainer>
      </div>
    </div>
  );
}
