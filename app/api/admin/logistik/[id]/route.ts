import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// PUT update logistik item
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { namaBarang, satuan, deskripsi } = body;

  if (!namaBarang || !satuan) {
    return NextResponse.json({ error: "Nama barang dan satuan wajib diisi" }, { status: 400 });
  }

  const item = await prisma.logistikItem.update({
    where: { id },
    data: { namaBarang, satuan, deskripsi: deskripsi || null },
  });

  return NextResponse.json(item);
}

// DELETE logistik item
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.logistikItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
