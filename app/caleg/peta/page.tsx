import { prisma } from "@/lib/prisma";
import PetaSebaranClient from "./PetaSebaranClient";

export default async function CalegPetaPage() {
  const pendukung = await prisma.pendukung.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: {
      id: true,
      namaLengkap: true,
      latitude: true,
      longitude: true,
      statusDukungan: true,
      alamat: true,
      wilayah: { select: { namaWilayah: true, kelurahan: true } },
    },
  });

  return <PetaSebaranClient markers={JSON.parse(JSON.stringify(pendukung))} />;
}
