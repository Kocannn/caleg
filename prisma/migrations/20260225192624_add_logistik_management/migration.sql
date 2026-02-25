-- CreateEnum
CREATE TYPE "TipeDistribusiLogistik" AS ENUM ('ADMIN_KE_KOORDINATOR', 'KOORDINATOR_KE_RELAWAN', 'RELAWAN_KE_PENDUKUNG');

-- CreateTable
CREATE TABLE "logistik_item" (
    "id" TEXT NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logistik_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logistik_masuk" (
    "id" TEXT NOT NULL,
    "logistikItemId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logistik_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logistik_distribusi" (
    "id" TEXT NOT NULL,
    "logistikItemId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tipeDistribusi" "TipeDistribusiLogistik" NOT NULL,
    "koordinatorId" TEXT,
    "relawanId" TEXT,
    "pendukungId" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logistik_distribusi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "logistik_masuk" ADD CONSTRAINT "logistik_masuk_logistikItemId_fkey" FOREIGN KEY ("logistikItemId") REFERENCES "logistik_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistik_distribusi" ADD CONSTRAINT "logistik_distribusi_logistikItemId_fkey" FOREIGN KEY ("logistikItemId") REFERENCES "logistik_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistik_distribusi" ADD CONSTRAINT "logistik_distribusi_koordinatorId_fkey" FOREIGN KEY ("koordinatorId") REFERENCES "koordinator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistik_distribusi" ADD CONSTRAINT "logistik_distribusi_relawanId_fkey" FOREIGN KEY ("relawanId") REFERENCES "relawan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistik_distribusi" ADD CONSTRAINT "logistik_distribusi_pendukungId_fkey" FOREIGN KEY ("pendukungId") REFERENCES "pendukung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
