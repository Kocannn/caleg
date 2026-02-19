"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SurveyQuestion {
  id: string;
  pertanyaan: string;
  tipe: string;
  totalJawaban: number;
  summary: {
    type: string;
    data: Record<string, number> | { average: number; distribution: Record<string, number> };
  };
}

interface SurveyData {
  id: string;
  judul: string;
  deskripsi: string | null;
  aktif: boolean;
  totalResponden: number;
  pertanyaans: SurveyQuestion[];
}

export default function SurveyResultsClient({ surveys }: { surveys: SurveyData[] }) {
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyData | null>(null);

  if (selectedSurvey) {
    return (
      <div>
        <button onClick={() => setSelectedSurvey(null)} className="mb-4 text-blue-600 hover:underline text-sm">&larr; Kembali ke daftar</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedSurvey.judul}</h1>
        <p className="text-sm text-gray-500 mb-6">{selectedSurvey.deskripsi || "Tanpa deskripsi"}</p>

        <div className="space-y-6">
          {selectedSurvey.pertanyaans.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-1">{idx + 1}. {q.pertanyaan}</h3>
              <p className="text-xs text-gray-400 mb-4">{q.totalJawaban} jawaban • Tipe: {q.tipe}</p>

              {q.tipe === "TEXT" && (
                <p className="text-sm text-gray-500 italic">Jawaban teks tidak diringkas dalam grafik.</p>
              )}

              {(q.tipe === "YA_TIDAK" || q.tipe === "PILIHAN_GANDA") && (() => {
                const data = q.summary.data as Record<string, number>;
                const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
                return (
                  <div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jawaban" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {chartData.map((d) => (
                        <div key={d.name} className="bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                          <span className="font-medium">{d.name}</span>: {d.value} ({q.totalJawaban > 0 ? Math.round((d.value / q.totalJawaban) * 100) : 0}%)
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {q.tipe === "SKALA" && (() => {
                const skalaData = q.summary.data as { average: number; distribution: Record<string, number> };
                const chartData = [1, 2, 3, 4, 5].map((n) => ({ name: String(n), value: skalaData.distribution[String(n)] || 0 }));
                return (
                  <div>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-blue-600">{skalaData.average}</span>
                      <span className="text-sm text-gray-500 ml-1">/ 5</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Jawaban" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hasil Survey</h1>

      {surveys.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Belum ada survey</p>
      ) : (
        <div className="grid gap-4">
          {surveys.map((s) => (
            <button key={s.id} onClick={() => setSelectedSurvey(s)} className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{s.judul}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.deskripsi || "Tanpa deskripsi"}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.aktif ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {s.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>{s.pertanyaans.length} pertanyaan</span>
                <span>{s.totalResponden} responden</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
