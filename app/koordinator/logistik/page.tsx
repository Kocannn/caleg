import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import LogistikKoordinatorClient from "./LogistikKoordinatorClient";

export default async function KoordinatorLogistikPage() {
  const session = await auth();
  const koordinator = await prisma.koordinator.findUnique({
    where: { userId: session!.user.id },
  });

  if (!koordinator) {
    return <div className="text-center py-20 text-gray-500">Data koordinator belum terdaftar.</div>;
  }

  // Items received from admin
  const diterima = await prisma.logistikDistribusi.findMany({
    where: {
      tipeDistribusi: "ADMIN_KE_KOORDINATOR",
      koordinatorId: koordinator.id,
    },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { id: true, namaBarang: true, satuan: true } },
    },
  });

  // Items distributed to relawan
  const didistribusikan = await prisma.logistikDistribusi.findMany({
    where: {
      tipeDistribusi: "KOORDINATOR_KE_RELAWAN",
      koordinatorId: koordinator.id,
    },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { id: true, namaBarang: true, satuan: true } },
      relawan: { select: { namaLengkap: true, noHp: true } },
    },
  });

  // Calculate stock per item
  const stokMap: Record<string, { namaBarang: string; satuan: string; diterima: number; didistribusikan: number }> = {};

  for (const d of diterima) {
    const key = d.logistikItemId;
    if (!stokMap[key]) stokMap[key] = { namaBarang: d.logistikItem.namaBarang, satuan: d.logistikItem.satuan, diterima: 0, didistribusikan: 0 };
    stokMap[key].diterima += d.jumlah;
  }
  for (const d of didistribusikan) {
    const key = d.logistikItemId;
    if (!stokMap[key]) stokMap[key] = { namaBarang: d.logistikItem.namaBarang, satuan: d.logistikItem.satuan, diterima: 0, didistribusikan: 0 };
    stokMap[key].didistribusikan += d.jumlah;
  }

  const stokItems = Object.entries(stokMap).map(([id, v]) => ({
    id,
    ...v,
    tersedia: v.diterima - v.didistribusikan,
  }));

  // Relawan list
  const relawanList = await prisma.relawan.findMany({
    where: { koordinatorId: koordinator.id },
    select: { id: true, namaLengkap: true, noHp: true },
    orderBy: { namaLengkap: "asc" },
  });

  return (
    <LogistikKoordinatorClient
      koordinatorId={koordinator.id}
      stokItems={JSON.parse(JSON.stringify(stokItems))}
      initialDiterima={JSON.parse(JSON.stringify(diterima))}
      initialDidistribusikan={JSON.parse(JSON.stringify(didistribusikan))}
      relawanList={JSON.parse(JSON.stringify(relawanList))}
    />
  );
}
