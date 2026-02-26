"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardChartProps {
  pendukung: number;
  relawan: number;
  koordinator: number;
}

const COLORS = {
  Pendukung: "#22c55e",
  Relawan: "#a855f7",
  Koordinator: "#6366f1",
};

export default function DashboardChart({
  pendukung,
  relawan,
  koordinator,
}: DashboardChartProps) {
  const data = [
    { name: "Pendukung", jumlah: pendukung },
    { name: "Relawan", jumlah: relawan },
    { name: "Koordinator", jumlah: koordinator },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Grafik Jumlah Pendukung, Relawan & Koordinator
      </h2>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 14 }}
              axisLine={{ stroke: "#d1d5db" }}
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
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value: string) => (
                <span className="text-gray-700 text-sm">{value}</span>
              )}
            />
            <Bar
              dataKey="jumlah"
              name="Jumlah"
              radius={[6, 6, 0, 0]}
              barSize={80}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
