import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET logistik data for relawan (received items + distributed items)
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "RELAWAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const relawan = await prisma.relawan.findUnique({
    where: { userId: session.user.id },
  });

  if (!relawan) {
    return NextResponse.json({ error: "Relawan tidak ditemukan" }, { status: 404 });
  }

  // Items received from koordinator
  const diterima = await prisma.logistikDistribusi.findMany({
    where: {
      tipeDistribusi: "KOORDINATOR_KE_RELAWAN",
      relawanId: relawan.id,
    },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { id: true, namaBarang: true, satuan: true } },
      koordinator: { select: { namaLengkap: true } },
    },
  });

  // Items distributed to pendukung
  const didistribusikan = await prisma.logistikDistribusi.findMany({
    where: {
      tipeDistribusi: "RELAWAN_KE_PENDUKUNG",
      relawanId: relawan.id,
    },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { id: true, namaBarang: true, satuan: true } },
      pendukung: { select: { namaLengkap: true, nik: true } },
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

  // Get pendukung list for this relawan
  const pendukungList = await prisma.pendukung.findMany({
    where: { relawanId: relawan.id },
    select: { id: true, namaLengkap: true, nik: true },
    orderBy: { namaLengkap: "asc" },
  });

  // Get available logistik items
  const availableItems = Object.entries(stokPerItem)
    .filter(([, v]) => v.tersedia > 0)
    .map(([id, v]) => ({ id, ...v }));

  return NextResponse.json({
    relawanId: relawan.id,
    stokPerItem,
    diterima,
    didistribusikan,
    pendukungList,
    availableItems,
  });
}

// POST distribute from relawan to pendukung
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "RELAWAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const relawan = await prisma.relawan.findUnique({
    where: { userId: session.user.id },
  });

  if (!relawan) {
    return NextResponse.json({ error: "Relawan tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json();
  const { logistikItemId, jumlah, tanggal, pendukungId, keterangan } = body;

  if (!logistikItemId || !jumlah || !tanggal || !pendukungId) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  // Check available stock
  const totalDiterima = await prisma.logistikDistribusi.aggregate({
    where: {
      tipeDistribusi: "KOORDINATOR_KE_RELAWAN",
      relawanId: relawan.id,
      logistikItemId,
    },
    _sum: { jumlah: true },
  });

  const totalDidistribusikan = await prisma.logistikDistribusi.aggregate({
    where: {
      tipeDistribusi: "RELAWAN_KE_PENDUKUNG",
      relawanId: relawan.id,
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
      tipeDistribusi: "RELAWAN_KE_PENDUKUNG",
      relawanId: relawan.id,
      pendukungId,
      keterangan: keterangan || null,
    },
    include: {
      logistikItem: { select: { namaBarang: true, satuan: true } },
      pendukung: { select: { namaLengkap: true, nik: true } },
    },
  });

  return NextResponse.json(distribusi, { status: 201 });
}
