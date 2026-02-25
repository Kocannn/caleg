-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CALEG', 'KOORDINATOR', 'RELAWAN');

-- CreateEnum
CREATE TYPE "StatusDukungan" AS ENUM ('MENDUKUNG', 'RAGU', 'TIDAK_MENDUKUNG', 'BELUM_DIKONFIRMASI');

-- CreateEnum
CREATE TYPE "StatusPenerimaan" AS ENUM ('BELUM_DITERIMA', 'SUDAH_DITERIMA', 'DITOLAK');

-- CreateEnum
CREATE TYPE "TipePertanyaan" AS ENUM ('TEXT', 'PILIHAN_GANDA', 'SKALA', 'YA_TIDAK');

-- CreateEnum
CREATE TYPE "StatusApproval" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "email" TEXT,
    "nomorHp" TEXT,
    "role" "Role" NOT NULL DEFAULT 'RELAWAN',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wilayah" (
    "id" TEXT NOT NULL,
    "namaWilayah" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kabupaten" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "kodePos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "koordinator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "koordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relawan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "koordinatorId" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relawan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendukung" (
    "id" TEXT NOT NULL,
    "relawanId" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "noHp" TEXT,
    "alamat" TEXT NOT NULL,
    "rt" TEXT,
    "rw" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "fotoRumah" TEXT,
    "statusDukungan" "StatusDukungan" NOT NULL DEFAULT 'BELUM_DIKONFIRMASI',
    "statusApproval" "StatusApproval" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendukung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pertanyaan_survey" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "tipe" "TipePertanyaan" NOT NULL DEFAULT 'TEXT',
    "opsi" TEXT[],
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pertanyaan_survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jawaban_survey" (
    "id" TEXT NOT NULL,
    "pertanyaanSurveyId" TEXT NOT NULL,
    "pendukungId" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jawaban_survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribusi_sembako" (
    "id" TEXT NOT NULL,
    "pendukungId" TEXT NOT NULL,
    "relawanId" TEXT NOT NULL,
    "jenisBantuan" TEXT NOT NULL,
    "tanggalDistribusi" TIMESTAMP(3) NOT NULL,
    "statusPenerimaan" "StatusPenerimaan" NOT NULL DEFAULT 'BELUM_DITERIMA',
    "keterangan" TEXT,
    "fotoBukti" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribusi_sembako_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_blast" (
    "id" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "wilayahId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wa_blast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wilayah_provinsi_kabupaten_kecamatan_kelurahan_key" ON "wilayah"("provinsi", "kabupaten", "kecamatan", "kelurahan");

-- CreateIndex
CREATE UNIQUE INDEX "koordinator_userId_key" ON "koordinator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "relawan_userId_key" ON "relawan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pendukung_nik_key" ON "pendukung"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "jawaban_survey_pertanyaanSurveyId_pendukungId_key" ON "jawaban_survey"("pertanyaanSurveyId", "pendukungId");

-- AddForeignKey
ALTER TABLE "koordinator" ADD CONSTRAINT "koordinator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "koordinator" ADD CONSTRAINT "koordinator_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relawan" ADD CONSTRAINT "relawan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relawan" ADD CONSTRAINT "relawan_koordinatorId_fkey" FOREIGN KEY ("koordinatorId") REFERENCES "koordinator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relawan" ADD CONSTRAINT "relawan_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendukung" ADD CONSTRAINT "pendukung_relawanId_fkey" FOREIGN KEY ("relawanId") REFERENCES "relawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendukung" ADD CONSTRAINT "pendukung_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pertanyaan_survey" ADD CONSTRAINT "pertanyaan_survey_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jawaban_survey" ADD CONSTRAINT "jawaban_survey_pertanyaanSurveyId_fkey" FOREIGN KEY ("pertanyaanSurveyId") REFERENCES "pertanyaan_survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jawaban_survey" ADD CONSTRAINT "jawaban_survey_pendukungId_fkey" FOREIGN KEY ("pendukungId") REFERENCES "pendukung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi_sembako" ADD CONSTRAINT "distribusi_sembako_pendukungId_fkey" FOREIGN KEY ("pendukungId") REFERENCES "pendukung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi_sembako" ADD CONSTRAINT "distribusi_sembako_relawanId_fkey" FOREIGN KEY ("relawanId") REFERENCES "relawan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_blast" ADD CONSTRAINT "wa_blast_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
