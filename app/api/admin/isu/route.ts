import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isus = await prisma.isu.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buktiIsu: true,
    },
  });

  return NextResponse.json(isus);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { judul, deskripsi, kategori, sumber, buktiList } = body;

  if (!judul || !deskripsi) {
    return NextResponse.json({ error: "Judul dan deskripsi wajib diisi" }, { status: 400 });
  }

  const isu = await prisma.isu.create({
    data: {
      judul,
      deskripsi,
      kategori: kategori || "LAINNYA",
      sumber: sumber || null,
      buktiIsu: {
        create: (buktiList || []).map((b: { url: string; keterangan?: string }) => ({
          url: b.url,
          keterangan: b.keterangan || null,
        })),
      },
    },
    include: { buktiIsu: true },
  });

  return NextResponse.json(isu, { status: 201 });
}
