-- CreateEnum
CREATE TYPE "ResponStatus" AS ENUM ('approve', 'reject');

-- CreateTable
CREATE TABLE "agenda_kegiatan" (
    "id" BIGSERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "lokasi" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "waktuMulai" TIMESTAMP(3) NOT NULL,
    "waktuSelesai" TIMESTAMP(3) NOT NULL,
    "statusAktif" BOOLEAN NOT NULL DEFAULT true,
    "dibuatOleh" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_respon" (
    "id" BIGSERIAL NOT NULL,
    "agendaId" BIGINT NOT NULL,
    "calegId" BIGINT NOT NULL,
    "status" "ResponStatus",
    "waktuRespon" TIMESTAMP(3),

    CONSTRAINT "agenda_respon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agenda_respon_agendaId_calegId_key" ON "agenda_respon"("agendaId", "calegId");

-- AddForeignKey
ALTER TABLE "agenda_respon" ADD CONSTRAINT "agenda_respon_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "agenda_kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
