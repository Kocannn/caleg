import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const relawan = await prisma.relawan.findUnique({ where: { userId: session.user.id } });
  if (!relawan) return NextResponse.json({ error: "Relawan not found" }, { status: 404 });

  const pendukung = await prisma.pendukung.findMany({
    where: { relawanId: relawan.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pendukung);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { namaLengkap, nik, noHp, alamat, rt, rw, latitude, longitude, statusDukungan, relawanId, wilayahId } = body;

  if (!namaLengkap || !nik || !alamat) {
    return NextResponse.json({ error: "Field wajib harus diisi" }, { status: 400 });
  }

  if (!/^\d{16}$/.test(nik)) {
    return NextResponse.json({ error: "NIK harus 16 digit angka" }, { status: 400 });
  }

  // Check duplicate NIK
  const existing = await prisma.pendukung.findUnique({ where: { nik } });
  if (existing) {
    return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 400 });
  }

  const pendukung = await prisma.pendukung.create({
    data: {
      relawanId,
      wilayahId,
      namaLengkap,
      nik,
      noHp: noHp || null,
      alamat,
      rt: rt || null,
      rw: rw || null,
      latitude: latitude || null,
      longitude: longitude || null,
      statusDukungan: statusDukungan || "BELUM_DIKONFIRMASI",
      statusApproval: "PENDING",
    },
  });

  return NextResponse.json(pendukung, { status: 201 });
}
