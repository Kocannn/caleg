import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const relawan = await prisma.relawan.findUnique({ where: { userId: session.user.id } });
  if (!relawan) return NextResponse.json([], { status: 200 });

  const distribusi = await prisma.distribusiSembako.findMany({
    where: { relawanId: relawan.id },
    orderBy: { createdAt: "desc" },
    include: { pendukung: { select: { namaLengkap: true, nik: true } } },
  });

  return NextResponse.json(distribusi);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { pendukungId, relawanId, jenisBantuan, tanggalDistribusi, statusPenerimaan, keterangan } = body;

  const distribusi = await prisma.distribusiSembako.create({
    data: {
      pendukungId,
      relawanId,
      jenisBantuan,
      tanggalDistribusi: new Date(tanggalDistribusi),
      statusPenerimaan: statusPenerimaan || "BELUM_DITERIMA",
      keterangan: keterangan || null,
    },
    include: { pendukung: { select: { namaLengkap: true, nik: true } } },
  });

  return NextResponse.json(distribusi, { status: 201 });
}
