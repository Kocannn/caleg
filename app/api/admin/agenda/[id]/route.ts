import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Helper to serialize BigInt fields to string for JSON responses
function serializeAgenda(agenda: Record<string, unknown>) {
  return {
    ...agenda,
    id: String(agenda.id),
    dibuatOleh: agenda.dibuatOleh ? String(agenda.dibuatOleh) : null,
    respon: Array.isArray(agenda.respon)
      ? (agenda.respon as Record<string, unknown>[]).map((r) => ({
          ...r,
          id: String(r.id),
          agendaId: String(r.agendaId),
          calegId: String(r.calegId),
        }))
      : undefined,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const agenda = await prisma.agendaKegiatan.findUnique({
    where: { id: BigInt(id) },
    include: { respon: true },
  });

  if (!agenda) {
    return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(
    serializeAgenda(agenda as unknown as Record<string, unknown>)
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    include: { respon: true },
  });

  return NextResponse.json(
    serializeAgenda(agenda as unknown as Record<string, unknown>)
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Delete related respon first, then the agenda
  await prisma.agendaRespon.deleteMany({
    where: { agendaId: BigInt(id) },
  });

  await prisma.agendaKegiatan.delete({
    where: { id: BigInt(id) },
  });

  return NextResponse.json({ success: true });
}
