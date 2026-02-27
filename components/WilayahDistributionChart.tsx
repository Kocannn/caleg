"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// Color palette for bars
const BAR_COLORS = [
  "#6366f1", "#a855f7", "#22c55e", "#f59e0b", "#ef4444",
  "#3b82f6", "#14b8a6", "#f97316", "#ec4899", "#8b5cf6",
  "#06b6d4", "#84cc16", "#e11d48", "#0ea5e9", "#d946ef",
];

interface ChartDataItem {
  name: string;
  jumlah: number;
}

interface WilayahDistributionChartProps {
  data: ChartDataItem[];
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
}

export default function WilayahDistributionChart({
  data,
  title,
  subtitle,
  color,
  height = 350,
}: WilayahDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Tidak ada data untuk ditampilkan
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.jumlah, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm font-medium text-gray-500">
          Total: {total.toLocaleString("id-ID")}
        </span>
      </div>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: data.length > 5 ? 60 : 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#d1d5db" }}
              angle={data.length > 5 ? -35 : 0}
              textAnchor={data.length > 5 ? "end" : "middle"}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#d1d5db" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number | undefined) => [
                (value ?? 0).toLocaleString("id-ID"),
                "Jumlah",
              ]}
            />
            <Bar dataKey="jumlah" radius={[6, 6, 0, 0]} barSize={data.length > 10 ? 30 : 60}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={color || BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Status distribution pie chart for Pendukung
interface StatusChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface StatusDistributionChartProps {
  data: StatusChartDataItem[];
  title: string;
  height?: number;
}

export function StatusDistributionChart({
  data,
  title,
  height = 300,
}: StatusDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Tidak ada data untuk ditampilkan
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm font-medium text-gray-500">
          Total: {total.toLocaleString("id-ID")}
        </span>
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
              labelLine={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number | undefined) => [
                (value ?? 0).toLocaleString("id-ID"),
                "Jumlah",
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: 8 }}
              formatter={(value: string) => (
                <span className="text-gray-700 text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Helper to compute distribution chart data from items with wilayah
export function computeWilayahChartData<
  T extends {
    wilayah: { kabupaten: string; kecamatan: string; kelurahan: string };
    tps?: string | null;
  }
>({
  items,
  filterKabupaten,
  filterKecamatan,
  filterKelurahan,
}: {
  items: T[];
  filterKabupaten: string;
  filterKecamatan: string;
  filterKelurahan: string;
}): { data: ChartDataItem[]; levelLabel: string } {
  const counts: Record<string, number> = {};

  if (!filterKabupaten) {
    // Group by kabupaten
    items.forEach((item) => {
      const key = item.wilayah.kabupaten;
      counts[key] = (counts[key] || 0) + 1;
    });
    return {
      data: Object.entries(counts)
        .map(([name, jumlah]) => ({ name, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah),
      levelLabel: "Kabupaten/Kota",
    };
  }

  if (!filterKecamatan) {
    // Group by kecamatan
    items.forEach((item) => {
      const key = item.wilayah.kecamatan;
      counts[key] = (counts[key] || 0) + 1;
    });
    return {
      data: Object.entries(counts)
        .map(([name, jumlah]) => ({ name, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah),
      levelLabel: "Kecamatan",
    };
  }

  if (!filterKelurahan) {
    // Group by kelurahan
    items.forEach((item) => {
      const key = item.wilayah.kelurahan;
      counts[key] = (counts[key] || 0) + 1;
    });
    return {
      data: Object.entries(counts)
        .map(([name, jumlah]) => ({ name, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah),
      levelLabel: "Kelurahan",
    };
  }

  // Group by TPS
  items.forEach((item) => {
    const key = item.tps || "Tanpa TPS";
    counts[key] = (counts[key] || 0) + 1;
  });
  return {
    data: Object.entries(counts)
      .map(([name, jumlah]) => ({ name, jumlah }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
    levelLabel: "TPS",
  };
}
