import { prisma } from "@/lib/prisma";
import CalegPendukungClient from "./CalegPendukungClient";

export default async function CalegPendukungPage() {
  const pendukung = await prisma.pendukung.findMany({
    include: {
      relawan: { include: { user: { select: { namaLengkap: true } } } },
      wilayah: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const wilayahs = await prisma.wilayah.findMany({ orderBy: { namaWilayah: "asc" } });

  return (
    <CalegPendukungClient
      pendukung={JSON.parse(JSON.stringify(pendukung))}
      wilayahs={JSON.parse(JSON.stringify(wilayahs))}
    />
  );
}
