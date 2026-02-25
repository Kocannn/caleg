import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");

  let data: Record<string, unknown>[] = [];

  switch (type) {
    case "pendukung": {
      const pendukung = await prisma.pendukung.findMany({
        include: {
          relawan: { select: { namaLengkap: true } },
          wilayah: { select: { kecamatan: true, kelurahan: true, kabupaten: true } },
        },
      });
      data = pendukung.map((p) => ({
        "Nama Lengkap": p.namaLengkap,
        NIK: p.nik,
        "No HP": p.noHp || "",
        Alamat: p.alamat,
        "RT": p.rt || "",
        "RW": p.rw || "",
        Kecamatan: p.wilayah.kecamatan,
        Kelurahan: p.wilayah.kelurahan,
        "Status Dukungan": p.statusDukungan,
        "Status Approval": p.statusApproval,
        Relawan: p.relawan.namaLengkap,
        Latitude: p.latitude || "",
        Longitude: p.longitude || "",
        "Tanggal Input": new Date(p.createdAt).toLocaleDateString("id-ID"),
      }));
      break;
    }
    case "relawan": {
      const relawan = await prisma.relawan.findMany({
        include: {
          user: { select: { username: true, email: true } },
          koordinator: { select: { namaLengkap: true } },
          wilayah: { select: { kecamatan: true, kelurahan: true } },
          _count: { select: { pendukung: true } },
        },
      });
      data = relawan.map((r) => ({
        "Nama Lengkap": r.namaLengkap,
        Username: r.user.username,
        "No HP": r.noHp,
        Email: r.user.email || "",
        Koordinator: r.koordinator.namaLengkap,
        Kecamatan: r.wilayah.kecamatan,
        "Jumlah Pendukung": r._count.pendukung,
      }));
      break;
    }
    case "koordinator": {
      const koordinator = await prisma.koordinator.findMany({
        include: {
          user: { select: { username: true, email: true } },
          wilayah: { select: { kecamatan: true, kelurahan: true } },
          _count: { select: { relawans: true } },
        },
      });
      data = koordinator.map((k) => ({
        "Nama Lengkap": k.namaLengkap,
        Username: k.user.username,
        "No HP": k.noHp,
        Email: k.user.email || "",
        Kecamatan: k.wilayah.kecamatan,
        "Jumlah Relawan": k._count.relawans,
      }));
      break;
    }
    case "survey": {
      const jawabans = await prisma.jawabanSurvey.findMany({
        include: {
          pertanyaanSurvey: { select: { pertanyaan: true, survey: { select: { judul: true } } } },
          pendukung: { select: { namaLengkap: true, nik: true } },
        },
      });
      data = jawabans.map((j) => ({
        Survey: j.pertanyaanSurvey.survey.judul,
        Pertanyaan: j.pertanyaanSurvey.pertanyaan,
        "Nama Pendukung": j.pendukung.namaLengkap,
        NIK: j.pendukung.nik,
        Jawaban: j.jawaban,
        Tanggal: new Date(j.createdAt).toLocaleDateString("id-ID"),
      }));
      break;
    }
    case "bantuan": {
      const distribusi = await prisma.distribusiSembako.findMany({
        include: {
          pendukung: {
            select: {
              namaLengkap: true,
              nik: true,
              alamat: true,
              wilayah: { select: { kecamatan: true, kelurahan: true, kabupaten: true } },
            },
          },
          relawan: { select: { namaLengkap: true } },
        },
      });
      data = distribusi.map((d) => ({
        "Nama Penerima": d.pendukung.namaLengkap,
        NIK: d.pendukung.nik,
        Alamat: d.pendukung.alamat,
        Kabupaten: d.pendukung.wilayah?.kabupaten || "",
        Kecamatan: d.pendukung.wilayah?.kecamatan || "",
        Kelurahan: d.pendukung.wilayah?.kelurahan || "",
        "Jenis Bantuan": d.jenisBantuan,
        "Tanggal Distribusi": new Date(d.tanggalDistribusi).toLocaleDateString("id-ID"),
        "Status Penerimaan": d.statusPenerimaan,
        Keterangan: d.keterangan || "",
        Relawan: d.relawan.namaLengkap,
        "Tanggal Input": new Date(d.createdAt).toLocaleDateString("id-ID"),
      }));
      break;
    }
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
