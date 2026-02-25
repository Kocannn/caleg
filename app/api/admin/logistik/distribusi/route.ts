import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET all distribusi from admin to koordinator
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const distribusi = await prisma.logistikDistribusi.findMany({
    where: { tipeDistribusi: "ADMIN_KE_KOORDINATOR" },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { namaBarang: true, satuan: true } },
      koordinator: { select: { namaLengkap: true, noHp: true, wilayah: { select: { namaWilayah: true } } } },
    },
  });

  return NextResponse.json(distribusi);
}

// POST create new distribusi admin -> koordinator
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { logistikItemId, jumlah, tanggal, koordinatorId, keterangan } = body;

  if (!logistikItemId || !jumlah || !tanggal || !koordinatorId) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  if (jumlah <= 0) {
    return NextResponse.json({ error: "Jumlah harus lebih dari 0" }, { status: 400 });
  }

  // Check available stock
  const item = await prisma.logistikItem.findUnique({
    where: { id: logistikItemId },
    include: {
      logistikMasuk: true,
      logistikDistribusi: { where: { tipeDistribusi: "ADMIN_KE_KOORDINATOR" } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
  }

  const totalMasuk = item.logistikMasuk.reduce((sum, m) => sum + m.jumlah, 0);
  const totalKeluar = item.logistikDistribusi.reduce((sum, d) => sum + d.jumlah, 0);
  const stokTersedia = totalMasuk - totalKeluar;

  if (jumlah > stokTersedia) {
    return NextResponse.json(
      { error: `Stok tidak cukup. Tersedia: ${stokTersedia} ${item.satuan}` },
      { status: 400 }
    );
  }

  const distribusi = await prisma.logistikDistribusi.create({
    data: {
      logistikItemId,
      jumlah: parseInt(jumlah),
      tanggal: new Date(tanggal),
      tipeDistribusi: "ADMIN_KE_KOORDINATOR",
      koordinatorId,
      keterangan: keterangan || null,
    },
    include: {
      logistikItem: { select: { namaBarang: true, satuan: true } },
      koordinator: { select: { namaLengkap: true, noHp: true, wilayah: { select: { namaWilayah: true } } } },
    },
  });

  return NextResponse.json(distribusi, { status: 201 });
}
