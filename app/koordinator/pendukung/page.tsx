import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PendukungListClient from "./PendukungListClient";

export default async function KoordinatorPendukungPage() {
  const session = await auth();
  const koordinator = await prisma.koordinator.findUnique({ where: { userId: session!.user.id } });
  if (!koordinator) return <div className="text-center py-20 text-gray-500">Data koordinator belum terdaftar.</div>;

  const pendukung = await prisma.pendukung.findMany({
    where: { relawan: { koordinatorId: koordinator.id } },
    include: {
      relawan: { include: { user: { select: { namaLengkap: true } } } },
      wilayah: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const wilayahs = await prisma.wilayah.findMany({ orderBy: { namaWilayah: "asc" } });

  return (
    <PendukungListClient
      pendukung={JSON.parse(JSON.stringify(pendukung))}
      wilayahs={JSON.parse(JSON.stringify(wilayahs))}
    />
  );
}
