import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const nik = req.nextUrl.searchParams.get("nik");
  if (!nik) return NextResponse.json({ error: "NIK diperlukan" }, { status: 400 });

  const pendukung = await prisma.pendukung.findUnique({
    where: { nik },
    select: { namaLengkap: true },
  });

  return NextResponse.json({
    exists: !!pendukung,
    nama: pendukung?.namaLengkap || null,
  });
}
