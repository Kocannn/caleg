"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";

// ============ INTERFACES ============

interface Wilayah {
  id: string;
  namaWilayah: string;
  kecamatan: string;
  kelurahan: string;
}

interface Calon {
  id: string;
  nomorUrut: number;
  namaCalon: string;
  partai: string | null;
  foto: string | null;
}

interface HasilCount {
  id: string;
  calonId: string;
  jumlahSuara: number;
  calon: Calon;
}

interface Tps {
  id: string;
  nomorTps: string;
  wilayahId: string;
  alamat: string | null;
  jumlahDpt: number;
  wilayah: Wilayah;
  hasilCounts: HasilCount[];
}

interface CalonSummary extends Calon {
  totalSuara: number;
  persentase: string;
}

interface Summary {
  totalTps: number;
  tpsSudahInput: number;
  totalDpt: number;
  totalSuaraMasuk: number;
  perCalon: CalonSummary[];
}

interface WilayahOption {
  id: string;
  namaWilayah: string;
  kecamatan: string;
  kelurahan: string;
}

type TabType = "dashboard" | "tps" | "calon" | "input-suara";

const BAR_COLORS = [
  "bg-blue-500",
  "bg-red-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

// ============ COMPONENT ============

export default function QuickCountClient({
  initialTps,
  initialCalon,
  initialSummary,
  wilayahList,
}: {
  initialTps: Tps[];
  initialCalon: Calon[];
  initialSummary: Summary;
  wilayahList: WilayahOption[];
}) {
  const [tpsList, setTpsList] = useState(initialTps);
  const [calonList, setCalonList] = useState(initialCalon);
  const [summary, setSummary] = useState(initialSummary);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [search, setSearch] = useState("");

  // TPS form
  const [showTpsModal, setShowTpsModal] = useState(false);
  const [editingTps, setEditingTps] = useState<Tps | null>(null);
  const [tpsForm, setTpsForm] = useState({ nomorTps: "", wilayahId: "", alamat: "", jumlahDpt: "" });

  // Calon form
  const [showCalonModal, setShowCalonModal] = useState(false);
  const [editingCalon, setEditingCalon] = useState<Calon | null>(null);
  const [calonForm, setCalonForm] = useState({ nomorUrut: "", namaCalon: "", partai: "", foto: "" });

  // Input Suara form
  const [selectedTpsId, setSelectedTpsId] = useState("");
  const [suaraForm, setSuaraForm] = useState<{ [calonId: string]: string }>({});
  const [savingSuara, setSavingSuara] = useState(false);

  const router = useRouter();

  // ============ REFRESH DATA ============
  async function refreshData() {
    const res = await fetch("/api/admin/quick-count");
    if (res.ok) {
      const data = await res.json();
      setTpsList(data.tpsList);
      setCalonList(data.calonList);
      setSummary(data.summary);
    }
  }

  // ============ TPS CRUD ============
  function openCreateTps() {
    setEditingTps(null);
    setTpsForm({ nomorTps: "", wilayahId: "", alamat: "", jumlahDpt: "" });
    setShowTpsModal(true);
  }

  function openEditTps(tps: Tps) {
    setEditingTps(tps);
    setTpsForm({
      nomorTps: tps.nomorTps,
      wilayahId: tps.wilayahId,
      alamat: tps.alamat || "",
      jumlahDpt: String(tps.jumlahDpt),
    });
    setShowTpsModal(true);
  }

  async function handleTpsSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingTps ? `/api/admin/quick-count/tps/${editingTps.id}` : "/api/admin/quick-count/tps";
    const method = editingTps ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tpsForm),
    });

    if (res.ok) {
      setShowTpsModal(false);
      await refreshData();
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan TPS");
    }
  }

  async function handleDeleteTps(id: string) {
    if (!confirm("Yakin hapus TPS ini? Data suara terkait juga akan terhapus.")) return;
    const res = await fetch(`/api/admin/quick-count/tps/${id}`, { method: "DELETE" });
    if (res.ok) {
      await refreshData();
      router.refresh();
    }
  }

  // ============ CALON CRUD ============
  function openCreateCalon() {
    setEditingCalon(null);
    setCalonForm({ nomorUrut: "", namaCalon: "", partai: "", foto: "" });
    setShowCalonModal(true);
  }

  function openEditCalon(calon: Calon) {
    setEditingCalon(calon);
    setCalonForm({
      nomorUrut: String(calon.nomorUrut),
      namaCalon: calon.namaCalon,
      partai: calon.partai || "",
      foto: calon.foto || "",
    });
    setShowCalonModal(true);
  }

  async function handleCalonSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingCalon ? `/api/admin/quick-count/calon/${editingCalon.id}` : "/api/admin/quick-count/calon";
    const method = editingCalon ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(calonForm),
    });

    if (res.ok) {
      setShowCalonModal(false);
      await refreshData();
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan calon");
    }
  }

  async function handleDeleteCalon(id: string) {
    if (!confirm("Yakin hapus calon ini? Data suara terkait juga akan terhapus.")) return;
    const res = await fetch(`/api/admin/quick-count/calon/${id}`, { method: "DELETE" });
    if (res.ok) {
      await refreshData();
      router.refresh();
    }
  }

  // ============ INPUT SUARA ============
  function selectTpsForInput(tpsId: string) {
    setSelectedTpsId(tpsId);
    const tps = tpsList.find((t) => t.id === tpsId);
    const initialSuara: { [calonId: string]: string } = {};
    calonList.forEach((c) => {
      const existing = tps?.hasilCounts.find((h) => h.calonId === c.id);
      initialSuara[c.id] = existing ? String(existing.jumlahSuara) : "0";
    });
    setSuaraForm(initialSuara);
  }

  async function handleSuaraSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTpsId) return;
    setSavingSuara(true);

    const hasil = Object.entries(suaraForm).map(([calonId, jumlahSuara]) => ({
      calonId,
      jumlahSuara,
    }));

    const res = await fetch("/api/admin/quick-count/hasil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tpsId: selectedTpsId, hasil }),
    });

    setSavingSuara(false);

    if (res.ok) {
      alert("Data suara berhasil disimpan!");
      await refreshData();
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan data suara");
    }
  }

  // ============ FILTERS ============
  const filteredTps = tpsList.filter(
    (t) =>
      !search ||
      t.nomorTps.toLowerCase().includes(search.toLowerCase()) ||
      t.wilayah.namaWilayah.toLowerCase().includes(search.toLowerCase()) ||
      t.wilayah.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
      t.wilayah.kelurahan.toLowerCase().includes(search.toLowerCase())
  );

  const progressPersen =
    summary.totalTps > 0 ? ((summary.tpsSudahInput / summary.totalTps) * 100).toFixed(1) : "0.0";

  // ============ RENDER ============
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quick Count</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {(
          [
            { key: "dashboard", label: "Dashboard" },
            { key: "tps", label: "Kelola TPS" },
            { key: "calon", label: "Kelola Calon" },
            { key: "input-suara", label: "Input Suara" },
          ] as { key: TabType; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ DASHBOARD TAB ============ */}
      {activeTab === "dashboard" && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total TPS"
              value={summary.totalTps}
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            <StatCard
              title="TPS Sudah Input"
              value={`${summary.tpsSudahInput}/${summary.totalTps}`}
              color="green"
              change={`${progressPersen}% selesai`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Total DPT"
              value={summary.totalDpt.toLocaleString("id-ID")}
              color="purple"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <StatCard
              title="Total Suara Masuk"
              value={summary.totalSuaraMasuk.toLocaleString("id-ID")}
              color="yellow"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Progress Input TPS</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPersen}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {summary.tpsSudahInput} dari {summary.totalTps} TPS sudah diinput ({progressPersen}%)
            </p>
          </div>

          {/* Perolehan Suara Chart */}
          {summary.perCalon.length > 0 && (
            <div className="bg-white rounded-xl border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Perolehan Suara</h2>
              <div className="space-y-4">
                {summary.perCalon
                  .sort((a, b) => b.totalSuara - a.totalSuara)
                  .map((calon, idx) => (
                    <div key={calon.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {calon.nomorUrut}. {calon.namaCalon}
                          </span>
                          {calon.partai && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{calon.partai}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">{calon.totalSuara.toLocaleString("id-ID")}</span>
                          <span className="text-sm text-gray-500 ml-2">({calon.persentase}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                        <div
                          className={`h-8 rounded-full transition-all duration-700 flex items-center justify-end pr-2 ${BAR_COLORS[idx % BAR_COLORS.length]}`}
                          style={{ width: `${Math.max(parseFloat(calon.persentase), 1)}%` }}
                        >
                          <span className="text-xs font-bold text-white">{calon.persentase}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                Total suara masuk: <strong>{summary.totalSuaraMasuk.toLocaleString("id-ID")}</strong> |
                Berdasarkan {summary.tpsSudahInput} TPS dari {summary.totalTps} TPS
              </div>
            </div>
          )}

          {/* Per-TPS Results Table */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Per TPS</h2>
            {tpsList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada data TPS. Tambahkan TPS terlebih dahulu.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">TPS</th>
                      <th className="text-left p-3 font-semibold">Wilayah</th>
                      <th className="text-center p-3 font-semibold">DPT</th>
                      {calonList.map((c) => (
                        <th key={c.id} className="text-center p-3 font-semibold">
                          No. {c.nomorUrut}
                        </th>
                      ))}
                      <th className="text-center p-3 font-semibold">Total</th>
                      <th className="text-center p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tpsList.map((tps) => {
                      const totalSuaraTps = tps.hasilCounts.reduce((s, h) => s + h.jumlahSuara, 0);
                      const sudahInput = tps.hasilCounts.length > 0;
                      return (
                        <tr key={tps.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{tps.nomorTps}</td>
                          <td className="p-3 text-gray-600">
                            {tps.wilayah.kelurahan}, {tps.wilayah.kecamatan}
                          </td>
                          <td className="p-3 text-center">{tps.jumlahDpt}</td>
                          {calonList.map((c) => {
                            const hasil = tps.hasilCounts.find((h) => h.calonId === c.id);
                            return (
                              <td key={c.id} className="p-3 text-center font-medium">
                                {hasil ? hasil.jumlahSuara.toLocaleString("id-ID") : "-"}
                              </td>
                            );
                          })}
                          <td className="p-3 text-center font-bold">{totalSuaraTps > 0 ? totalSuaraTps.toLocaleString("id-ID") : "-"}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                sudahInput ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {sudahInput ? "Sudah Input" : "Belum"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ KELOLA TPS TAB ============ */}
      {activeTab === "tps" && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Cari TPS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm w-64"
            />
            <button
              onClick={openCreateTps}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + Tambah TPS
            </button>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-semibold">Nomor TPS</th>
                  <th className="text-left p-3 font-semibold">Wilayah</th>
                  <th className="text-left p-3 font-semibold">Alamat</th>
                  <th className="text-center p-3 font-semibold">DPT</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                  <th className="text-center p-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Belum ada data TPS
                    </td>
                  </tr>
                ) : (
                  filteredTps.map((tps) => (
                    <tr key={tps.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{tps.nomorTps}</td>
                      <td className="p-3 text-gray-600">
                        {tps.wilayah.namaWilayah} - {tps.wilayah.kelurahan}, {tps.wilayah.kecamatan}
                      </td>
                      <td className="p-3 text-gray-600">{tps.alamat || "-"}</td>
                      <td className="p-3 text-center">{tps.jumlahDpt}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tps.hasilCounts.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {tps.hasilCounts.length > 0 ? "Sudah Input" : "Belum"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openEditTps(tps)}
                          className="text-blue-600 hover:underline text-sm mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTps(tps.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ KELOLA CALON TAB ============ */}
      {activeTab === "calon" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Data Calon</h2>
            <button
              onClick={openCreateCalon}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + Tambah Calon
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calonList.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border">
                Belum ada data calon. Tambahkan calon terlebih dahulu.
              </div>
            ) : (
              calonList.map((calon) => (
                <div key={calon.id} className="bg-white rounded-xl border p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                          No. {calon.nomorUrut}
                        </span>
                        {calon.partai && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                            {calon.partai}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2">{calon.namaCalon}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCalon(calon)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCalon(calon.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Summary suara for this calon */}
                  {summary.perCalon.find((c) => c.id === calon.id) && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      Suara:{" "}
                      <strong className="text-gray-900">
                        {summary.perCalon.find((c) => c.id === calon.id)!.totalSuara.toLocaleString("id-ID")}
                      </strong>{" "}
                      ({summary.perCalon.find((c) => c.id === calon.id)!.persentase}%)
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============ INPUT SUARA TAB ============ */}
      {activeTab === "input-suara" && (
        <div>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Suara per TPS</h2>

            {calonList.length === 0 || tpsList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {calonList.length === 0 && tpsList.length === 0
                  ? "Tambahkan data calon dan TPS terlebih dahulu."
                  : calonList.length === 0
                  ? "Tambahkan data calon terlebih dahulu."
                  : "Tambahkan data TPS terlebih dahulu."}
              </p>
            ) : (
              <>
                {/* TPS Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih TPS</label>
                  <select
                    value={selectedTpsId}
                    onChange={(e) => selectTpsForInput(e.target.value)}
                    className="border rounded-lg px-4 py-2 text-sm w-full max-w-md"
                  >
                    <option value="">-- Pilih TPS --</option>
                    {tpsList.map((tps) => (
                      <option key={tps.id} value={tps.id}>
                        {tps.nomorTps} - {tps.wilayah.kelurahan}, {tps.wilayah.kecamatan}
                        {tps.hasilCounts.length > 0 ? " ✓" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTpsId && (
                  <form onSubmit={handleSuaraSubmit}>
                    <div className="space-y-4 mb-6">
                      {calonList.map((calon) => (
                        <div key={calon.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900">
                              No. {calon.nomorUrut} - {calon.namaCalon}
                            </span>
                            {calon.partai && (
                              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                {calon.partai}
                              </span>
                            )}
                          </div>
                          <div className="w-36">
                            <input
                              type="number"
                              min="0"
                              value={suaraForm[calon.id] || "0"}
                              onChange={(e) =>
                                setSuaraForm({ ...suaraForm, [calon.id]: e.target.value })
                              }
                              className="border rounded-lg px-3 py-2 text-sm w-full text-center font-medium"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4 mb-4">
                      <span className="font-semibold text-blue-900">Total Suara</span>
                      <span className="font-bold text-blue-700 text-lg">
                        {Object.values(suaraForm)
                          .reduce((s, v) => s + (parseInt(v) || 0), 0)
                          .toLocaleString("id-ID")}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={savingSuara}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {savingSuara ? "Menyimpan..." : "Simpan Suara"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ============ TPS MODAL ============ */}
      {showTpsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">{editingTps ? "Edit TPS" : "Tambah TPS"}</h2>
            <form onSubmit={handleTpsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor TPS *</label>
                <input
                  type="text"
                  value={tpsForm.nomorTps}
                  onChange={(e) => setTpsForm({ ...tpsForm, nomorTps: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  placeholder="TPS 001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah *</label>
                <select
                  value={tpsForm.wilayahId}
                  onChange={(e) => setTpsForm({ ...tpsForm, wilayahId: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  required
                >
                  <option value="">-- Pilih Wilayah --</option>
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.namaWilayah} - {w.kelurahan}, {w.kecamatan}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <input
                  type="text"
                  value={tpsForm.alamat}
                  onChange={(e) => setTpsForm({ ...tpsForm, alamat: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  placeholder="Alamat TPS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah DPT</label>
                <input
                  type="number"
                  min="0"
                  value={tpsForm.jumlahDpt}
                  onChange={(e) => setTpsForm({ ...tpsForm, jumlahDpt: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTpsModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {editingTps ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ CALON MODAL ============ */}
      {showCalonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">{editingCalon ? "Edit Calon" : "Tambah Calon"}</h2>
            <form onSubmit={handleCalonSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Urut *</label>
                <input
                  type="number"
                  min="1"
                  value={calonForm.nomorUrut}
                  onChange={(e) => setCalonForm({ ...calonForm, nomorUrut: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  placeholder="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Calon *</label>
                <input
                  type="text"
                  value={calonForm.namaCalon}
                  onChange={(e) => setCalonForm({ ...calonForm, namaCalon: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  placeholder="Nama lengkap calon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partai</label>
                <input
                  type="text"
                  value={calonForm.partai}
                  onChange={(e) => setCalonForm({ ...calonForm, partai: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  placeholder="Nama partai (opsional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto</label>
                <input
                  type="text"
                  value={calonForm.foto}
                  onChange={(e) => setCalonForm({ ...calonForm, foto: e.target.value })}
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCalonModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {editingCalon ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
