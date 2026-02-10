import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { pesan, wilayahId, mediaType, mediaUrl } = body;

  if (!pesan) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
  }

  // Get koordinator phone numbers
  const where = wilayahId ? { wilayahId } : {};
  const koordinators = await prisma.koordinator.findMany({
    where,
    select: { noHp: true, namaLengkap: true },
  });

  // Create blast record
  const blast = await prisma.waBlast.create({
    data: {
      pesan,
      wilayahId: wilayahId || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || "text",
      status: "pending",
    },
    include: { wilayah: { select: { kecamatan: true, kelurahan: true } } },
  });

  // Send via WA Gateway (async, non-blocking)
  try {
    const waApiUrl = process.env.WA_API_URL;
    const waApiKey = process.env.WA_API_KEY;

    if (waApiUrl && waApiKey) {
      for (const k of koordinators) {
        if (k.noHp) {
          // Format phone to international
          const phone = k.noHp.replace(/^0/, "62").replace(/[^0-9]/g, "");

          await fetch(`${waApiUrl}/send-message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${waApiKey}`,
            },
            body: JSON.stringify({
              phone,
              message: pesan,
              mediaUrl: mediaUrl || undefined,
              mediaType: mediaType || "text",
            }),
          }).catch(() => {/* ignore individual send errors */});
        }
      }

      // Update status to sent
      await prisma.waBlast.update({
        where: { id: blast.id },
        data: { status: "sent" },
      });
    }
  } catch {
    await prisma.waBlast.update({
      where: { id: blast.id },
      data: { status: "failed" },
    });
  }

  return NextResponse.json(blast, { status: 201 });
}
