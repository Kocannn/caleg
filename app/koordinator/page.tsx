import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import { formatDate } from "@/lib/utils";

export default async function KoordinatorDashboardPage() {
  const session = await auth();
  const koordinator = await prisma.koordinator.findUnique({
    where: { userId: session!.user.id },
    include: { wilayah: true },
  });

  if (!koordinator) return <div className="text-center py-20 text-gray-500">Data koordinator belum terdaftar.</div>;

  const relawans = await prisma.relawan.findMany({
    where: { koordinatorId: koordinator.id },
    include: { user: true, _count: { select: { pendukung: true } } },
  });

  const totalRelawan = relawans.length;
  const totalPendukung = relawans.reduce((sum, r) => sum + r._count.pendukung, 0);

  const pendukungBulanIni = await prisma.pendukung.count({
    where: {
      relawan: { koordinatorId: koordinator.id },
      createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
  });

  const distribusiCount = await prisma.distribusiSembako.count({
    where: { relawan: { koordinatorId: koordinator.id } },
  });

  const recentPendukung = await prisma.pendukung.findMany({
    where: { relawan: { koordinatorId: koordinator.id } },
    include: { relawan: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Koordinator</h1>
        <p className="text-sm text-gray-500">Wilayah: {koordinator.wilayah?.namaWilayah || "-"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Relawan" value={totalRelawan} color="blue" />
        <StatCard title="Total Pendukung" value={totalPendukung} color="green" />
        <StatCard title="Pendukung Bulan Ini" value={pendukungBulanIni} color="yellow" />
        <StatCard title="Distribusi Sembako" value={distribusiCount} color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Pendukung Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relawan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentPendukung.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 font-medium">{p.namaLengkap}</td>
                  <td className="px-6 py-4 text-gray-500">{p.nik}</td>
                  <td className="px-6 py-4 text-gray-500">{p.relawan?.user?.namaLengkap || "-"}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
              {recentPendukung.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
