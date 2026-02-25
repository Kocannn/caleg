"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StokItem {
  id: string;
  namaBarang: string;
  satuan: string;
  diterima: number;
  didistribusikan: number;
  tersedia: number;
}

interface DiterimaItem {
  id: string;
  logistikItemId: string;
  jumlah: number;
  tanggal: string;
  keterangan: string | null;
  logistikItem: { id: string; namaBarang: string; satuan: string };
}

interface DidistribusikanItem {
  id: string;
  logistikItemId: string;
  jumlah: number;
  tanggal: string;
  keterangan: string | null;
  logistikItem: { id: string; namaBarang: string; satuan: string };
  relawan: { namaLengkap: string; noHp: string };
}

interface RelawanOption {
  id: string;
  namaLengkap: string;
  noHp: string;
}

type TabType = "stok" | "diterima" | "distribusi";

export default function LogistikKoordinatorClient({
  koordinatorId,
  stokItems,
  initialDiterima,
  initialDidistribusikan,
  relawanList,
}: {
  koordinatorId: string;
  stokItems: StokItem[];
  initialDiterima: DiterimaItem[];
  initialDidistribusikan: DidistribusikanItem[];
  relawanList: RelawanOption[];
}) {
  const [activeTab, setActiveTab] = useState<TabType>("stok");
  const [showModal, setShowModal] = useState(false);
  const [diterima] = useState(initialDiterima);
  const [didistribusikan] = useState(initialDidistribusikan);
  const router = useRouter();

  const [form, setForm] = useState({
    logistikItemId: "",
    jumlah: "",
    tanggal: new Date().toISOString().slice(0, 10),
    relawanId: "",
    keterangan: "",
  });

  void koordinatorId; // used for context

  const totalDiterima = stokItems.reduce((sum, i) => sum + i.diterima, 0);
  const totalDidistribusikan = stokItems.reduce((sum, i) => sum + i.didistribusikan, 0);
  const totalTersedia = stokItems.reduce((sum, i) => sum + i.tersedia, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/koordinator/logistik", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ logistikItemId: "", jumlah: "", tanggal: new Date().toISOString().slice(0, 10), relawanId: "", keterangan: "" });
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan");
    }
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "stok", label: "Stok Tersedia", count: stokItems.length },
    { key: "diterima", label: "Diterima dari Admin", count: diterima.length },
    { key: "distribusi", label: "Distribusi ke Relawan", count: didistribusikan.length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Logistik</h1>
        {stokItems.some((i) => i.tersedia > 0) && (
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
            + Distribusi ke Relawan
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Diterima</p>
              <p className="text-2xl font-bold text-green-600">{totalDiterima}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Didistribusikan</p>
              <p className="text-2xl font-bold text-orange-600">{totalDidistribusikan}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stok Tersedia</p>
              <p className="text-2xl font-bold text-purple-600">{totalTersedia}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Stok Tersedia */}
      {activeTab === "stok" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Barang</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Satuan</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Diterima</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Didistribusikan</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Tersedia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stokItems.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada logistik diterima dari admin</td></tr>
              ) : (
                stokItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{item.namaBarang}</td>
                    <td className="px-4 py-3 text-gray-600">{item.satuan}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{item.diterima}</td>
                    <td className="px-4 py-3 text-right text-orange-600 font-medium">{item.didistribusikan}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${item.tersedia > 0 ? "text-blue-600" : "text-red-600"}`}>{item.tersedia}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Diterima dari Admin */}
      {activeTab === "diterima" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Barang</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Jumlah</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Satuan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {diterima.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada logistik diterima</td></tr>
              ) : (
                diterima.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{d.logistikItem.namaBarang}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">+{d.jumlah}</td>
                    <td className="px-4 py-3 text-gray-600">{d.logistikItem.satuan}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                    <td className="px-4 py-3 text-gray-600">{d.keterangan || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Distribusi ke Relawan */}
      {activeTab === "distribusi" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Barang</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Jumlah</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Satuan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Relawan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {didistribusikan.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada distribusi ke relawan</td></tr>
              ) : (
                didistribusikan.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{d.logistikItem.namaBarang}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-600">-{d.jumlah}</td>
                    <td className="px-4 py-3 text-gray-600">{d.logistikItem.satuan}</td>
                    <td className="px-4 py-3 font-medium">{d.relawan.namaLengkap}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                    <td className="px-4 py-3 text-gray-600">{d.keterangan || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Distribusi ke Relawan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <form onSubmit={handleSubmit} className="p-6">
              <h2 className="text-xl font-bold mb-4">Distribusi ke Relawan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Barang *</label>
                  <select
                    value={form.logistikItemId}
                    onChange={(e) => setForm({ ...form, logistikItemId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">-- Pilih Barang --</option>
                    {stokItems.filter((i) => i.tersedia > 0).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.namaBarang} — tersedia: {item.tersedia} {item.satuan}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relawan Penerima *</label>
                  <select
                    value={form.relawanId}
                    onChange={(e) => setForm({ ...form, relawanId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">-- Pilih Relawan --</option>
                    {relawanList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.namaLengkap} — {r.noHp}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah *</label>
                    <input type="number" min="1" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
                    <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Distribusikan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
