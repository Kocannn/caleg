import "dotenv/config";
import { hashSync } from "bcryptjs";
import { prisma } from "../lib/prisma";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create wilayah
  const wilayah1 = await prisma.wilayah.create({
    data: {
      namaWilayah: "Surabaya - Gubeng",
      provinsi: "Jawa Timur",
      kabupaten: "Surabaya",
      kecamatan: "Gubeng",
      kelurahan: "Airlangga",
      kodePos: "60115",
    },
  });

  const wilayah2 = await prisma.wilayah.create({
    data: {
      namaWilayah: "Surabaya - Tegalsari",
      provinsi: "Jawa Timur",
      kabupaten: "Surabaya",
      kecamatan: "Tegalsari",
      kelurahan: "Tegalsari",
      kodePos: "60262",
    },
  });

  const wilayah3 = await prisma.wilayah.create({
    data: {
      namaWilayah: "Surabaya - Wonokromo",
      provinsi: "Jawa Timur",
      kabupaten: "Surabaya",
      kecamatan: "Wonokromo",
      kelurahan: "Darmo",
      kodePos: "60241",
    },
  });

  // Create Admin
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      password: hashSync("admin123", 10),
      namaLengkap: "Administrator",
      email: "admin@caleg.id",
      nomorHp: "081234567890",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", adminUser.username);

  // Create Caleg
  const calegUser = await prisma.user.create({
    data: {
      username: "caleg",
      password: hashSync("caleg123", 10),
      namaLengkap: "H. Ahmad Fauzi, S.H.",
      email: "caleg@caleg.id",
      nomorHp: "081234567891",
      role: "CALEG",
    },
  });
  console.log("✅ Caleg created:", calegUser.username);

  // Create Koordinator
  const koordinatorUser = await prisma.user.create({
    data: {
      username: "koordinator1",
      password: hashSync("koordinator123", 10),
      namaLengkap: "Budi Santoso",
      email: "koordinator1@caleg.id",
      nomorHp: "081234567892",
      role: "KOORDINATOR",
    },
  });

  const koordinator = await prisma.koordinator.create({
    data: {
      userId: koordinatorUser.id,
      wilayahId: wilayah1.id,
      namaLengkap: "Budi Santoso",
      noHp: "081234567892",
    },
  });
  console.log("✅ Koordinator created:", koordinatorUser.username);

  // Create Relawan
  const relawanUser = await prisma.user.create({
    data: {
      username: "relawan1",
      password: hashSync("relawan123", 10),
      namaLengkap: "Siti Aminah",
      email: "relawan1@caleg.id",
      nomorHp: "081234567893",
      role: "RELAWAN",
    },
  });

  const relawan = await prisma.relawan.create({
    data: {
      userId: relawanUser.id,
      koordinatorId: koordinator.id,
      wilayahId: wilayah1.id,
      namaLengkap: "Siti Aminah",
      noHp: "081234567893",
    },
  });
  console.log("✅ Relawan created:", relawanUser.username);

  // Create sample pendukung
  const pendukungData = [
    { nama: "Ahmad Rizki", nik: "3578012345670001", alamat: "Jl. Airlangga No. 1", lat: -7.2756, lng: 112.7517, status: "MENDUKUNG" as const },
    { nama: "Dewi Lestari", nik: "3578012345670002", alamat: "Jl. Dharmahusada No. 5", lat: -7.2700, lng: 112.7600, status: "MENDUKUNG" as const },
    { nama: "Eko Prasetyo", nik: "3578012345670003", alamat: "Jl. Gubeng Kertajaya", lat: -7.2800, lng: 112.7550, status: "RAGU" as const },
    { nama: "Fitri Handayani", nik: "3578012345670004", alamat: "Jl. Tegalsari No. 10", lat: -7.2900, lng: 112.7400, status: "TIDAK_MENDUKUNG" as const },
    { nama: "Gunawan", nik: "3578012345670005", alamat: "Jl. Darmo Permai", lat: -7.2950, lng: 112.7350, status: "BELUM_DIKONFIRMASI" as const },
  ];

  for (const p of pendukungData) {
    await prisma.pendukung.create({
      data: {
        relawanId: relawan.id,
        wilayahId: wilayah1.id,
        namaLengkap: p.nama,
        nik: p.nik,
        alamat: p.alamat,
        latitude: p.lat,
        longitude: p.lng,
        statusDukungan: p.status,
        statusApproval: "APPROVED",
      },
    });
  }
  console.log("✅ 5 sample pendukung created");

  // Create Survey
  const survey = await prisma.survey.create({
    data: {
      judul: "Survey Dukungan Caleg 2026",
      deskripsi: "Survey untuk mengukur dukungan masyarakat",
      aktif: true,
      pertanyaans: {
        create: [
          {
            pertanyaan: "Apakah Anda mendukung caleg ini?",
            tipe: "YA_TIDAK",
            opsi: ["Ya", "Tidak"],
            urutan: 1,
          },
          {
            pertanyaan: "Isu apa yang paling penting bagi Anda?",
            tipe: "PILIHAN_GANDA",
            opsi: ["Ekonomi", "Pendidikan", "Kesehatan", "Infrastruktur", "Keamanan"],
            urutan: 2,
          },
          {
            pertanyaan: "Apa keluhan utama Anda terhadap pemerintah saat ini?",
            tipe: "TEXT",
            opsi: [],
            urutan: 3,
          },
        ],
      },
    },
  });
  console.log("✅ Survey created:", survey.judul);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin:       admin / admin123");
  console.log("   Caleg:       caleg / caleg123");
  console.log("   Koordinator: koordinator1 / koordinator123");
  console.log("   Relawan:     relawan1 / relawan123");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
