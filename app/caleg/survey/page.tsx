import { prisma } from "@/lib/prisma";
import SurveyResultsClient from "./SurveyResultsClient";

export default async function CalegSurveyPage() {
  const surveys = await prisma.survey.findMany({
    include: {
      pertanyaans: {
        orderBy: { urutan: "asc" },
        include: {
          jawabans: {
            select: { jawaban: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Process survey data for display
  const surveyData = surveys.map((s) => ({
    id: s.id,
    judul: s.judul,
    deskripsi: s.deskripsi,
    aktif: s.aktif,
    totalResponden: new Set(s.pertanyaans.flatMap((p) => p.jawabans.map((j) => j.jawaban))).size > 0
      ? s.pertanyaans[0]?.jawabans.length || 0
      : 0,
    pertanyaans: s.pertanyaans.map((p) => {
      const jawabans = p.jawabans.map((j) => j.jawaban);
      let summary: { type: string; data: Record<string, number> | { average: number; distribution: Record<string, number> } };

      if (p.tipe === "TEXT") {
        summary = { type: "TEXT", data: {} };
      } else if (p.tipe === "YA_TIDAK" || p.tipe === "PILIHAN_GANDA") {
        const counts: Record<string, number> = {};
        jawabans.forEach((j) => { counts[j] = (counts[j] || 0) + 1; });
        summary = { type: p.tipe, data: counts };
      } else if (p.tipe === "SKALA") {
        const nums = jawabans.map(Number).filter((n) => !isNaN(n));
        const avg = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        const dist: Record<string, number> = {};
        nums.forEach((n) => { dist[String(n)] = (dist[String(n)] || 0) + 1; });
        summary = { type: "SKALA", data: { average: Math.round(avg * 100) / 100, distribution: dist } };
      } else {
        summary = { type: p.tipe, data: {} };
      }

      return {
        id: p.id,
        pertanyaan: p.pertanyaan,
        tipe: p.tipe,
        totalJawaban: jawabans.length,
        summary,
      };
    }),
  }));

  return <SurveyResultsClient surveys={JSON.parse(JSON.stringify(surveyData))} />;
}
