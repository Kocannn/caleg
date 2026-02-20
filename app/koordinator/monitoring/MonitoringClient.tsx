"use client";

import { useState } from "react";

interface MonitoringRow {
  id: string;
  nama: string;
  username: string;
  wilayah: string;
  totalPendukung: number;
  pendukungBulanIni: number;
  approved: number;
  pending: number;
  pendukungAktif: number;
  distribusi: number;
  aktif: boolean;
}

export default function MonitoringClient({ data }: { data: MonitoringRow[] }) {
  const [sortBy, setSortBy] = useState<"totalPendukung" | "pendukungBulanIni" | "distribusi">("totalPendukung");

  const sorted = [...data].sort((a, b) => b[sortBy] - a[sortBy]);

  const totalPendukung = data.reduce((s, d) => s + d.totalPendukung, 0);
  const totalBulanIni = data.reduce((s, d) => s + d.pendukungBulanIni, 0);
  const totalDistribusi = data.reduce((s, d) => s + d.distribusi, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Monitoring Kinerja Relawan</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{totalPendukung}</div>
          <div className="text-sm text-blue-600">Total Pendukung</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{totalBulanIni}</div>
          <div className="text-sm text-green-600">Pendukung Bulan Ini</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{totalDistribusi}</div>
          <div className="text-sm text-purple-600">Total Distribusi</div>
        </div>
      </div>

      {/* Sort control */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Urutkan:</span>
        {[
          { key: "totalPendukung" as const, label: "Total Pendukung" },
          { key: "pendukungBulanIni" as const, label: "Bulan Ini" },
          { key: "distribusi" as const, label: "Distribusi" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${sortBy === opt.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {sorted.map((r, idx) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-gray-100 text-gray-600" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"}`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{r.nama}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${r.aktif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {r.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{r.wilayah}</p>
              </div>
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{r.totalPendukung}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{r.pendukungBulanIni}</div>
                  <div className="text-xs text-gray-500">Bulan Ini</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-600">{r.approved}</div>
                  <div className="text-xs text-gray-500">Approved</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">{r.distribusi}</div>
                  <div className="text-xs text-gray-500">Distribusi</div>
                </div>
              </div>
            </div>
            {/* Mini progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Pendukung aktif: {r.pendukungAktif} / {r.totalPendukung}</span>
                <span>{r.totalPendukung > 0 ? Math.round((r.pendukungAktif / r.totalPendukung) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${r.totalPendukung > 0 ? (r.pendukungAktif / r.totalPendukung) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-gray-400 py-10">Belum ada relawan</p>
        )}
      </div>
    </div>
  );
}
