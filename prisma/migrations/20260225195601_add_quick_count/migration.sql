-- CreateTable
CREATE TABLE "quick_count_tps" (
    "id" TEXT NOT NULL,
    "nomorTps" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "alamat" TEXT,
    "jumlahDpt" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_count_tps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_count_calon" (
    "id" TEXT NOT NULL,
    "nomorUrut" INTEGER NOT NULL,
    "namaCalon" TEXT NOT NULL,
    "partai" TEXT,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_count_calon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_count_hasil" (
    "id" TEXT NOT NULL,
    "tpsId" TEXT NOT NULL,
    "calonId" TEXT NOT NULL,
    "jumlahSuara" INTEGER NOT NULL DEFAULT 0,
    "fotoBukti" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_count_hasil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quick_count_tps_nomorTps_wilayahId_key" ON "quick_count_tps"("nomorTps", "wilayahId");

-- CreateIndex
CREATE UNIQUE INDEX "quick_count_calon_nomorUrut_key" ON "quick_count_calon"("nomorUrut");

-- CreateIndex
CREATE UNIQUE INDEX "quick_count_hasil_tpsId_calonId_key" ON "quick_count_hasil"("tpsId", "calonId");

-- AddForeignKey
ALTER TABLE "quick_count_tps" ADD CONSTRAINT "quick_count_tps_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_count_hasil" ADD CONSTRAINT "quick_count_hasil_tpsId_fkey" FOREIGN KEY ("tpsId") REFERENCES "quick_count_tps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_count_hasil" ADD CONSTRAINT "quick_count_hasil_calonId_fkey" FOREIGN KEY ("calonId") REFERENCES "quick_count_calon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
