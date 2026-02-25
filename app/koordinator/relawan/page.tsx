import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import RelawanListClient from "./RelawanListClient";

export default async function KoordinatorRelawanPage() {
  const session = await auth();
  const koordinator = await prisma.koordinator.findUnique({ where: { userId: session!.user.id } });
  if (!koordinator) return <div className="text-center py-20 text-gray-500">Data koordinator belum terdaftar.</div>;

  const relawans = await prisma.relawan.findMany({
    where: { koordinatorId: koordinator.id },
    include: {
      user: true,
      wilayah: true,
      _count: { select: { pendukung: true, distribusi: true } },
    },
    orderBy: { user: { namaLengkap: "asc" } },
  });

  return <RelawanListClient relawans={JSON.parse(JSON.stringify(relawans))} />;
}
