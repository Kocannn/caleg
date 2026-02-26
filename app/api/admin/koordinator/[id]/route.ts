import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const { name, phone, wilayahId, isActive, latitude, longitude } = body;

  // Update koordinator table
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.namaLengkap = name;
  if (phone !== undefined) updateData.noHp = phone;
  if (wilayahId !== undefined) updateData.wilayahId = wilayahId;
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;

  const koordinator = await prisma.koordinator.update({
    where: { id },
    data: updateData,
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

  // Update user table if needed
  if (isActive !== undefined) {
    await prisma.user.update({
      where: { id: koordinator.userId },
      data: { aktif: isActive },
    });
  }

  // Update user name if changed
  if (name !== undefined) {
    await prisma.user.update({
      where: { id: koordinator.userId },
      data: { namaLengkap: name },
    });
  }

  return NextResponse.json(koordinator);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if koordinator has relawans
  const koordinator = await prisma.koordinator.findUnique({
    where: { id },
    include: { _count: { select: { relawans: true } } },
  });

  if (koordinator && koordinator._count.relawans > 0) {
    return NextResponse.json(
      {
        error: `Koordinator masih memiliki ${koordinator._count.relawans} relawan. Pindahkan relawan terlebih dahulu.`,
      },
      { status: 400 }
    );
  }

  // Delete koordinator and user
  if (koordinator) {
    await prisma.$transaction(async (tx) => {
      await tx.koordinator.delete({ where: { id } });
      await tx.user.delete({ where: { id: koordinator.userId } });
    });
  }

  return NextResponse.json({ success: true });
}
