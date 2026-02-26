import { prisma } from "@/lib/prisma";
import KoordinatorClient from "./KoordinatorClient";

export default async function AdminKoordinatorPage() {
  const koordinators = await prisma.koordinator.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      namaLengkap: true,
      noHp: true,
      tps: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          aktif: true,
          createdAt: true,
        },
      },
      wilayah: {
        select: {
          id: true,
          provinsi: true,
          kabupaten: true,
          kecamatan: true,
          kelurahan: true,
        },
      },
      _count: {
        select: {
          relawans: true,
        },
      },
    },
  });

  const wilayahList = await prisma.wilayah.findMany({
    orderBy: [{ provinsi: "asc" }, { kabupaten: "asc" }, { kecamatan: "asc" }],
  });

  return (
    <KoordinatorClient
      initialKoordinators={JSON.parse(JSON.stringify(koordinators))}
      wilayahList={JSON.parse(JSON.stringify(wilayahList))}
    />
  );
}
