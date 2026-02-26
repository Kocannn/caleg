"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });
const MapViewer = dynamic(() => import("@/components/MapViewer"), { ssr: false });

interface Relawan {
  id: string;
  namaLengkap: string;
  noHp: string;
  tps: string | null;
  latitude: number | null;
  longitude: number | null;
  user: {
    id: string;
    username: string;
    aktif: boolean;
    createdAt: string;
  };
  koordinator: {
    id: string;
    namaLengkap: string;
  };
  wilayah: {
    id: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    kelurahan: string;
  };
  createdAt: string;
}

interface Wilayah {
  id: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
}

interface Koordinator {
  id: string;
  namaLengkap: string;
  user: { namaLengkap: string };
}

interface RelawanClientProps {
  initialRelawans: Relawan[];
  wilayahList: Wilayah[];
  koordinatorList: Koordinator[];
}

export default function RelawanClient({
  initialRelawans,
  wilayahList,
  koordinatorList,
}: RelawanClientProps) {
  const [relawans, setRelawans] = useState(initialRelawans);
  const [showModal, setShowModal] = useState(false);
  const [editingRelawan, setEditingRelawan] = useState<Relawan | null>(null);
  const [search, setSearch] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterKelurahan, setFilterKelurahan] = useState("");
  const [filterTps, setFilterTps] = useState("");
  const [showMap, setShowMap] = useState<Relawan | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    wilayahId: "",
    koordinatorId: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Cascading filter options
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
    relawans
      .filter((r) => r.tps)
      .filter((r) => !filterKabupaten || r.wilayah.kabupaten === filterKabupaten)
      .filter((r) => !filterKecamatan || r.wilayah.kecamatan === filterKecamatan)
      .filter((r) => !filterKelurahan || r.wilayah.kelurahan === filterKelurahan)
      .map((r) => r.tps!)
  )].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const filteredRelawans = relawans.filter((r) => {
    const matchSearch =
      !search ||
      r.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      r.user.username.toLowerCase().includes(search.toLowerCase()) ||
      r.noHp.includes(search);
    const matchKabupaten = !filterKabupaten || r.wilayah.kabupaten === filterKabupaten;
    const matchKecamatan = !filterKecamatan || r.wilayah.kecamatan === filterKecamatan;
    const matchKelurahan = !filterKelurahan || r.wilayah.kelurahan === filterKelurahan;
    const matchTps = !filterTps || r.tps === filterTps;
    return matchSearch && matchKabupaten && matchKecamatan && matchKelurahan && matchTps;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.koordinatorId || !form.wilayahId) {
      alert("Koordinator dan Wilayah harus dipilih");
      return;
    }

    const url = editingRelawan
      ? `/api/admin/relawan/${editingRelawan.id}`
      : "/api/admin/relawan";
    const method = editingRelawan ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingRelawan(null);
      setForm({
        username: "",
        password: "",
        name: "",
        phone: "",
        wilayahId: "",
        koordinatorId: "",
        latitude: null,
        longitude: null,
      });
      router.refresh();
      const data = await fetch("/api/admin/relawan").then((r) => r.json());
      setRelawans(data);
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan relawan");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus relawan ini?")) return;
    const res = await fetch(`/api/admin/relawan/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      setRelawans((prev) => prev.filter((r) => r.id !== id));
    }
  }

  async function handleResetPassword(id: string) {
    const newPassword = prompt("Masukkan password baru:");
    if (!newPassword) return;
    const res = await fetch(`/api/admin/relawan/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    if (res.ok) {
      alert("Password berhasil direset");
    } else {
      alert("Gagal reset password");
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/relawan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) {
      setRelawans((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, user: { ...r.user, aktif: !isActive } } : r
        )
      );
    }
  }

  function openEdit(relawan: Relawan) {
    setEditingRelawan(relawan);
    setForm({
      username: relawan.user.username,
      password: "",
      name: relawan.namaLengkap,
      phone: relawan.noHp,
      wilayahId: relawan.wilayah.id,
      koordinatorId: relawan.koordinator.id,
      latitude: relawan.latitude,
      longitude: relawan.longitude,
    });
    setShowModal(true);
  }

  function openCreate() {
    setEditingRelawan(null);
    setForm({
      username: "",
      password: "",
      name: "",
      phone: "",
      wilayahId: "",
      koordinatorId: "",
      latitude: null,
      longitude: null,
    });
    setShowModal(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Relawan</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Tambah Relawan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama, username, atau no HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                No
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Nama
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Username
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                No HP
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Koordinator
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Wilayah
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                Lokasi
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRelawans.map((relawan, idx) => (
              <tr key={relawan.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{relawan.namaLengkap}</td>
                <td className="px-4 py-3 text-gray-600">
                  {relawan.user.username}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {relawan.noHp || "-"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {relawan.koordinator.namaLengkap}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {relawan.wilayah.kecamatan},{" "}
                  <span className="text-xs">{relawan.wilayah.kabupaten}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      handleToggleActive(relawan.user.id, relawan.user.aktif)
                    }
                    className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      relawan.user.aktif
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {relawan.user.aktif ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  {relawan.latitude && relawan.longitude ? (
                    <button
                      onClick={() => setShowMap(relawan)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 inline-flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Lihat
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Belum ada</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(relawan)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleResetPassword(relawan.user.id)}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                      title="Reset Password"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(relawan.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Hapus"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">
                {editingRelawan ? "Edit Relawan" : "Tambah Relawan Baru"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                    disabled={!!editingRelawan}
                  />
                </div>
              </div>
              {!editingRelawan && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required={!editingRelawan}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No HP
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Koordinator
                </label>
                <select
                  value={form.koordinatorId}
                  onChange={(e) =>
                    setForm({ ...form, koordinatorId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  <option value="">Pilih Koordinator</option>
                  {koordinatorList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaLengkap}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wilayah
                </label>
                <select
                  value={form.wilayahId}
                  onChange={(e) =>
                    setForm({ ...form, wilayahId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  <option value="">Pilih Wilayah</option>
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.kecamatan}, {w.kelurahan} - {w.kabupaten}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi Rumah (klik peta untuk menandai)
                </label>
                <MapPicker
                  latitude={form.latitude ?? undefined}
                  longitude={form.longitude ?? undefined}
                  onLocationChange={(lat, lng) =>
                    setForm({ ...form, latitude: lat, longitude: lng })
                  }
                />
                {form.latitude && form.longitude && (
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {form.latitude.toFixed(6)}, Lng: {form.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  {editingRelawan ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRelawan(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Location Modal */}
      {showMap && showMap.latitude && showMap.longitude && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMap(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Lokasi Rumah - {showMap.namaLengkap}</h2>
                <p className="text-xs text-gray-500">
                  {showMap.wilayah.kecamatan}, {showMap.wilayah.kelurahan} - {showMap.wilayah.kabupaten}
                </p>
              </div>
              <button onClick={() => setShowMap(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
    </div>
  );
}
