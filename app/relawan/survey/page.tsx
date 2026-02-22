import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SurveyForm from "./SurveyForm";

export default async function RelawanSurveyPage() {
  const session = await auth();
  const relawan = await prisma.relawan.findUnique({ where: { userId: session!.user.id } });

  if (!relawan) return <div className="text-center py-20 text-gray-500">Data relawan belum terdaftar.</div>;

  const surveys = await prisma.survey.findMany({
    where: { aktif: true },
    include: { pertanyaans: { orderBy: { urutan: "asc" } } },
  });

  const pendukungList = await prisma.pendukung.findMany({
    where: { relawanId: relawan.id },
    select: { id: true, namaLengkap: true, nik: true },
    orderBy: { namaLengkap: "asc" },
  });

  return (
    <SurveyForm
      surveys={JSON.parse(JSON.stringify(surveys))}
      pendukungList={JSON.parse(JSON.stringify(pendukungList))}
    />
  );
}
