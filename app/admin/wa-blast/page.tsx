import { prisma } from "@/lib/prisma";
import WaBlastClient from "./WaBlastClient";

export default async function WaBlastPage() {
  const wilayahList = await prisma.wilayah.findMany({
    orderBy: [{ kabupaten: "asc" }, { kecamatan: "asc" }],
  });

  const blastHistory = await prisma.waBlast.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { wilayah: { select: { kecamatan: true, kelurahan: true } } },
  });

  return (
    <WaBlastClient
      wilayahList={JSON.parse(JSON.stringify(wilayahList))}
      initialHistory={JSON.parse(JSON.stringify(blastHistory))}
    />
  );
}
