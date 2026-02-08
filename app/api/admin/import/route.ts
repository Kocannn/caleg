import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "File diperlukan" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

  // Get first relawan and wilayah for default assignment
  const firstRelawan = await prisma.relawan.findFirst();
  const firstWilayah = await prisma.wilayah.findFirst();

  if (!firstRelawan || !firstWilayah) {
    return NextResponse.json({ error: "Belum ada relawan atau wilayah. Buat terlebih dahulu." }, { status: 400 });
  }

  let count = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const nik = String(row.nik || row.NIK || "").trim();
    const nama = String(row.nama_lengkap || row["Nama Lengkap"] || "").trim();
    const alamat = String(row.alamat || row.Alamat || "").trim();

    if (!nik || !nama || !alamat) {
      errors.push(`Baris dengan NIK ${nik}: data tidak lengkap`);
      continue;
    }

    if (!/^\d{16}$/.test(nik)) {
      errors.push(`NIK ${nik}: format tidak valid (harus 16 digit)`);
      continue;
    }

    // Check duplicate
    const exists = await prisma.pendukung.findUnique({ where: { nik } });
    if (exists) {
      errors.push(`NIK ${nik}: sudah terdaftar`);
      continue;
    }

    const statusMap: Record<string, string> = {
      MENDUKUNG: "MENDUKUNG",
      RAGU: "RAGU",
      TIDAK_MENDUKUNG: "TIDAK_MENDUKUNG",
    };

    await prisma.pendukung.create({
      data: {
        relawanId: firstRelawan.id,
        wilayahId: firstWilayah.id,
        namaLengkap: nama,
        nik,
        noHp: String(row.no_hp || row["No HP"] || "").trim() || null,
        alamat,
        statusDukungan: (statusMap[String(row.status_dukungan || row["Status Dukungan"] || "").trim().toUpperCase()] || "BELUM_DIKONFIRMASI") as "MENDUKUNG" | "RAGU" | "TIDAK_MENDUKUNG" | "BELUM_DIKONFIRMASI",
        statusApproval: "PENDING",
      },
    });
    count++;
  }

  return NextResponse.json({ success: true, count, errors });
}
