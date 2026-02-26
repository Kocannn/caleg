"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WilayahItem {
  id: string;
  namaWilayah: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string | null;
  _count: { koordinators: number; relawans: number; pendukung: number };
}

export default function WilayahClient({ initialWilayah }: { initialWilayah: WilayahItem[] }) {
  const [data, setData] = useState(initialWilayah);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ namaWilayah: "", provinsi: "", kabupaten: "", kecamatan: "", kelurahan: "", kodePos: "" });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/wilayah", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ namaWilayah: "", provinsi: "", kabupaten: "", kecamatan: "", kelurahan: "", kodePos: "" });
      router.refresh();
      const updated = await fetch("/api/admin/wilayah").then((r) => r.json());
      setData(updated);
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menambah wilayah");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus wilayah ini?")) return;
    await fetch(`/api/admin/wilayah/${id}`, { method: "DELETE" });
    setData((prev) => prev.filter((w) => w.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Wilayah</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + Tambah Wilayah
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Provinsi</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Kabupaten/Kota</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Kecamatan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Kelurahan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Kode Pos</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Koordinator</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Relawan</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Pendukung</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((w, idx) => (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3">{w.provinsi}</td>
                <td className="px-4 py-3">{w.kabupaten}</td>
                <td className="px-4 py-3">{w.kecamatan}</td>
                <td className="px-4 py-3">{w.kelurahan}</td>
                <td className="px-4 py-3">{w.kodePos || "-"}</td>
                <td className="px-4 py-3 text-center">{w._count.koordinators}</td>
                <td className="px-4 py-3 text-center">{w._count.relawans}</td>
                <td className="px-4 py-3 text-center">{w._count.pendukung}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:text-red-800 p-1" title="Hapus">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b"><h2 className="text-lg font-bold">Tambah Wilayah</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Wilayah</label>
                <input type="text" value={form.namaWilayah} onChange={(e) => setForm({ ...form, namaWilayah: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Contoh: Surabaya - Gubeng" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                <input type="text" value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
                <input type="text" value={form.kabupaten} onChange={(e) => setForm({ ...form, kabupaten: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                  <input type="text" value={form.kecamatan} onChange={(e) => setForm({ ...form, kecamatan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelurahan</label>
                  <input type="text" value={form.kelurahan} onChange={(e) => setForm({ ...form, kelurahan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                <input type="text" value={form.kodePos} onChange={(e) => setForm({ ...form, kodePos: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
