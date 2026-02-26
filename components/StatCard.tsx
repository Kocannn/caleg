"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color: "blue" | "green" | "yellow" | "red" | "purple" | "indigo";
  change?: string;
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  green: "bg-green-50 text-green-600 border-green-200",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
  red: "bg-red-50 text-red-600 border-red-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
};

const iconBgMap = {
  blue: "bg-blue-100",
  green: "bg-green-100",
  yellow: "bg-yellow-100",
  red: "bg-red-100",
  purple: "bg-purple-100",
  indigo: "bg-indigo-100",
};

export default function StatCard({ title, value, icon, color, change }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {change && <p className="text-xs mt-1 opacity-70">{change}</p>}
        </div>
        {icon && <div className={`p-3 rounded-xl ${iconBgMap[color]}`}>{icon}</div>}
      </div>
    </div>
  );
}
