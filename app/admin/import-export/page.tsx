"use client";

import { useState } from "react";

export default function ImportExportPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleExport(type: string) {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage(`Export ${type} berhasil!`);
      } else {
        setMessage("Gagal export data");
      }
    } catch {
      setMessage("Terjadi kesalahan");
    }
    setExporting(false);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Import berhasil! ${data.count} data ditambahkan.`);
      } else {
        setMessage(data.error || "Gagal import data");
      }
    } catch {
      setMessage("Terjadi kesalahan saat import");
    }
    setImporting(false);
    e.target.value = "";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Import / Export Data</h1>

      {message && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Data
          </h2>
          <p className="text-sm text-gray-600 mb-4">Download data dalam format Excel (.xlsx)</p>
          <div className="space-y-3">
            <button onClick={() => handleExport("pendukung")} disabled={exporting} className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              Export Data Pendukung
            </button>
            <button onClick={() => handleExport("relawan")} disabled={exporting} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              Export Data Relawan
            </button>
            <button onClick={() => handleExport("koordinator")} disabled={exporting} className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              Export Data Koordinator
            </button>
            <button onClick={() => handleExport("survey")} disabled={exporting} className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              Export Hasil Survey
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Import Data
          </h2>
          <p className="text-sm text-gray-600 mb-4">Upload file Excel (.xlsx) untuk import data pendukung</p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} disabled={importing} className="hidden" id="importFile" />
            <label htmlFor="importFile" className="cursor-pointer">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="text-sm text-gray-600">{importing ? "Memproses..." : "Klik untuk upload file Excel"}</p>
              <p className="text-xs text-gray-400 mt-1">Format: .xlsx, .xls</p>
            </label>
          </div>
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Format Kolom:</h3>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>nama_lengkap (wajib)</li>
              <li>nik (wajib, 16 digit)</li>
              <li>no_hp</li>
              <li>alamat (wajib)</li>
              <li>status_dukungan (MENDUKUNG/RAGU/TIDAK_MENDUKUNG)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
