import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST: input/update hasil per TPS (batch upsert)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tpsId, hasil } = body;
  // hasil: [{ calonId: string, jumlahSuara: number, fotoBukti?: string }]

  if (!tpsId || !hasil || !Array.isArray(hasil)) {
    return NextResponse.json({ error: "TPS ID dan data hasil wajib diisi" }, { status: 400 });
  }

  const results = [];
  for (const h of hasil) {
    const result = await prisma.quickCountHasil.upsert({
      where: {
        tpsId_calonId: {
          tpsId,
          calonId: h.calonId,
        },
      },
      update: {
        jumlahSuara: parseInt(h.jumlahSuara) || 0,
        fotoBukti: h.fotoBukti || null,
      },
      create: {
        tpsId,
        calonId: h.calonId,
        jumlahSuara: parseInt(h.jumlahSuara) || 0,
        fotoBukti: h.fotoBukti || null,
      },
    });
    results.push(result);
  }

  return NextResponse.json(results, { status: 201 });
}
