import { prisma } from "@/lib/prisma";
import QuickCountClient from "./QuickCountClient";

export default async function AdminQuickCountPage() {
  const [tpsList, calonList, hasilList, wilayahList] = await Promise.all([
    prisma.quickCountTps.findMany({
      orderBy: [{ wilayah: { kecamatan: "asc" } }, { nomorTps: "asc" }],
      include: {
        wilayah: true,
        hasilCounts: {
          include: { calon: true },
        },
      },
    }),
    prisma.quickCountCalon.findMany({
      orderBy: { nomorUrut: "asc" },
    }),
    prisma.quickCountHasil.findMany({
      include: { tps: { include: { wilayah: true } }, calon: true },
    }),
    prisma.wilayah.findMany({
      select: { id: true, namaWilayah: true, kecamatan: true, kelurahan: true },
      orderBy: [{ kecamatan: "asc" }, { kelurahan: "asc" }],
    }),
  ]);

  // Summary
  const totalTps = tpsList.length;
  const tpsSudahInput = tpsList.filter((t) => t.hasilCounts.length > 0).length;
  const totalDpt = tpsList.reduce((sum, t) => sum + t.jumlahDpt, 0);
  const totalSuaraMasuk = hasilList.reduce((sum, h) => sum + h.jumlahSuara, 0);

  const perCalon = calonList.map((calon) => {
    const suara = hasilList
      .filter((h) => h.calonId === calon.id)
      .reduce((sum, h) => sum + h.jumlahSuara, 0);
    return {
      ...calon,
      totalSuara: suara,
      persentase: totalSuaraMasuk > 0 ? ((suara / totalSuaraMasuk) * 100).toFixed(2) : "0.00",
    };
  });

  const summary = {
    totalTps,
    tpsSudahInput,
    totalDpt,
    totalSuaraMasuk,
    perCalon,
  };

  return (
    <QuickCountClient
      initialTps={JSON.parse(JSON.stringify(tpsList))}
      initialCalon={JSON.parse(JSON.stringify(calonList))}
      initialSummary={JSON.parse(JSON.stringify(summary))}
      wilayahList={JSON.parse(JSON.stringify(wilayahList))}
    />
  );
}
