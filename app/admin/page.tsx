import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";

export default async function AdminDashboard() {
  const [userCount, pendukungCount, relawanCount, koordinatorCount, wilayahCount] = await Promise.all([
    prisma.user.count(),
    prisma.pendukung.count(),
    prisma.relawan.count(),
    prisma.koordinator.count(),
    prisma.wilayah.count(),
  ]);

  const pendingApproval = await prisma.pendukung.count({
    where: { statusApproval: "PENDING" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total User"
          value={userCount}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Pendukung"
          value={pendukungCount}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Relawan"
          value={relawanCount}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatCard
          title="Total Koordinator"
          value={koordinatorCount}
          color="indigo"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="Total Wilayah"
          value={wilayahCount}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            </svg>
          }
        />
        <StatCard
          title="Menunggu Approval"
          value={pendingApproval}
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Terbaru</h2>
        <RecentUsers />
      </div>
    </div>
  );
}

async function RecentUsers() {
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      namaLengkap: true,
      role: true,
      aktif: true,
      createdAt: true,
    },
  });

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    CALEG: "bg-blue-100 text-blue-700",
    KOORDINATOR: "bg-purple-100 text-purple-700",
    RELAWAN: "bg-green-100 text-green-700",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-3 text-left font-semibold text-gray-600">Nama</th>
            <th className="pb-3 text-left font-semibold text-gray-600">Username</th>
            <th className="pb-3 text-left font-semibold text-gray-600">Role</th>
            <th className="pb-3 text-left font-semibold text-gray-600">Status</th>
            <th className="pb-3 text-left font-semibold text-gray-600">Tanggal Dibuat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="py-3 font-medium">{user.namaLengkap}</td>
              <td className="py-3 text-gray-600">{user.username}</td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {user.aktif ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="py-3 text-gray-600">
                {new Date(user.createdAt).toLocaleDateString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
