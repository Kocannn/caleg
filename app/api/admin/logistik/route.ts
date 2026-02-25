import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET all logistik items with stock summary
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.logistikItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      logistikMasuk: { orderBy: { tanggal: "desc" } },
      logistikDistribusi: {
        where: { tipeDistribusi: "ADMIN_KE_KOORDINATOR" },
        orderBy: { tanggal: "desc" },
        include: {
          koordinator: {
            select: { namaLengkap: true, noHp: true, wilayah: { select: { namaWilayah: true } } },
          },
        },
      },
    },
  });

  const itemsWithStock = items.map((item) => {
    const totalMasuk = item.logistikMasuk.reduce((sum, m) => sum + m.jumlah, 0);
    const totalKeluar = item.logistikDistribusi.reduce((sum, d) => sum + d.jumlah, 0);
    return {
      ...item,
      totalMasuk,
      totalKeluar,
      stokTersedia: totalMasuk - totalKeluar,
    };
  });

  return NextResponse.json(itemsWithStock);
}

// POST create new logistik item
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { namaBarang, satuan, deskripsi } = body;

  if (!namaBarang || !satuan) {
    return NextResponse.json({ error: "Nama barang dan satuan wajib diisi" }, { status: 400 });
  }

  const item = await prisma.logistikItem.create({
    data: {
      namaBarang,
      satuan,
      deskripsi: deskripsi || null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
