"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

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

interface PetaSebaranMapProps {
  filtered: MarkerData[];
  center: [number, number];
}

export default function PetaSebaranMap({ filtered, center }: PetaSebaranMapProps) {
  return (
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
              <div className="text-gray-500">{m.alamat || "-"}, {m.wilayah?.kelurahan || ""}</div>
              <div className="text-gray-500">Wilayah: {m.wilayah?.namaWilayah || "-"}</div>
              <div className="mt-1">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: STATUS_COLOR[m.statusDukungan] + "20",
                    color: STATUS_COLOR[m.statusDukungan],
                  }}
                >
                  {STATUS_LABEL[m.statusDukungan] || m.statusDukungan}
                </span>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
