import { prisma } from "@/lib/prisma";
import RelawanClient from "./RelawanClient";

export default async function AdminRelawanPage() {
  const relawans = await prisma.relawan.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      namaLengkap: true,
      noHp: true,
      tps: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          aktif: true,
          createdAt: true,
        },
      },
      koordinator: {
        select: {
          id: true,
          namaLengkap: true,
        },
      },
      wilayah: {
        select: {
          id: true,
          provinsi: true,
          kabupaten: true,
          kecamatan: true,
          kelurahan: true,
        },
      },
    },
  });

  const wilayahList = await prisma.wilayah.findMany({
    orderBy: [{ provinsi: "asc" }, { kabupaten: "asc" }, { kecamatan: "asc" }],
  });

  const koordinatorList = await prisma.koordinator.findMany({
    select: {
      id: true,
      namaLengkap: true,
      user: {
        select: {
          namaLengkap: true,
        },
      },
    },
    orderBy: { namaLengkap: "asc" },
  });

  return (
    <RelawanClient
      initialRelawans={JSON.parse(JSON.stringify(relawans))}
      wilayahList={JSON.parse(JSON.stringify(wilayahList))}
      koordinatorList={JSON.parse(JSON.stringify(koordinatorList))}
    />
  );
}
