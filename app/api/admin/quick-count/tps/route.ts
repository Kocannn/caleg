import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET: fetch all TPS
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tpsList = await prisma.quickCountTps.findMany({
    orderBy: [{ wilayah: { kecamatan: "asc" } }, { nomorTps: "asc" }],
    include: {
      wilayah: true,
      hasilCounts: { include: { calon: true } },
    },
  });

  return NextResponse.json(tpsList);
}

// POST: create TPS
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nomorTps, wilayahId, alamat, jumlahDpt } = body;

  if (!nomorTps || !wilayahId) {
    return NextResponse.json({ error: "Nomor TPS dan wilayah wajib diisi" }, { status: 400 });
  }

  try {
    const tps = await prisma.quickCountTps.create({
      data: {
        nomorTps,
        wilayahId,
        alamat: alamat || null,
        jumlahDpt: jumlahDpt ? parseInt(jumlahDpt) : 0,
      },
      include: { wilayah: true },
    });

    return NextResponse.json(tps, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "TPS dengan nomor tersebut sudah ada di wilayah ini" }, { status: 400 });
    }
    throw error;
  }
}
