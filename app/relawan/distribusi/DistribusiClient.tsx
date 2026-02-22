"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DistribusiItem {
  id: string;
  jenisBantuan: string;
  tanggalDistribusi: string;
  statusPenerimaan: string;
  keterangan: string | null;
  createdAt: string;
  pendukung: { namaLengkap: string; nik: string };
}

interface PendukungOption {
  id: string;
  namaLengkap: string;
  nik: string;
}

export default function DistribusiClient({ relawanId, initialData, pendukungList }: { relawanId: string; initialData: DistribusiItem[]; pendukungList: PendukungOption[] }) {
  const [data, setData] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    pendukungId: "",
    jenisBantuan: "",
    tanggalDistribusi: new Date().toISOString().slice(0, 10),
    statusPenerimaan: "BELUM_DITERIMA",
    keterangan: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/relawan/distribusi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, relawanId }),
    });

    if (res.ok) {
      setShowModal(false);
      setForm({ pendukungId: "", jenisBantuan: "", tanggalDistribusi: new Date().toISOString().slice(0, 10), statusPenerimaan: "BELUM_DITERIMA", keterangan: "" });
      router.refresh();
      const updated = await fetch("/api/relawan/distribusi").then((r) => r.json());
      setData(updated);
    } else {
      alert("Gagal menyimpan data distribusi");
    }
  }

  const statusColors: Record<string, string> = {
    BELUM_DITERIMA: "bg-yellow-100 text-yellow-700",
    SUDAH_DITERIMA: "bg-green-100 text-green-700",
    DITOLAK: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Distribusi Sembako</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + Tambah Distribusi
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Penerima</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">NIK</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Jenis Bantuan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tanggal</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((d, idx) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{d.pendukung.namaLengkap}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{d.pendukung.nik}</td>
                <td className="px-4 py-3">{d.jenisBantuan}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(d.tanggalDistribusi).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[d.statusPenerimaan]}`}>{d.statusPenerimaan.replace(/_/g, " ")}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{d.keterangan || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b"><h2 className="text-lg font-bold">Tambah Distribusi Sembako</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penerima</label>
                <select value={form.pendukungId} onChange={(e) => setForm({ ...form, pendukungId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                  <option value="">Pilih Penerima</option>
                  {pendukungList.map((p) => (
                    <option key={p.id} value={p.id}>{p.namaLengkap} - {p.nik}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Bantuan</label>
                <input type="text" value={form.jenisBantuan} onChange={(e) => setForm({ ...form, jenisBantuan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Contoh: Beras 5kg, Minyak goreng" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Distribusi</label>
                  <input type="date" value={form.tanggalDistribusi} onChange={(e) => setForm({ ...form, tanggalDistribusi: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.statusPenerimaan} onChange={(e) => setForm({ ...form, statusPenerimaan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="BELUM_DITERIMA">Belum Diterima</option>
                    <option value="SUDAH_DITERIMA">Sudah Diterima</option>
                    <option value="DITOLAK">Ditolak</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
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
