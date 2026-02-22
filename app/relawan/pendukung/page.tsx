import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PendukungInput from "./PendukungInput";

export default async function RelawanPendukungPage() {
  const session = await auth();
  const relawan = await prisma.relawan.findUnique({
    where: { userId: session!.user.id },
    include: { wilayah: true },
  });

  if (!relawan) {
    return <div className="text-center py-20 text-gray-500">Data relawan belum terdaftar.</div>;
  }

  const pendukung = await prisma.pendukung.findMany({
    where: { relawanId: relawan.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PendukungInput
      relawanId={relawan.id}
      wilayahId={relawan.wilayahId}
      initialData={JSON.parse(JSON.stringify(pendukung))}
    />
  );
}
