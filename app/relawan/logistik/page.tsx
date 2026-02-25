import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import LogistikRelawanClient from "./LogistikRelawanClient";

export default async function RelawanLogistikPage() {
  const session = await auth();
  const relawan = await prisma.relawan.findUnique({
    where: { userId: session!.user.id },
  });

  if (!relawan) {
    return <div className="text-center py-20 text-gray-500">Data relawan belum terdaftar.</div>;
  }

  // Items received from koordinator
  const diterima = await prisma.logistikDistribusi.findMany({
    where: {
      tipeDistribusi: "KOORDINATOR_KE_RELAWAN",
      relawanId: relawan.id,
    },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { id: true, namaBarang: true, satuan: true } },
      koordinator: { select: { namaLengkap: true } },
    },
  });

  // Items distributed to pendukung
  const didistribusikan = await prisma.logistikDistribusi.findMany({
    where: {
      tipeDistribusi: "RELAWAN_KE_PENDUKUNG",
      relawanId: relawan.id,
    },
    orderBy: { tanggal: "desc" },
    include: {
      logistikItem: { select: { id: true, namaBarang: true, satuan: true } },
      pendukung: { select: { namaLengkap: true, nik: true } },
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

  // Pendukung list
  const pendukungList = await prisma.pendukung.findMany({
    where: { relawanId: relawan.id },
    select: { id: true, namaLengkap: true, nik: true },
    orderBy: { namaLengkap: "asc" },
  });

  return (
    <LogistikRelawanClient
      relawanId={relawan.id}
      stokItems={JSON.parse(JSON.stringify(stokItems))}
      initialDiterima={JSON.parse(JSON.stringify(diterima))}
      initialDidistribusikan={JSON.parse(JSON.stringify(didistribusikan))}
      pendukungList={JSON.parse(JSON.stringify(pendukungList))}
    />
  );
}
