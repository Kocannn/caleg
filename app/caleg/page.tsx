import { prisma } from "@/lib/prisma";
import CalegDashboardClient from "./CalegDashboardClient";

export default async function CalegDashboardPage() {
  const totalPendukung = await prisma.pendukung.count();
  const totalRelawan = await prisma.relawan.count();
  const totalKoordinator = await prisma.koordinator.count();
  const totalWilayah = await prisma.wilayah.count();

  // Status breakdown
  const statusCounts = await prisma.pendukung.groupBy({
    by: ["statusDukungan"],
    _count: { id: true },
  });

  // Per-wilayah stats
  const wilayahStats = await prisma.wilayah.findMany({
    include: { _count: { select: { pendukungs: true, relawans: true, koordinators: true } } },
    orderBy: { namaWilayah: "asc" },
  });

  // Monthly trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentPendukung = await prisma.pendukung.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  // Group by month
  const monthlyData: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }
  recentPendukung.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyData) monthlyData[key]++;
  });

  const monthlyTrend = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count,
  }));

  // Approval stats
  const approvalCounts = await prisma.pendukung.groupBy({
    by: ["statusApproval"],
    _count: { id: true },
  });

  return (
    <CalegDashboardClient
      stats={{
        totalPendukung,
        totalRelawan,
        totalKoordinator,
        totalWilayah,
      }}
      statusCounts={statusCounts.map((s) => ({
        status: s.statusDukungan,
        count: s._count.id,
      }))}
      wilayahStats={wilayahStats.map((w) => ({
        nama: w.namaWilayah,
        pendukung: w._count.pendukungs,
        relawan: w._count.relawans,
        koordinator: w._count.koordinators,
      }))}
      monthlyTrend={monthlyTrend}
      approvalCounts={approvalCounts.map((a) => ({
        status: a.statusApproval,
        count: a._count.id,
      }))}
    />
  );
}
