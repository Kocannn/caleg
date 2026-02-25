"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });
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
  fotoRumah: string | null;
  createdAt: string;
}

export default function PendukungInput({ relawanId, wilayahId, initialData }: { relawanId: string; wilayahId: string; initialData: PendukungItem[] }) {
  const [data, setData] = useState(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [nikSearch, setNikSearch] = useState("");
  const [nikResult, setNikResult] = useState<string | null>(null);
  const [showPhoto, setShowPhoto] = useState<PendukungItem | null>(null);
  const [showMap, setShowMap] = useState<PendukungItem | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    namaLengkap: "",
    nik: "",
    noHp: "",
    alamat: "",
    rt: "",
    rw: "",
    latitude: 0,
    longitude: 0,
    statusDukungan: "BELUM_DIKONFIRMASI",
  });

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  // NIK Search
  async function searchNik() {
    if (!nikSearch || nikSearch.length !== 16) {
      setNikResult("NIK harus 16 digit");
      return;
    }
    const res = await fetch(`/api/relawan/pendukung/search-nik?nik=${nikSearch}`);
    const result = await res.json();
    if (result.exists) {
      setNikResult(`NIK sudah terdaftar atas nama: ${result.nama}`);
    } else {
      setNikResult("NIK belum terdaftar - bisa diinput");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate NIK
    if (!/^\d{16}$/.test(form.nik)) {
      alert("NIK harus 16 digit angka");
      return;
    }

    const url = editId ? `/api/relawan/pendukung/${editId}` : "/api/relawan/pendukung";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, relawanId, wilayahId }),
    });

    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm({ namaLengkap: "", nik: "", noHp: "", alamat: "", rt: "", rw: "", latitude: 0, longitude: 0, statusDukungan: "BELUM_DIKONFIRMASI" });
      router.refresh();
      const updated = await fetch("/api/relawan/pendukung").then((r) => r.json());
      setData(updated);
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan data");
    }
  }

  function openEdit(item: PendukungItem) {
    setEditId(item.id);
    setForm({
      namaLengkap: item.namaLengkap,
      nik: item.nik,
      noHp: item.noHp || "",
      alamat: item.alamat,
      rt: "",
      rw: "",
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      statusDukungan: item.statusDukungan,
    });
    setShowForm(true);
  }

  const filtered = data.filter((p) =>
    !search || p.namaLengkap.toLowerCase().includes(search.toLowerCase()) || p.nik.includes(search)
  );

  const statusColors: Record<string, string> = {
    MENDUKUNG: "bg-green-100 text-green-700",
    RAGU: "bg-yellow-100 text-yellow-700",
    TIDAK_MENDUKUNG: "bg-red-100 text-red-700",
    BELUM_DIKONFIRMASI: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Pendukung</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ namaLengkap: "", nik: "", noHp: "", alamat: "", rt: "", rw: "", latitude: 0, longitude: 0, statusDukungan: "BELUM_DIKONFIRMASI" }); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + Tambah Pendukung
        </button>
      </div>

      {/* NIK Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-semibold mb-2">Cari NIK (Validasi Duplikat)</h3>
        <div className="flex gap-2">
          <input type="text" placeholder="Masukkan 16 digit NIK..." value={nikSearch} onChange={(e) => setNikSearch(e.target.value.replace(/\D/g, "").slice(0, 16))} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <button onClick={searchNik} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900">Cek NIK</button>
        </div>
        {nikResult && <p className="text-sm mt-2 text-gray-600">{nikResult}</p>}
      </div>

      {/* Search */}
      <input type="text" placeholder="Cari nama atau NIK..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg text-sm mb-4 w-full max-w-xs" />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">NIK</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">No HP</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Bukti Foto</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p, idx) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{p.namaLengkap}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.nik}</td>
                <td className="px-4 py-3 text-gray-600">{p.noHp || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.statusDukungan]}`}>{p.statusDukungan.replace(/_/g, " ")}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {p.fotoRumah ? (
                    <button
                      onClick={() => setShowPhoto(p)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 inline-flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Lihat Foto
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Belum ada</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {p.latitude && p.longitude ? (
                      <button
                        onClick={() => setShowMap(p)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 inline-flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Lihat Lokasi
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Tidak ada</span>
                    )}
                    <button onClick={() => openEdit(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Photo Modal */}
      {showPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPhoto(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Bukti Foto - {showPhoto.namaLengkap}</h2>
              <button onClick={() => setShowPhoto(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">
              {showPhoto.fotoRumah ? (
                <img
                  src={showPhoto.fotoRumah}
                  alt={`Foto rumah ${showPhoto.namaLengkap}`}
                  className="w-full rounded-lg object-contain max-h-[60vh]"
                />
              ) : (
                <p className="text-center text-gray-400 py-8">Foto belum tersedia</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Location Modal */}
      {showMap && showMap.latitude && showMap.longitude && (
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
              <MapViewer
                latitude={showMap.latitude}
                longitude={showMap.longitude}
                label={showMap.namaLengkap}
              />
            </div>
          </div>
        </div>
      )}

      {/* Input Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">{editId ? "Edit Pendukung" : "Tambah Pendukung Baru"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <input type="text" value={form.namaLengkap} onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 digit) *</label>
                  <input type="text" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" required maxLength={16} disabled={!!editId} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                  <input type="text" value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Dukungan</label>
                  <select value={form.statusDukungan} onChange={(e) => setForm({ ...form, statusDukungan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="BELUM_DIKONFIRMASI">Belum Dikonfirmasi</option>
                    <option value="MENDUKUNG">Mendukung</option>
                    <option value="RAGU">Ragu-ragu</option>
                    <option value="TIDAK_MENDUKUNG">Tidak Mendukung</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                <textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RT</label>
                  <input type="text" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RW</label>
                  <input type="text" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              {/* Map Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titik Lokasi Rumah</label>
                <MapPicker latitude={form.latitude || undefined} longitude={form.longitude || undefined} onLocationChange={handleLocationChange} />
                {form.latitude !== 0 && (
                  <p className="text-xs text-gray-500 mt-1">Lat: {form.latitude.toFixed(6)}, Lng: {form.longitude.toFixed(6)}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  {editId ? "Update" : "Simpan"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
