import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { jawabans } = body;

  if (!jawabans || jawabans.length === 0) {
    return NextResponse.json({ error: "Jawaban tidak boleh kosong" }, { status: 400 });
  }

  // Use transaction to save all answers
  await prisma.$transaction(
    jawabans.map((j: { pertanyaanSurveyId: string; pendukungId: string; jawaban: string }) =>
      prisma.jawabanSurvey.upsert({
        where: {
          pertanyaanSurveyId_pendukungId: {
            pertanyaanSurveyId: j.pertanyaanSurveyId,
            pendukungId: j.pendukungId,
          },
        },
        update: { jawaban: j.jawaban },
        create: {
          pertanyaanSurveyId: j.pertanyaanSurveyId,
          pendukungId: j.pendukungId,
          jawaban: j.jawaban,
        },
      })
    )
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
