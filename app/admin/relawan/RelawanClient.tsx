"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Relawan {
  id: string;
  namaLengkap: string;
  noHp: string;
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
  const [filterWilayah, setFilterWilayah] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    wilayahId: "",
    koordinatorId: "",
  });

  const filteredRelawans = relawans.filter((r) => {
    const matchSearch =
      !search ||
      r.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      r.user.username.toLowerCase().includes(search.toLowerCase()) ||
      r.noHp.includes(search);
    const matchWilayah =
      !filterWilayah || r.wilayah.kecamatan === filterWilayah;
    return matchSearch && matchWilayah;
  });

  const uniqueWilayahs = Array.from(
    new Map(relawans.map((r) => [r.wilayah.kecamatan, r.wilayah])).values()
  );

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
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama, username, atau no HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex-1 max-w-xs"
        />
        <select
          value={filterWilayah}
          onChange={(e) => setFilterWilayah(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Wilayah</option>
          {uniqueWilayahs.map((w) => (
            <option key={w.id} value={w.kecamatan}>
              {w.kecamatan}, {w.kabupaten}
            </option>
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
    </div>
  );
}
