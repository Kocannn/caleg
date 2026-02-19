"use client";

import StatCard from "@/components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  PENDUKUNG: "#22c55e",
  BELUM_DIKONTAK: "#9ca3af",
  RAGU_RAGU: "#eab308",
  MENOLAK: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  PENDUKUNG: "Pendukung",
  BELUM_DIKONTAK: "Belum Dikontak",
  RAGU_RAGU: "Ragu-ragu",
  MENOLAK: "Menolak",
};

const APPROVAL_COLORS: Record<string, string> = {
  PENDING: "#eab308",
  APPROVED: "#22c55e",
  REJECTED: "#ef4444",
};

interface Props {
  stats: { totalPendukung: number; totalRelawan: number; totalKoordinator: number; totalWilayah: number };
  statusCounts: { status: string; count: number }[];
  wilayahStats: { nama: string; pendukung: number; relawan: number; koordinator: number }[];
  monthlyTrend: { month: string; count: number }[];
  approvalCounts: { status: string; count: number }[];
}

export default function CalegDashboardClient({ stats, statusCounts, wilayahStats, monthlyTrend, approvalCounts }: Props) {
  const pieData = statusCounts.map((s) => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] || "#6b7280",
  }));

  const approvalPieData = approvalCounts.map((a) => ({
    name: a.status,
    value: a.count,
    color: APPROVAL_COLORS[a.status] || "#6b7280",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Caleg</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Pendukung" value={stats.totalPendukung} color="blue" />
        <StatCard title="Total Relawan" value={stats.totalRelawan} color="green" />
        <StatCard title="Total Koordinator" value={stats.totalKoordinator} color="yellow" />
        <StatCard title="Total Wilayah" value={stats.totalWilayah} color="purple" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tren Pendukung (6 Bulan Terakhir)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pendukung" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Sebaran Status Dukungan</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Wilayah Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Pendukung per Wilayah</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={wilayahStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis dataKey="nama" type="category" tick={{ fontSize: 12 }} width={120} />
              <Tooltip />
              <Bar dataKey="pendukung" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Pendukung" />
              <Bar dataKey="relawan" fill="#22c55e" radius={[0, 4, 4, 0]} name="Relawan" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Approval Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Status Approval Pendukung</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={approvalPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {approvalPieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wilayah Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Ringkasan per Wilayah</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wilayah</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Koordinator</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Relawan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pendukung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wilayahStats.map((w) => (
                <tr key={w.nama} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{w.nama}</td>
                  <td className="px-6 py-4 text-right">{w.koordinator}</td>
                  <td className="px-6 py-4 text-right">{w.relawan}</td>
                  <td className="px-6 py-4 text-right font-semibold text-blue-600">{w.pendukung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
