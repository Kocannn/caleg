-- CreateEnum
CREATE TYPE "KategoriIsu" AS ENUM ('HOAX', 'ISU_NEGATIF', 'BLACK_CAMPAIGN', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusIsu" AS ENUM ('BARU', 'DITANGGAPI', 'SELESAI');

-- CreateTable
CREATE TABLE "isu" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" "KategoriIsu" NOT NULL DEFAULT 'LAINNYA',
    "status" "StatusIsu" NOT NULL DEFAULT 'BARU',
    "sumber" TEXT,
    "tanggapan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "isu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bukti_isu" (
    "id" TEXT NOT NULL,
    "isuId" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bukti_isu_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bukti_isu" ADD CONSTRAINT "bukti_isu_isuId_fkey" FOREIGN KEY ("isuId") REFERENCES "isu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
