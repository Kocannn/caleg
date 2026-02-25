import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { auth } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const { name, phone, wilayahId, koordinatorId, isActive } = body;

  // Update relawan table
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.namaLengkap = name;
  if (phone !== undefined) updateData.noHp = phone;
  if (wilayahId !== undefined) updateData.wilayahId = wilayahId;
  if (koordinatorId !== undefined) updateData.koordinatorId = koordinatorId;

  const relawan = await prisma.relawan.update({
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
      koordinator: {
        select: {
          id: true,
          namaLengkap: true,
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
    },
  });

  // Update user table if needed
  if (isActive !== undefined) {
    await prisma.user.update({
      where: { id: relawan.userId },
      data: { aktif: isActive },
    });
  }

  return NextResponse.json(relawan);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Delete relawan (will cascade to user due to onDelete: Cascade)
  await prisma.relawan.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
