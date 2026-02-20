"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface PendukungData {
  id: string;
  namaLengkap: string;
  nik: string;
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  nomorHp: string | null;
  statusDukungan: string;
  statusApproval: string;
  createdAt: string;
  relawan: { user: { namaLengkap: string } } | null;
  wilayah: { namaWilayah: string } | null;
}

interface WilayahOption {
  id: string;
  namaWilayah: string;
}

const statusColors: Record<string, string> = {
  PENDUKUNG: "bg-green-100 text-green-800",
  BELUM_DIKONTAK: "bg-gray-100 text-gray-800",
  RAGU_RAGU: "bg-yellow-100 text-yellow-800",
  MENOLAK: "bg-red-100 text-red-800",
};

const approvalColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function PendukungListClient({ pendukung, wilayahs }: { pendukung: PendukungData[]; wilayahs: WilayahOption[] }) {
  const [search, setSearch] = useState("");
  const [filterWilayah, setFilterWilayah] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = pendukung.filter((p) => {
    const matchSearch = p.namaLengkap.toLowerCase().includes(search.toLowerCase()) || p.nik.includes(search);
    const matchWilayah = !filterWilayah || p.wilayah?.namaWilayah === filterWilayah;
    const matchStatus = !filterStatus || p.statusDukungan === filterStatus;
    return matchSearch && matchWilayah && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Pendukung</h1>
        <span className="text-sm text-gray-500">{filtered.length} dari {pendukung.length} data</span>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Cari nama / NIK..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border rounded-lg text-sm" />
        <select value={filterWilayah} onChange={(e) => setFilterWilayah(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Semua Wilayah</option>
          {wilayahs.map((w) => <option key={w.id} value={w.namaWilayah}>{w.namaWilayah}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Semua Status</option>
          <option value="PENDUKUNG">Pendukung</option>
          <option value="BELUM_DIKONTAK">Belum Dikontak</option>
          <option value="RAGU_RAGU">Ragu-ragu</option>
          <option value="MENOLAK">Menolak</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wilayah</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relawan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.namaLengkap}</td>
                  <td className="px-4 py-3 text-gray-500">{p.nik}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{[p.alamat, p.rt && `RT ${p.rt}`, p.rw && `RW ${p.rw}`, p.kelurahan, p.kecamatan].filter(Boolean).join(", ")}</td>
                  <td className="px-4 py-3 text-gray-500">{p.wilayah?.namaWilayah || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.relawan?.user?.namaLengkap || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.statusDukungan] || "bg-gray-100 text-gray-800"}`}>
                      {p.statusDukungan.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${approvalColors[p.statusApproval] || "bg-gray-100 text-gray-800"}`}>
                      {p.statusApproval}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
