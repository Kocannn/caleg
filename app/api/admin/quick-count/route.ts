import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET: Fetch all quick count data (TPS, Calon, Hasil)
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [tpsList, calonList, hasilList] = await Promise.all([
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
  ]);

  // Summary stats
  const totalTps = tpsList.length;
  const tpsSudahInput = tpsList.filter((t) => t.hasilCounts.length > 0).length;
  const totalDpt = tpsList.reduce((sum, t) => sum + t.jumlahDpt, 0);
  const totalSuaraMasuk = hasilList.reduce((sum, h) => sum + h.jumlahSuara, 0);

  // Per-calon summary
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

  return NextResponse.json({
    tpsList,
    calonList,
    hasilList,
    summary: {
      totalTps,
      tpsSudahInput,
      totalDpt,
      totalSuaraMasuk,
      perCalon,
    },
  });
}
