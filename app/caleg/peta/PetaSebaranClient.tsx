"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

interface MarkerData {
  id: string;
  namaLengkap: string;
  latitude: number | null;
  longitude: number | null;
  statusDukungan: string;
  alamat: string | null;
  kelurahan: string | null;
  wilayah: { namaWilayah: string } | null;
}

const STATUS_COLOR: Record<string, string> = {
  PENDUKUNG: "#22c55e",
  BELUM_DIKONTAK: "#6b7280",
  RAGU_RAGU: "#eab308",
  MENOLAK: "#ef4444",
};

const STATUS_LABEL: Record<string, string> = {
  PENDUKUNG: "Pendukung",
  BELUM_DIKONTAK: "Belum Dikontak",
  RAGU_RAGU: "Ragu-ragu",
  MENOLAK: "Menolak",
};

export default function PetaSebaranClient({ markers }: { markers: MarkerData[] }) {
  const [filterStatus, setFilterStatus] = useState<string>("");

  const filtered = useMemo(
    () => markers.filter((m) => m.latitude && m.longitude && (!filterStatus || m.statusDukungan === filterStatus)),
    [markers, filterStatus]
  );

  // Compute center from all markers
  const center = useMemo(() => {
    if (filtered.length === 0) return [-6.2088, 106.8456] as [number, number];
    const lat = filtered.reduce((s, m) => s + (m.latitude || 0), 0) / filtered.length;
    const lng = filtered.reduce((s, m) => s + (m.longitude || 0), 0) / filtered.length;
    return [lat, lng] as [number, number];
  }, [filtered]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Peta Sebaran Pendukung</h1>
        <span className="text-sm text-gray-500">{filtered.length} titik lokasi</span>
      </div>

      {/* Legend & Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button onClick={() => setFilterStatus("")} className={`px-3 py-1 rounded-full text-xs font-medium border ${!filterStatus ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
          Semua
        </button>
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <button key={key} onClick={() => setFilterStatus(key)} className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${filterStatus === key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLOR[key] }} />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 240px)" }}>
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((m) => (
            <CircleMarker
              key={m.id}
              center={[m.latitude!, m.longitude!]}
              radius={7}
              fillColor={STATUS_COLOR[m.statusDukungan] || "#6b7280"}
              color="#fff"
              weight={2}
              fillOpacity={0.85}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{m.namaLengkap}</div>
                  <div className="text-gray-500">{m.alamat || "-"}, {m.kelurahan || ""}</div>
                  <div className="text-gray-500">Wilayah: {m.wilayah?.namaWilayah || "-"}</div>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: STATUS_COLOR[m.statusDukungan] + "20", color: STATUS_COLOR[m.statusDukungan] }}>
                      {STATUS_LABEL[m.statusDukungan] || m.statusDukungan}
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
