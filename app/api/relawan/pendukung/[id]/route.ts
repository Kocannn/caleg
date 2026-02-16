import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.namaLengkap) updateData.namaLengkap = body.namaLengkap;
  if (body.noHp !== undefined) updateData.noHp = body.noHp || null;
  if (body.alamat) updateData.alamat = body.alamat;
  if (body.rt !== undefined) updateData.rt = body.rt || null;
  if (body.rw !== undefined) updateData.rw = body.rw || null;
  if (body.latitude) updateData.latitude = body.latitude;
  if (body.longitude) updateData.longitude = body.longitude;
  if (body.statusDukungan) updateData.statusDukungan = body.statusDukungan;

  const pendukung = await prisma.pendukung.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(pendukung);
}
