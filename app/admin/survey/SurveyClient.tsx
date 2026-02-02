"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Pertanyaan {
  id: string;
  pertanyaan: string;
  tipe: string;
  opsi: string[];
  urutan: number;
}

interface Survey {
  id: string;
  judul: string;
  deskripsi: string | null;
  aktif: boolean;
  pertanyaans: Pertanyaan[];
  _count: { pertanyaans: number };
}

export default function SurveyClient({ initialSurveys }: { initialSurveys: Survey[] }) {
  const [surveys, setSurveys] = useState(initialSurveys);
  const [showModal, setShowModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [form, setForm] = useState({ judul: "", deskripsi: "" });
  const [pertanyaans, setPertanyaans] = useState<{ pertanyaan: string; tipe: string; opsi: string }[]>([]);
  const router = useRouter();

  function addPertanyaan() {
    setPertanyaans([...pertanyaans, { pertanyaan: "", tipe: "TEXT", opsi: "" }]);
  }

  function removePertanyaan(idx: number) {
    setPertanyaans(pertanyaans.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      pertanyaans: pertanyaans.map((p, i) => ({
        pertanyaan: p.pertanyaan,
        tipe: p.tipe,
        opsi: p.opsi ? p.opsi.split(",").map((o) => o.trim()) : [],
        urutan: i + 1,
      })),
    };

    const res = await fetch("/api/admin/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowModal(false);
      setForm({ judul: "", deskripsi: "" });
      setPertanyaans([]);
      router.refresh();
      const data = await fetch("/api/admin/survey").then((r) => r.json());
      setSurveys(data);
    } else {
      alert("Gagal membuat survey");
    }
  }

  async function toggleActive(id: string, aktif: boolean) {
    await fetch(`/api/admin/survey/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: !aktif }),
    });
    setSurveys((prev) => prev.map((s) => (s.id === id ? { ...s, aktif: !aktif } : s)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus survey ini?")) return;
    await fetch(`/api/admin/survey/${id}`, { method: "DELETE" });
    setSurveys((prev) => prev.filter((s) => s.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Survey</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + Buat Survey Baru
        </button>
      </div>

      <div className="grid gap-4">
        {surveys.map((survey) => (
          <div key={survey.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{survey.judul}</h3>
                <p className="text-sm text-gray-500">{survey.deskripsi || "Tanpa deskripsi"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(survey.id, survey.aktif)} className={`px-3 py-1 rounded-full text-xs font-medium ${survey.aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {survey.aktif ? "Aktif" : "Nonaktif"}
                </button>
                <button onClick={() => setSelectedSurvey(selectedSurvey?.id === survey.id ? null : survey)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Lihat detail">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <button onClick={() => handleDelete(survey.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{survey._count.pertanyaans} pertanyaan</p>

            {selectedSurvey?.id === survey.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                {survey.pertanyaans.map((p, i) => (
                  <div key={p.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-sm">{i + 1}. {p.pertanyaan}</p>
                    <p className="text-xs text-gray-500 mt-1">Tipe: {p.tipe}</p>
                    {p.opsi.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.opsi.map((o, oi) => (
                          <span key={oi} className="px-2 py-0.5 bg-white border rounded text-xs">{o}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b"><h2 className="text-lg font-bold">Buat Survey Baru</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Survey</label>
                <input type="text" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Pertanyaan</label>
                  <button type="button" onClick={addPertanyaan} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Tambah Pertanyaan</button>
                </div>
                {pertanyaans.map((p, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pertanyaan {idx + 1}</span>
                      <button type="button" onClick={() => removePertanyaan(idx)} className="text-red-500 text-sm">Hapus</button>
                    </div>
                    <input type="text" placeholder="Isi pertanyaan" value={p.pertanyaan} onChange={(e) => { const updated = [...pertanyaans]; updated[idx].pertanyaan = e.target.value; setPertanyaans(updated); }} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                    <div className="grid grid-cols-2 gap-3">
                      <select value={p.tipe} onChange={(e) => { const updated = [...pertanyaans]; updated[idx].tipe = e.target.value; setPertanyaans(updated); }} className="px-3 py-2 border rounded-lg text-sm">
                        <option value="TEXT">Teks Bebas</option>
                        <option value="PILIHAN_GANDA">Pilihan Ganda</option>
                        <option value="YA_TIDAK">Ya/Tidak</option>
                        <option value="SKALA">Skala 1-5</option>
                      </select>
                      {p.tipe === "PILIHAN_GANDA" && (
                        <input type="text" placeholder="Opsi (pisah koma)" value={p.opsi} onChange={(e) => { const updated = [...pertanyaans]; updated[idx].opsi = e.target.value; setPertanyaans(updated); }} className="px-3 py-2 border rounded-lg text-sm" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
