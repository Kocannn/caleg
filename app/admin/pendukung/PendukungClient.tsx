"use client";

import { useState } from "react";

interface PendukungItem {
  id: string;
  namaLengkap: string;
  nik: string;
  noHp: string | null;
  alamat: string;
  statusDukungan: string;
  statusApproval: string;
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

const approvalColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function PendukungClient({ initialData, wilayahList }: { initialData: PendukungItem[]; wilayahList: Wilayah[] }) {
  const [data, setData] = useState(initialData);
  const [filterWilayah, setFilterWilayah] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [search, setSearch] = useState("");

  const filtered = data.filter((p) => {
    const matchWilayah = !filterWilayah || p.wilayah.kecamatan === filterWilayah;
    const matchStatus = !filterStatus || p.statusDukungan === filterStatus;
    const matchApproval = !filterApproval || p.statusApproval === filterApproval;
    const matchSearch = !search || p.namaLengkap.toLowerCase().includes(search.toLowerCase()) || p.nik.includes(search);
    return matchWilayah && matchStatus && matchApproval && matchSearch;
  });

  async function handleApproval(id: string, status: string) {
    const res = await fetch(`/api/admin/pendukung/${id}/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusApproval: status }),
    });
    if (res.ok) {
      setData((prev) => prev.map((p) => (p.id === id ? { ...p, statusApproval: status } : p)));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Data Pendukung</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Cari nama / NIK..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
        <select value={filterWilayah} onChange={(e) => setFilterWilayah(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Semua Wilayah</option>
          {[...new Set(wilayahList.map((w) => w.kecamatan))].map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Semua Status</option>
          <option value="MENDUKUNG">Mendukung</option>
          <option value="RAGU">Ragu</option>
          <option value="TIDAK_MENDUKUNG">Tidak Mendukung</option>
          <option value="BELUM_DIKONFIRMASI">Belum Dikonfirmasi</option>
        </select>
        <select value={filterApproval} onChange={(e) => setFilterApproval(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Semua Approval</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

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
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Approval</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p, idx) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{p.namaLengkap}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.nik}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{p.wilayah.kecamatan}, {p.wilayah.kelurahan}</td>
                <td className="px-4 py-3 text-gray-600">{p.relawan.namaLengkap}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.statusDukungan]}`}>
                    {p.statusDukungan.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${approvalColors[p.statusApproval]}`}>
                    {p.statusApproval}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {p.statusApproval === "PENDING" && (
                      <>
                        <button onClick={() => handleApproval(p.id, "APPROVED")} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                          Approve
                        </button>
                        <button onClick={() => handleApproval(p.id, "REJECTED")} className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-4">Total: {filtered.length} data</p>
    </div>
  );
}
