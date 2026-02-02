import { prisma } from "@/lib/prisma";
import SurveyClient from "./SurveyClient";

export default async function AdminSurveyPage() {
  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      pertanyaans: { orderBy: { urutan: "asc" } },
      _count: { select: { pertanyaans: true } },
    },
  });

  return <SurveyClient initialSurveys={JSON.parse(JSON.stringify(surveys))} />;
}
