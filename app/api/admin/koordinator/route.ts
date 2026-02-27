import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const koordinators = await prisma.koordinator.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          aktif: true,
          createdAt: true,
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
      _count: {
        select: {
          relawans: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(koordinators);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username, password, name, phone, tps, wilayahId, latitude, longitude } = body;

  if (!username || !password || !name || !wilayahId) {
    return NextResponse.json(
      { error: "Field wajib harus diisi" },
      { status: 400 }
    );
  }

  // Check duplicate username
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { error: "Username sudah digunakan" },
      { status: 400 }
    );
  }

  // Create user and koordinator in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        password: hashSync(password, 10),
        namaLengkap: name,
        nomorHp: phone || null,
        role: "KOORDINATOR",
      },
    });

    const koordinator = await tx.koordinator.create({
      data: {
        userId: user.id,
        wilayahId,
        namaLengkap: name,
        noHp: phone || "",
        tps: tps || null,
        latitude: latitude !== undefined ? latitude : null,
        longitude: longitude !== undefined ? longitude : null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            aktif: true,
            createdAt: true,
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
        _count: {
          select: {
            relawans: true,
          },
        },
      },
    });

    return koordinator;
  });

  return NextResponse.json(result, { status: 201 });
}
