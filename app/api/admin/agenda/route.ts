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

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agendas = await prisma.agendaKegiatan.findMany({
    orderBy: { tanggal: "desc" },
    include: { respon: true },
  });

  return NextResponse.json(
    agendas.map((a) => serializeAgenda(a as unknown as Record<string, unknown>))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { judul, deskripsi, lokasi, tanggal, waktuMulai, waktuSelesai, statusAktif } = body;

  if (!judul || !tanggal || !waktuMulai || !waktuSelesai) {
    return NextResponse.json(
      { error: "Field wajib harus diisi" },
      { status: 400 }
    );
  }

  const agenda = await prisma.agendaKegiatan.create({
    data: {
      judul,
      deskripsi: deskripsi || null,
      lokasi: lokasi || null,
      tanggal: new Date(tanggal),
      waktuMulai: new Date(waktuMulai),
      waktuSelesai: new Date(waktuSelesai),
      statusAktif: statusAktif ?? true,
    },
    include: { respon: true },
  });

  return NextResponse.json(
    serializeAgenda(agenda as unknown as Record<string, unknown>),
    { status: 201 }
  );
}
