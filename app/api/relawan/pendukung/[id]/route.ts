import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const formData = await req.formData();

  const updateData: Record<string, unknown> = {};

  const namaLengkap = formData.get("namaLengkap") as string;
  const noHp = formData.get("noHp") as string;
  const alamat = formData.get("alamat") as string;
  const rt = formData.get("rt") as string;
  const rw = formData.get("rw") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;
  const statusDukungan = formData.get("statusDukungan") as string;
  const foto = formData.get("foto") as File | null;

  if (namaLengkap) updateData.namaLengkap = namaLengkap;
  if (noHp !== null) updateData.noHp = noHp || null;
  if (alamat) updateData.alamat = alamat;
  if (rt !== null) updateData.rt = rt || null;
  if (rw !== null) updateData.rw = rw || null;
  if (latitude) updateData.latitude = parseFloat(latitude) || null;
  if (longitude) updateData.longitude = parseFloat(longitude) || null;
  if (statusDukungan) updateData.statusDukungan = statusDukungan;

  // Handle file upload
  if (foto && foto.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "pendukung");
    await mkdir(uploadDir, { recursive: true });

    const nik = formData.get("nik") as string || "unknown";
    const ext = path.extname(foto.name) || ".jpg";
    const filename = `${nik}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await foto.arrayBuffer());
    await writeFile(filePath, buffer);

    updateData.fotoRumah = `/uploads/pendukung/${filename}`;
  }

  const pendukung = await prisma.pendukung.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(pendukung);
}
