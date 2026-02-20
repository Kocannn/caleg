import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import MonitoringClient from "./MonitoringClient";

export default async function KoordinatorMonitoringPage() {
  const session = await auth();
  const koordinator = await prisma.koordinator.findUnique({ where: { userId: session!.user.id } });
  if (!koordinator) return <div className="text-center py-20 text-gray-500">Data koordinator belum terdaftar.</div>;

  const relawans = await prisma.relawan.findMany({
    where: { koordinatorId: koordinator.id },
    include: {
      user: true,
      wilayah: true,
      _count: { select: { pendukungs: true, distribusiSembakos: true } },
      pendukungs: {
        select: { statusDukungan: true, statusApproval: true, createdAt: true },
      },
    },
    orderBy: { user: { namaLengkap: "asc" } },
  });

  // Calculate stats per relawan
  const monitoringData = relawans.map((r) => {
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const pendukungBulanIni = r.pendukungs.filter((p) => new Date(p.createdAt) >= thisMonth).length;
    const approved = r.pendukungs.filter((p) => p.statusApproval === "APPROVED").length;
    const pending = r.pendukungs.filter((p) => p.statusApproval === "PENDING").length;
    const pendukungAktif = r.pendukungs.filter((p) => p.statusDukungan === "PENDUKUNG").length;

    return {
      id: r.id,
      nama: r.user.namaLengkap,
      username: r.user.username,
      wilayah: r.wilayah?.namaWilayah || "-",
      totalPendukung: r._count.pendukungs,
      pendukungBulanIni,
      approved,
      pending,
      pendukungAktif,
      distribusi: r._count.distribusiSembakos,
      aktif: r.user.aktif,
    };
  });

  return <MonitoringClient data={JSON.parse(JSON.stringify(monitoringData))} />;
}
