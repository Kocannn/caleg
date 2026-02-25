import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agendas = await prisma.agendaKegiatan.findMany({
    orderBy: { tanggal: "desc" },
  });

  return NextResponse.json(agendas);
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
  });

  return NextResponse.json(agenda, { status: 201 });
}
