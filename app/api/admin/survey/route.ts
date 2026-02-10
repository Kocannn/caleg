import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      pertanyaans: { orderBy: { urutan: "asc" } },
      _count: { select: { pertanyaans: true } },
    },
  });

  return NextResponse.json(surveys);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { judul, deskripsi, pertanyaans } = body;

  const survey = await prisma.survey.create({
    data: {
      judul,
      deskripsi: deskripsi || null,
      pertanyaans: {
        create: pertanyaans.map((p: { pertanyaan: string; tipe: string; opsi: string[]; urutan: number }) => ({
          pertanyaan: p.pertanyaan,
          tipe: p.tipe,
          opsi: p.opsi || [],
          urutan: p.urutan,
        })),
      },
    },
    include: { pertanyaans: true },
  });

  return NextResponse.json(survey, { status: 201 });
}
