import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wilayah = await prisma.wilayah.findMany({
    orderBy: [{ provinsi: "asc" }, { kabupaten: "asc" }],
    include: { _count: { select: { koordinators: true, relawans: true, pendukung: true } } },
  });

  return NextResponse.json(wilayah);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { namaWilayah, provinsi, kabupaten, kecamatan, kelurahan, kodePos } = body;

  if (!provinsi || !kabupaten || !kecamatan || !kelurahan) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.wilayah.findUnique({
    where: { provinsi_kabupaten_kecamatan_kelurahan: { provinsi, kabupaten, kecamatan, kelurahan } },
  });

  if (existing) {
    return NextResponse.json({ error: "Wilayah sudah ada" }, { status: 400 });
  }

  const wilayah = await prisma.wilayah.create({
    data: {
      namaWilayah: namaWilayah || `${kabupaten} - ${kecamatan}`,
      provinsi,
      kabupaten,
      kecamatan,
      kelurahan,
      kodePos: kodePos || null,
    },
  });

  return NextResponse.json(wilayah, { status: 201 });
}
