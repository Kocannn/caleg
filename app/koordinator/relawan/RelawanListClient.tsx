"use client";

import { useState } from "react";

interface RelawanData {
  id: string;
  user: { namaLengkap: string; username: string; email: string | null; nomorHp: string | null; aktif: boolean };
  wilayah: { namaWilayah: string } | null;
  _count: { pendukung: number; distribusi: number };
}

export default function RelawanListClient({ relawans }: { relawans: RelawanData[] }) {
  const [search, setSearch] = useState("");

  const filtered = relawans.filter(
    (r) =>
      r.user.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      r.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Relawan</h1>
        <span className="text-sm text-gray-500">{relawans.length} relawan</span>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari relawan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded-lg text-sm"
        />
      </div>

      <div className="grid gap-4">
        {filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{r.user.namaLengkap}</h3>
              <p className="text-sm text-gray-500">@{r.user.username} {r.user.nomorHp ? `• ${r.user.nomorHp}` : ""}</p>
              <p className="text-sm text-gray-500">Wilayah: {r.wilayah?.namaWilayah || "-"}</p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">{r._count.pendukung}</div>
                <div className="text-xs text-gray-500">Pendukung</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{r._count.distribusi}</div>
                <div className="text-xs text-gray-500">Distribusi</div>
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.user.aktif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {r.user.aktif ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10">Tidak ada relawan ditemukan</p>
        )}
      </div>
    </div>
  );
}
