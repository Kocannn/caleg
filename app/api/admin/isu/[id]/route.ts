import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const isu = await prisma.isu.findUnique({
    where: { id },
    include: { buktiIsu: true },
  });

  if (!isu) return NextResponse.json({ error: "Isu tidak ditemukan" }, { status: 404 });
  return NextResponse.json(isu);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { judul, deskripsi, kategori, sumber, buktiList } = body;

  // Update isu data
  const isu = await prisma.isu.update({
    where: { id },
    data: {
      ...(judul && { judul }),
      ...(deskripsi && { deskripsi }),
      ...(kategori && { kategori }),
      ...(sumber !== undefined && { sumber: sumber || null }),
    },
    include: { buktiIsu: true },
  });

  // If buktiList provided, replace all bukti
  if (buktiList) {
    await prisma.buktiIsu.deleteMany({ where: { isuId: id } });
    await prisma.buktiIsu.createMany({
      data: buktiList.map((b: { url: string; keterangan?: string }) => ({
        isuId: id,
        url: b.url,
        keterangan: b.keterangan || null,
      })),
    });

    const updated = await prisma.isu.findUnique({
      where: { id },
      include: { buktiIsu: true },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json(isu);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.isu.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
