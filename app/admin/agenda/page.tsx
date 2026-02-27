import { prisma } from "@/lib/prisma";
import AgendaClient from "./AgendaClient";

// Helper to serialize BigInt fields for JSON transfer to client
function serializeAgenda(agenda: Record<string, unknown>) {
  return {
    ...agenda,
    id: String(agenda.id),
    dibuatOleh: agenda.dibuatOleh ? String(agenda.dibuatOleh) : null,
    respon: Array.isArray(agenda.respon)
      ? (agenda.respon as Record<string, unknown>[]).map((r) => ({
          ...r,
          id: String(r.id),
          agendaId: String(r.agendaId),
          calegId: String(r.calegId),
        }))
      : [],
  };
}

export default async function AdminAgendaPage() {
  const agendas = await prisma.agendaKegiatan.findMany({
    orderBy: { tanggal: "desc" },
    include: { respon: true },
  });

  const serialized = agendas.map((a) =>
    serializeAgenda(a as unknown as Record<string, unknown>)
  );

  return <AgendaClient initialAgendas={JSON.parse(JSON.stringify(serialized))} />;
}
