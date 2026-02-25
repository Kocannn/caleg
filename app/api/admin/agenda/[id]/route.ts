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

  const updateData: Record<string, unknown> = {};
  if (body.judul !== undefined) updateData.judul = body.judul;
  if (body.deskripsi !== undefined) updateData.deskripsi = body.deskripsi;
  if (body.lokasi !== undefined) updateData.lokasi = body.lokasi;
  if (body.tanggal !== undefined) updateData.tanggal = new Date(body.tanggal);
  if (body.waktuMulai !== undefined) updateData.waktuMulai = new Date(body.waktuMulai);
  if (body.waktuSelesai !== undefined) updateData.waktuSelesai = new Date(body.waktuSelesai);
  if (body.statusAktif !== undefined) updateData.statusAktif = body.statusAktif;

  const agenda = await prisma.agendaKegiatan.update({
    where: { id: BigInt(id) },
    data: updateData,
  });

  return NextResponse.json(agenda);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.agendaKegiatan.delete({
    where: { id: BigInt(id) },
  });

  return NextResponse.json({ success: true });
}
