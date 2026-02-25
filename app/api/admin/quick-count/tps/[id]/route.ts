import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { nomorTps, wilayahId, alamat, jumlahDpt } = body;

  const tps = await prisma.quickCountTps.update({
    where: { id },
    data: {
      ...(nomorTps && { nomorTps }),
      ...(wilayahId && { wilayahId }),
      ...(alamat !== undefined && { alamat: alamat || null }),
      ...(jumlahDpt !== undefined && { jumlahDpt: parseInt(jumlahDpt) || 0 }),
    },
    include: { wilayah: true },
  });

  return NextResponse.json(tps);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.quickCountTps.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
