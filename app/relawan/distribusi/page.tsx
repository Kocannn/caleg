import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DistribusiClient from "./DistribusiClient";

export default async function DistribusiPage() {
  const session = await auth();
  const relawan = await prisma.relawan.findUnique({ where: { userId: session!.user.id } });

  if (!relawan) return <div className="text-center py-20 text-gray-500">Data relawan belum terdaftar.</div>;

  const distribusi = await prisma.distribusiSembako.findMany({
    where: { relawanId: relawan.id },
    orderBy: { createdAt: "desc" },
    include: { pendukung: { select: { namaLengkap: true, nik: true } } },
  });

  const pendukungList = await prisma.pendukung.findMany({
    where: { relawanId: relawan.id },
    select: { id: true, namaLengkap: true, nik: true },
    orderBy: { namaLengkap: "asc" },
  });

  return (
    <DistribusiClient
      relawanId={relawan.id}
      initialData={JSON.parse(JSON.stringify(distribusi))}
      pendukungList={JSON.parse(JSON.stringify(pendukungList))}
    />
  );
}
