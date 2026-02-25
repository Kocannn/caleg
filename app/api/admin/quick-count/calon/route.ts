import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET: fetch all calon
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const calonList = await prisma.quickCountCalon.findMany({
    orderBy: { nomorUrut: "asc" },
  });

  return NextResponse.json(calonList);
}

// POST: create calon
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nomorUrut, namaCalon, partai, foto } = body;

  if (!nomorUrut || !namaCalon) {
    return NextResponse.json({ error: "Nomor urut dan nama calon wajib diisi" }, { status: 400 });
  }

  try {
    const calon = await prisma.quickCountCalon.create({
      data: {
        nomorUrut: parseInt(nomorUrut),
        namaCalon,
        partai: partai || null,
        foto: foto || null,
      },
    });

    return NextResponse.json(calon, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Nomor urut sudah digunakan" }, { status: 400 });
    }
    throw error;
  }
}
