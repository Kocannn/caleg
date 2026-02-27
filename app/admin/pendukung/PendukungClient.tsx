"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import WilayahDistributionChart, { computeWilayahChartData, StatusDistributionChart } from "@/components/WilayahDistributionChart";

const MapViewer = dynamic(() => import("@/components/MapViewer"), { ssr: false });

interface PendukungItem {
  id: string;
  namaLengkap: string;
  nik: string;
  noHp: string | null;
  alamat: string;
  statusDukungan: string;
  statusApproval: string;
  latitude: number | null;
  longitude: number | null;
  tps: string | null;
  fotoRumah: string | null;
  createdAt: string;
  relawan: { namaLengkap: string };
  wilayah: { kecamatan: string; kelurahan: string; kabupaten: string };
}

interface Wilayah {
  id: string;
  kecamatan: string;
  kelurahan: string;
  kabupaten: string;
}

const statusColors: Record<string, string> = {
  MENDUKUNG: "bg-green-100 text-green-700",
  RAGU: "bg-yellow-100 text-yellow-700",
  TIDAK_MENDUKUNG: "bg-red-100 text-red-700",
  BELUM_DIKONFIRMASI: "bg-gray-100 text-gray-700",
};

export default function PendukungClient({ initialData, wilayahList }: { initialData: PendukungItem[]; wilayahList: Wilayah[] }) {
  const [data, setData] = useState(initialData);
  const [filterKabupaten, setFilterKabupaten] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterKelurahan, setFilterKelurahan] = useState("");
  const [filterTps, setFilterTps] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showPhoto, setShowPhoto] = useState<PendukungItem | null>(null);
  const [showMap, setShowMap] = useState<PendukungItem | null>(null);

  // Cascading options
  const kabupatenOptions = [...new Set(wilayahList.map((w) => w.kabupaten))].sort();
  const kecamatanOptions = [...new Set(
    wilayahList
      .filter((w) => !filterKabupaten || w.kabupaten === filterKabupaten)
      .map((w) => w.kecamatan)
  )].sort();
  const kelurahanOptions = [...new Set(
    wilayahList
      .filter((w) => !filterKabupaten || w.kabupaten === filterKabupaten)
      .filter((w) => !filterKecamatan || w.kecamatan === filterKecamatan)
      .map((w) => w.kelurahan)
  )].sort();
  const tpsOptions = [...new Set(
    data
      .filter((p) => p.tps)
      .filter((p) => !filterKabupaten || p.wilayah.kabupaten === filterKabupaten)
      .filter((p) => !filterKecamatan || p.wilayah.kecamatan === filterKecamatan)
      .filter((p) => !filterKelurahan || p.wilayah.kelurahan === filterKelurahan)
      .map((p) => p.tps!)
  )].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const filtered = data.filter((p) => {
    const matchKabupaten = !filterKabupaten || p.wilayah.kabupaten === filterKabupaten;
    const matchKecamatan = !filterKecamatan || p.wilayah.kecamatan === filterKecamatan;
    const matchKelurahan = !filterKelurahan || p.wilayah.kelurahan === filterKelurahan;
    const matchTps = !filterTps || p.tps === filterTps;
    const matchStatus = !filterStatus || p.statusDukungan === filterStatus;
    const matchSearch = !search || p.namaLengkap.toLowerCase().includes(search.toLowerCase()) || p.nik.includes(search);
    return matchKabupaten && matchKecamatan && matchKelurahan && matchTps && matchStatus && matchSearch;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Data Pendukung</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Cari nama / NIK..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
        <select
          value={filterKabupaten}
          onChange={(e) => {
            setFilterKabupaten(e.target.value);
            setFilterKecamatan("");
            setFilterKelurahan("");
            setFilterTps("");
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Kabupaten/Kota</option>
          {kabupatenOptions.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select
          value={filterKecamatan}
          onChange={(e) => {
            setFilterKecamatan(e.target.value);
            setFilterKelurahan("");
            setFilterTps("");
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Kecamatan</option>
          {kecamatanOptions.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select
          value={filterKelurahan}
          onChange={(e) => {
            setFilterKelurahan(e.target.value);
            setFilterTps("");
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Kelurahan</option>
          {kelurahanOptions.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select
          value={filterTps}
          onChange={(e) => setFilterTps(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua TPS</option>
          {tpsOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Semua Status</option>
          <option value="MENDUKUNG">Mendukung</option>
          <option value="RAGU">Ragu</option>
          <option value="TIDAK_MENDUKUNG">Tidak Mendukung</option>
          <option value="BELUM_DIKONFIRMASI">Belum Dikonfirmasi</option>
        </select>
      </div>

      {/* Charts */}
      <PendukungCharts filtered={filtered} filterKabupaten={filterKabupaten} filterKecamatan={filterKecamatan} filterKelurahan={filterKelurahan} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">NIK</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Wilayah</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Relawan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Foto Bukti</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Lokasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p, idx) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{p.namaLengkap}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.nik}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {p.wilayah.kabupaten}, {p.wilayah.kecamatan}, {p.wilayah.kelurahan}
                  {p.tps && <span className="block text-gray-400">TPS: {p.tps}</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.relawan.namaLengkap}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.statusDukungan]}`}>
                    {p.statusDukungan.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {p.fotoRumah ? (
                    <button onClick={() => setShowPhoto(p)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Lihat Foto
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Belum ada</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {p.latitude && p.longitude ? (
                    <button onClick={() => setShowMap(p)} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Lihat Lokasi
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Belum ada</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-4">Total: {filtered.length} data</p>

      {/* Photo Modal */}
      {showPhoto && showPhoto.fotoRumah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPhoto(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Foto Bukti - {showPhoto.namaLengkap}</h2>
                <p className="text-xs text-gray-500">{showPhoto.alamat}</p>
              </div>
              <button onClick={() => setShowPhoto(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">
              <img src={showPhoto.fotoRumah} alt={`Foto ${showPhoto.namaLengkap}`} className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Map Location Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMap(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Lokasi - {showMap.namaLengkap}</h2>
                <p className="text-xs text-gray-500">{showMap.alamat}</p>
              </div>
              <button onClick={() => setShowMap(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">
              {showMap.latitude && showMap.longitude ? (
                <MapViewer
                  latitude={showMap.latitude}
                  longitude={showMap.longitude}
                  label={showMap.namaLengkap}
                />
              ) : (
                <div className="w-full h-80 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400">
                  Koordinat lokasi belum tersedia
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  MENDUKUNG: "#22c55e",
  RAGU: "#f59e0b",
  TIDAK_MENDUKUNG: "#ef4444",
  BELUM_DIKONFIRMASI: "#9ca3af",
};

const STATUS_LABELS: Record<string, string> = {
  MENDUKUNG: "Mendukung",
  RAGU: "Ragu",
  TIDAK_MENDUKUNG: "Tidak Mendukung",
  BELUM_DIKONFIRMASI: "Belum Dikonfirmasi",
};

// Chart sub-component for Pendukung
function PendukungCharts({
  filtered,
  filterKabupaten,
  filterKecamatan,
  filterKelurahan,
}: {
  filtered: PendukungItem[];
  filterKabupaten: string;
  filterKecamatan: string;
  filterKelurahan: string;
}) {
  const { data, levelLabel } = useMemo(
    () =>
      computeWilayahChartData({
        items: filtered,
        filterKabupaten,
        filterKecamatan,
        filterKelurahan,
      }),
    [filtered, filterKabupaten, filterKecamatan, filterKelurahan]
  );

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((p) => {
      counts[p.statusDukungan] = (counts[p.statusDukungan] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || "#6b7280",
    }));
  }, [filtered]);

  const filterInfo = [
    filterKabupaten,
    filterKecamatan,
    filterKelurahan,
  ].filter(Boolean).join(" > ") || "Semua Wilayah";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <WilayahDistributionChart
        data={data}
        title={`Distribusi Pendukung per ${levelLabel}`}
        subtitle={`Filter: ${filterInfo}`}
        color="#22c55e"
      />
      <StatusDistributionChart
        data={statusData}
        title="Distribusi Status Dukungan"
      />
    </div>
  );
}
