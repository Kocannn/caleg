"use client";

import { useState } from "react";

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
  pertanyaans: Pertanyaan[];
}

interface PendukungOption {
  id: string;
  namaLengkap: string;
  nik: string;
}

export default function SurveyForm({ surveys, pendukungList }: { surveys: Survey[]; pendukungList: PendukungOption[] }) {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [selectedPendukung, setSelectedPendukung] = useState("");
  const [jawabans, setJawabans] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSurvey || !selectedPendukung) return;

    setLoading(true);
    const data = Object.entries(jawabans).map(([pertanyaanSurveyId, jawaban]) => ({
      pertanyaanSurveyId,
      pendukungId: selectedPendukung,
      jawaban,
    }));

    const res = await fetch("/api/relawan/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jawabans: data }),
    });

    if (res.ok) {
      setSubmitted(true);
      setJawabans({});
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan jawaban survey");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="text-center py-20">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Survey Berhasil Disimpan!</h2>
        <button onClick={() => { setSubmitted(false); setSelectedSurvey(null); setSelectedPendukung(""); }} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Isi Survey Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Isi Survey</h1>

      {!selectedSurvey ? (
        <div className="grid gap-4">
          {surveys.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Belum ada survey aktif</p>
          ) : (
            surveys.map((survey) => (
              <button key={survey.id} onClick={() => setSelectedSurvey(survey)} className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all">
                <h3 className="font-semibold text-lg">{survey.judul}</h3>
                <p className="text-sm text-gray-500 mt-1">{survey.deskripsi || "Tanpa deskripsi"}</p>
                <p className="text-sm text-blue-600 mt-2">{survey.pertanyaans.length} pertanyaan</p>
              </button>
            ))
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-1">{selectedSurvey.judul}</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedSurvey.deskripsi}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pendukung</label>
              <select value={selectedPendukung} onChange={(e) => setSelectedPendukung(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                <option value="">Pilih pendukung...</option>
                {pendukungList.map((p) => (
                  <option key={p.id} value={p.id}>{p.namaLengkap} - {p.nik}</option>
                ))}
              </select>
            </div>

            <div className="space-y-5">
              {selectedSurvey.pertanyaans.map((p, idx) => (
                <div key={p.id} className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-900 mb-2">{idx + 1}. {p.pertanyaan}</label>
                  {p.tipe === "TEXT" && (
                    <textarea value={jawabans[p.id] || ""} onChange={(e) => setJawabans({ ...jawabans, [p.id]: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} required />
                  )}
                  {p.tipe === "YA_TIDAK" && (
                    <div className="flex gap-4">
                      {["Ya", "Tidak"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name={p.id} value={opt} checked={jawabans[p.id] === opt} onChange={(e) => setJawabans({ ...jawabans, [p.id]: e.target.value })} className="text-blue-600" required />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {p.tipe === "PILIHAN_GANDA" && (
                    <div className="space-y-2">
                      {p.opsi.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name={p.id} value={opt} checked={jawabans[p.id] === opt} onChange={(e) => setJawabans({ ...jawabans, [p.id]: e.target.value })} className="text-blue-600" required />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {p.tipe === "SKALA" && (
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
                          <input type="radio" name={p.id} value={String(n)} checked={jawabans[p.id] === String(n)} onChange={(e) => setJawabans({ ...jawabans, [p.id]: e.target.value })} className="text-blue-600" required />
                          <span className="text-xs text-gray-600">{n}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
              {loading ? "Menyimpan..." : "Kirim Jawaban"}
            </button>
            <button type="button" onClick={() => { setSelectedSurvey(null); setJawabans({}); }} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              Kembali
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
