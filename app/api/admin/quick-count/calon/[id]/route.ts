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
  const { nomorUrut, namaCalon, partai, foto } = body;

  const calon = await prisma.quickCountCalon.update({
    where: { id },
    data: {
      ...(nomorUrut !== undefined && { nomorUrut: parseInt(nomorUrut) }),
      ...(namaCalon && { namaCalon }),
      ...(partai !== undefined && { partai: partai || null }),
      ...(foto !== undefined && { foto: foto || null }),
    },
  });

  return NextResponse.json(calon);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.quickCountCalon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
