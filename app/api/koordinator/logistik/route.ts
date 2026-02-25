import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET logistik data for koordinator (received items + distributed items)
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "KOORDINATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const koordinator = await prisma.koordinator.findUnique({
    where: { userId: session.user.id },
  });

  if (!koordinator) {
    return NextResponse.json({ error: "Koordinator tidak ditemukan" }, { status: 404 });
  }

  // Items received from admin
  const diterima = await prisma.logistikDistribusi.findMany({
    where: {
      tipeDistribusi: "ADMIN_KE_KOORDINATOR",
      koordinatorId: koordinator.id,
    },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { id: true, namaBarang: true, satuan: true } },
    },
  });

  // Items distributed to relawan
  const didistribusikan = await prisma.logistikDistribusi.findMany({
    where: {
      tipeDistribusi: "KOORDINATOR_KE_RELAWAN",
      koordinatorId: koordinator.id,
    },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { id: true, namaBarang: true, satuan: true } },
      relawan: { select: { namaLengkap: true, noHp: true } },
    },
  });

  // Calculate stock per item
  const stokPerItem: Record<string, { namaBarang: string; satuan: string; diterima: number; didistribusikan: number; tersedia: number }> = {};

  for (const d of diterima) {
    const key = d.logistikItemId;
    if (!stokPerItem[key]) {
      stokPerItem[key] = {
        namaBarang: d.logistikItem.namaBarang,
        satuan: d.logistikItem.satuan,
        diterima: 0,
        didistribusikan: 0,
        tersedia: 0,
      };
    }
    stokPerItem[key].diterima += d.jumlah;
  }

  for (const d of didistribusikan) {
    const key = d.logistikItemId;
    if (!stokPerItem[key]) {
      stokPerItem[key] = {
        namaBarang: d.logistikItem.namaBarang,
        satuan: d.logistikItem.satuan,
        diterima: 0,
        didistribusikan: 0,
        tersedia: 0,
      };
    }
    stokPerItem[key].didistribusikan += d.jumlah;
  }

  for (const key of Object.keys(stokPerItem)) {
    stokPerItem[key].tersedia = stokPerItem[key].diterima - stokPerItem[key].didistribusikan;
  }

  // Get relawan list for this koordinator
  const relawanList = await prisma.relawan.findMany({
    where: { koordinatorId: koordinator.id },
    select: { id: true, namaLengkap: true, noHp: true },
    orderBy: { namaLengkap: "asc" },
  });

  // Get available logistik items (that this koordinator has received)
  const availableItems = Object.entries(stokPerItem)
    .filter(([, v]) => v.tersedia > 0)
    .map(([id, v]) => ({ id, ...v }));

  return NextResponse.json({
    koordinatorId: koordinator.id,
    stokPerItem,
    diterima,
    didistribusikan,
    relawanList,
    availableItems,
  });
}

// POST distribute from koordinator to relawan
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "KOORDINATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const koordinator = await prisma.koordinator.findUnique({
    where: { userId: session.user.id },
  });

  if (!koordinator) {
    return NextResponse.json({ error: "Koordinator tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();
  const { logistikItemId, jumlah, tanggal, relawanId, keterangan } = body;

  if (!logistikItemId || !jumlah || !tanggal || !relawanId) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  // Check available stock for this koordinator
  const totalDiterima = await prisma.logistikDistribusi.aggregate({
    where: {
      tipeDistribusi: "ADMIN_KE_KOORDINATOR",
      koordinatorId: koordinator.id,
      logistikItemId,
    },
    _sum: { jumlah: true },
  });

  const totalDidistribusikan = await prisma.logistikDistribusi.aggregate({
    where: {
      tipeDistribusi: "KOORDINATOR_KE_RELAWAN",
      koordinatorId: koordinator.id,
      logistikItemId,
    },
    _sum: { jumlah: true },
  });

  const stokTersedia = (totalDiterima._sum.jumlah || 0) - (totalDidistribusikan._sum.jumlah || 0);

  if (jumlah > stokTersedia) {
    return NextResponse.json({ error: `Stok tidak cukup. Tersedia: ${stokTersedia}` }, { status: 400 });
  }

  const distribusi = await prisma.logistikDistribusi.create({
    data: {
      logistikItemId,
      jumlah: parseInt(jumlah),
      tanggal: new Date(tanggal),
      tipeDistribusi: "KOORDINATOR_KE_RELAWAN",
      koordinatorId: koordinator.id,
      relawanId,
      keterangan: keterangan || null,
    },
    include: {
      logistikItem: { select: { namaBarang: true, satuan: true } },
      relawan: { select: { namaLengkap: true, noHp: true } },
    },
  });

  return NextResponse.json(distribusi, { status: 201 });
}
