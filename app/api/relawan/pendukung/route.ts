import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatusDukungan } from "@/app/generated/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const relawan = await prisma.relawan.findUnique({ where: { userId: session.user.id } });
  if (!relawan) return NextResponse.json({ error: "Relawan not found" }, { status: 404 });

  const pendukung = await prisma.pendukung.findMany({
    where: { relawanId: relawan.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pendukung);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const namaLengkap = formData.get("namaLengkap") as string;
  const nik = formData.get("nik") as string;
  const noHp = formData.get("noHp") as string;
  const alamat = formData.get("alamat") as string;
  const rt = formData.get("rt") as string;
  const rw = formData.get("rw") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;
  const statusDukungan = formData.get("statusDukungan") as string;
  const relawanId = formData.get("relawanId") as string;
  const wilayahId = formData.get("wilayahId") as string;
  const foto = formData.get("foto") as File | null;

  if (!namaLengkap || !nik || !alamat) {
    return NextResponse.json({ error: "Field wajib harus diisi" }, { status: 400 });
  }

  if (!/^\d{16}$/.test(nik)) {
    return NextResponse.json({ error: "NIK harus 16 digit angka" }, { status: 400 });
  }

  // Check duplicate NIK
  const existing = await prisma.pendukung.findUnique({ where: { nik } });
  if (existing) {
    return NextResponse.json({ error: "NIK sudah terdaftar" }, { status: 400 });
  }

  // Handle file upload
  let fotoRumah: string | null = null;
  if (foto && foto.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "pendukung");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(foto.name) || ".jpg";
    const filename = `${nik}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await foto.arrayBuffer());
    await writeFile(filePath, buffer);

    fotoRumah = `/uploads/pendukung/${filename}`;
  }

  const pendukung = await prisma.pendukung.create({
    data: {
      relawanId,
      wilayahId,
      namaLengkap,
      nik,
      noHp: noHp || null,
      alamat,
      rt: rt || null,
      rw: rw || null,
      latitude: parseFloat(latitude) || null,
      longitude: parseFloat(longitude) || null,
      statusDukungan: (statusDukungan as StatusDukungan) || "BELUM_DIKONFIRMASI",
      statusApproval: "PENDING",
      fotoRumah,
    },
  });

  return NextResponse.json(pendukung, { status: 201 });
}
