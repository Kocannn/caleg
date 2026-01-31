import { prisma } from "@/lib/prisma";
import PendukungClient from "./PendukungClient";

export default async function AdminPendukungPage() {
  const pendukung = await prisma.pendukung.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      relawan: { select: { namaLengkap: true } },
      wilayah: { select: { kecamatan: true, kelurahan: true, kabupaten: true } },
    },
  });

  const wilayahList = await prisma.wilayah.findMany({
    orderBy: [{ kabupaten: "asc" }, { kecamatan: "asc" }],
  });

  return (
    <PendukungClient
      initialData={JSON.parse(JSON.stringify(pendukung))}
      wilayahList={JSON.parse(JSON.stringify(wilayahList))}
    />
  );
}
