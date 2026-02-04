"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Wilayah {
  id: string;
  kecamatan: string;
  kelurahan: string;
  kabupaten: string;
}

interface BlastHistory {
  id: string;
  pesan: string;
  mediaUrl: string | null;
  mediaType: string | null;
  status: string;
  createdAt: string;
  wilayah: { kecamatan: string; kelurahan: string } | null;
}

export default function WaBlastClient({ wilayahList, initialHistory }: { wilayahList: Wilayah[]; initialHistory: BlastHistory[] }) {
  const [history, setHistory] = useState(initialHistory);
  const [pesan, setPesan] = useState("");
  const [wilayahId, setWilayahId] = useState("");
  const [mediaType, setMediaType] = useState("text");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function handleSend() {
    if (!pesan.trim()) { alert("Pesan tidak boleh kosong"); return; }
    setSending(true);

    const res = await fetch("/api/admin/wa-blast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pesan, wilayahId: wilayahId || null, mediaType }),
    });

    if (res.ok) {
      const newBlast = await res.json();
      setHistory([newBlast, ...history]);
      setPesan("");
      setWilayahId("");
      router.refresh();
    } else {
      alert("Gagal mengirim pesan");
    }
    setSending(false);
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    sent: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">WA Blast - Broadcast WhatsApp</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Kirim Pesan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select value={wilayahId} onChange={(e) => setWilayahId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Semua Koordinator</option>
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id}>{w.kecamatan}, {w.kelurahan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pesan</label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="text">Teks</option>
                  <option value="image">Gambar</option>
                  <option value="pdf">File PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                <textarea value={pesan} onChange={(e) => setPesan(e.target.value)} rows={5} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Tulis pesan broadcast..." />
              </div>

              <button onClick={handleSend} disabled={sending} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? "Mengirim..." : "Kirim Broadcast"}
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Riwayat Broadcast</h2>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Belum ada riwayat broadcast</p>
              ) : (
                history.map((blast) => (
                  <div key={blast.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[blast.status]}`}>
                          {blast.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {blast.wilayah ? `${blast.wilayah.kecamatan}, ${blast.wilayah.kelurahan}` : "Semua Koordinator"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(blast.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{blast.pesan}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
