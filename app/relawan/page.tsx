import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";

export default async function RelawanDashboard() {
  const session = await auth();
  const relawan = await prisma.relawan.findUnique({
    where: { userId: session!.user.id },
    include: { wilayah: true },
  });

  if (!relawan) {
    return <div className="text-center py-20 text-gray-500">Data relawan belum terdaftar. Hubungi admin.</div>;
  }

  const [totalPendukung, pendukungMendukung, pendukungRagu, distribusiCount] = await Promise.all([
    prisma.pendukung.count({ where: { relawanId: relawan.id } }),
    prisma.pendukung.count({ where: { relawanId: relawan.id, statusDukungan: "MENDUKUNG" } }),
    prisma.pendukung.count({ where: { relawanId: relawan.id, statusDukungan: "RAGU" } }),
    prisma.distribusiSembako.count({ where: { relawanId: relawan.id } }),
  ]);

  const recentPendukung = await prisma.pendukung.findMany({
    where: { relawanId: relawan.id },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Relawan</h1>
      <p className="text-gray-500 mb-6">Wilayah: {relawan.wilayah.kecamatan}, {relawan.wilayah.kelurahan}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Pendukung" value={totalPendukung} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <StatCard title="Mendukung" value={pendukungMendukung} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Ragu-ragu" value={pendukungRagu} color="yellow" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Distribusi Sembako" value={distribusiCount} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Pendukung Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left font-semibold text-gray-600">Nama</th>
                <th className="pb-3 text-left font-semibold text-gray-600">NIK</th>
                <th className="pb-3 text-left font-semibold text-gray-600">Status</th>
                <th className="pb-3 text-left font-semibold text-gray-600">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentPendukung.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{p.namaLengkap}</td>
                  <td className="py-3 text-gray-600 font-mono text-xs">{p.nik}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.statusDukungan === "MENDUKUNG" ? "bg-green-100 text-green-700" :
                      p.statusDukungan === "RAGU" ? "bg-yellow-100 text-yellow-700" :
                      p.statusDukungan === "TIDAK_MENDUKUNG" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{p.statusDukungan.replace(/_/g, " ")}</span>
                  </td>
                  <td className="py-3 text-gray-600">{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
