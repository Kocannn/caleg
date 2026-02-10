import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, password, name, email, phone, role, wilayahId, koordinatorId } = body;

  if (!username || !password || !name || !role) {
    return NextResponse.json({ error: "Field wajib harus diisi" }, { status: 400 });
  }

  // Check duplicate username
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      username,
      password: hashSync(password, 10),
      namaLengkap: name,
      email: email || null,
      nomorHp: phone || null,
      role,
    },
  });

  // Create related record based on role
  if (role === "KOORDINATOR" && wilayahId) {
    await prisma.koordinator.create({
      data: {
        userId: user.id,
        wilayahId,
        namaLengkap: name,
        noHp: phone || "",
      },
    });
  }

  if (role === "RELAWAN" && koordinatorId && wilayahId) {
    await prisma.relawan.create({
      data: {
        userId: user.id,
        koordinatorId,
        wilayahId,
        namaLengkap: name,
        noHp: phone || "",
      },
    });
  }

  return NextResponse.json(user, { status: 201 });
}
