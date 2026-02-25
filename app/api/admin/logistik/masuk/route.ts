import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET all logistik masuk records
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const masuk = await prisma.logistikMasuk.findMany({
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { namaBarang: true, satuan: true } },
    },
  });

  return NextResponse.json(masuk);
}

// POST create new logistik masuk
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { logistikItemId, jumlah, tanggal, keterangan } = body;

  if (!logistikItemId || !jumlah || !tanggal) {
    return NextResponse.json({ error: "Item, jumlah, dan tanggal wajib diisi" }, { status: 400 });
  }

  if (jumlah <= 0) {
    return NextResponse.json({ error: "Jumlah harus lebih dari 0" }, { status: 400 });
  }

  const masuk = await prisma.logistikMasuk.create({
    data: {
      logistikItemId,
      jumlah: parseInt(jumlah),
      tanggal: new Date(tanggal),
      keterangan: keterangan || null,
    },
    include: {
      logistikItem: { select: { namaBarang: true, satuan: true } },
    },
  });

  return NextResponse.json(masuk, { status: 201 });
}
