import { prisma } from "@/lib/prisma";
import LogistikClient from "./LogistikClient";

export default async function AdminLogistikPage() {
  const items = await prisma.logistikItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      logistikMasuk: { orderBy: { tanggal: "desc" } },
      logistikDistribusi: {
        where: { tipeDistribusi: "ADMIN_KE_KOORDINATOR" },
        orderBy: { tanggal: "desc" },
        include: {
          koordinator: {
            select: { namaLengkap: true, noHp: true, wilayah: { select: { namaWilayah: true } } },
          },
        },
      },
    },
  });

  const koordinatorList = await prisma.koordinator.findMany({
    select: {
      id: true,
      namaLengkap: true,
      noHp: true,
      wilayah: { select: { namaWilayah: true } },
    },
    orderBy: { namaLengkap: "asc" },
  });

  // Calculate stock summary
  const itemsWithStock = items.map((item) => {
    const totalMasuk = item.logistikMasuk.reduce((sum, m) => sum + m.jumlah, 0);
    const totalKeluar = item.logistikDistribusi.reduce((sum, d) => sum + d.jumlah, 0);
    return {
      ...item,
      totalMasuk,
      totalKeluar,
      stokTersedia: totalMasuk - totalKeluar,
    };
  });

  return (
    <LogistikClient
      initialItems={JSON.parse(JSON.stringify(itemsWithStock))}
      koordinatorList={JSON.parse(JSON.stringify(koordinatorList))}
    />
  );
}
