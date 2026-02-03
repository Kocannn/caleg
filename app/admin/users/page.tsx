import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      namaLengkap: true,
      email: true,
      nomorHp: true,
      role: true,
      aktif: true,
      createdAt: true,
    },
  });

  const wilayahList = await prisma.wilayah.findMany({
    orderBy: [{ provinsi: "asc" }, { kabupaten: "asc" }, { kecamatan: "asc" }],
  });

  const koordinatorList = await prisma.koordinator.findMany({
    include: { user: { select: { namaLengkap: true } } },
  });

  return (
    <UsersClient
      initialUsers={JSON.parse(JSON.stringify(users))}
      wilayahList={JSON.parse(JSON.stringify(wilayahList))}
      koordinatorList={JSON.parse(JSON.stringify(koordinatorList))}
    />
  );
}
