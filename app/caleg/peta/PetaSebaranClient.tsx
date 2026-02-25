"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const PetaSebaranMap = dynamic(() => import("@/components/PetaSebaranMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">Memuat peta...</div>
  ),
});

interface MarkerData {
  id: string;
  namaLengkap: string;
  latitude: number | null;
  longitude: number | null;
  statusDukungan: string;
  alamat: string | null;
  wilayah: { namaWilayah: string; kelurahan: string } | null;
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
        <PetaSebaranMap filtered={filtered} center={center} />
      </div>
    </div>
  );
}
