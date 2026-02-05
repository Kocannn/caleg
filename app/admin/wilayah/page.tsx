import { prisma } from "@/lib/prisma";
import WilayahClient from "./WilayahClient";

export default async function AdminWilayahPage() {
  const wilayah = await prisma.wilayah.findMany({
    orderBy: [{ provinsi: "asc" }, { kabupaten: "asc" }, { kecamatan: "asc" }],
    include: {
      _count: {
        select: { koordinators: true, relawans: true, pendukung: true },
      },
    },
  });

  return <WilayahClient initialWilayah={JSON.parse(JSON.stringify(wilayah))} />;
}
