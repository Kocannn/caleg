"use client";

import { useEffect, useRef, useState } from "react";

interface MapViewerProps {
  latitude: number;
  longitude: number;
  label?: string;
}

export default function MapViewer({ latitude, longitude, label }: MapViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || loaded) return;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center: [latitude, longitude],
        zoom: 16,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      })
        .addTo(map)
        .bindPopup(label || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`)
        .openPopup();

      mapInstanceRef.current = map;
      setLoaded(true);

      // Fix map rendering inside modal
      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div ref={mapRef} className="w-full h-80 rounded-lg border border-gray-300" />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
      </p>
    </div>
  );
}
