import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { password } = body;

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const relawan = await prisma.relawan.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!relawan) {
    return NextResponse.json({ error: "Relawan not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: relawan.userId },
    data: { password: hashSync(password, 10) },
  });

  return NextResponse.json({ success: true });
}
