import { prisma } from "@/lib/prisma";
import IsuClient from "./IsuClient";

export default async function AdminIsuPage() {
  const isus = await prisma.isu.findMany({
    orderBy: { createdAt: "desc" },
    include: { buktiIsu: true },
  });

  return <IsuClient initialIsus={JSON.parse(JSON.stringify(isus))} />;
}
