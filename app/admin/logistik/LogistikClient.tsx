"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LogistikMasukItem {
  id: string;
  logistikItemId: string;
  jumlah: number;
  tanggal: string;
  keterangan: string | null;
  createdAt: string;
  logistikItem?: { namaBarang: string; satuan: string };
}

interface DistribusiItem {
  id: string;
  logistikItemId: string;
  jumlah: number;
  tanggal: string;
  koordinatorId: string;
  keterangan: string | null;
  createdAt: string;
  koordinator: {
    namaLengkap: string;
    noHp: string;
    wilayah: { namaWilayah: string };
  };
  logistikItem?: { namaBarang: string; satuan: string };
}

interface LogistikItemData {
  id: string;
  namaBarang: string;
  satuan: string;
  deskripsi: string | null;
  createdAt: string;
  totalMasuk: number;
  totalKeluar: number;
  stokTersedia: number;
  logistikMasuk: LogistikMasukItem[];
  logistikDistribusi: DistribusiItem[];
}

interface KoordinatorOption {
  id: string;
  namaLengkap: string;
  noHp: string;
  wilayah: { namaWilayah: string };
}

type TabType = "barang" | "masuk" | "distribusi";

export default function LogistikClient({
  initialItems,
  koordinatorList,
}: {
  initialItems: LogistikItemData[];
  koordinatorList: KoordinatorOption[];
}) {
  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState<TabType>("barang");
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMasukModal, setShowMasukModal] = useState(false);
  const [showDistribusiModal, setShowDistribusiModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LogistikItemData | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [itemForm, setItemForm] = useState({ namaBarang: "", satuan: "", deskripsi: "" });
  const [masukForm, setMasukForm] = useState({
    logistikItemId: "",
    jumlah: "",
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: "",
  });
  const [distribusiForm, setDistribusiForm] = useState({
    logistikItemId: "",
    jumlah: "",
    tanggal: new Date().toISOString().slice(0, 10),
    koordinatorId: "",
    keterangan: "",
  });

  // Stats
  const totalItems = items.length;
  const totalStokMasuk = items.reduce((sum, i) => sum + i.totalMasuk, 0);
  const totalDistribusi = items.reduce((sum, i) => sum + i.totalKeluar, 0);
  const totalTersedia = items.reduce((sum, i) => sum + i.stokTersedia, 0);

  // All masuk records flattened
  const allMasuk = items.flatMap((item) =>
    item.logistikMasuk.map((m) => ({
      ...m,
      namaBarang: item.namaBarang,
      satuan: item.satuan,
    }))
  ).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // All distribusi records flattened
  const allDistribusi = items.flatMap((item) =>
    item.logistikDistribusi.map((d) => ({
      ...d,
      namaBarang: item.namaBarang,
      satuan: item.satuan,
    }))
  ).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const filteredItems = items.filter((item) =>
    !search || item.namaBarang.toLowerCase().includes(search.toLowerCase())
  );

  async function refreshData() {
    const res = await fetch("/api/admin/logistik");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    router.refresh();
  }

  // === ITEM CRUD ===
  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingItem ? `/api/admin/logistik/${editingItem.id}` : "/api/admin/logistik";
    const method = editingItem ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });
    if (res.ok) {
      closeItemModal();
      refreshData();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan");
    }
  }

  async function handleItemDelete(id: string) {
    if (!confirm("Yakin hapus barang ini? Semua data stok masuk dan distribusi terkait akan ikut terhapus.")) return;
    const res = await fetch(`/api/admin/logistik/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      alert("Gagal menghapus");
    }
  }

  function openCreateItem() {
    setEditingItem(null);
    setItemForm({ namaBarang: "", satuan: "", deskripsi: "" });
    setShowItemModal(true);
  }

  function openEditItem(item: LogistikItemData) {
    setEditingItem(item);
    setItemForm({ namaBarang: item.namaBarang, satuan: item.satuan, deskripsi: item.deskripsi || "" });
    setShowItemModal(true);
  }

  function closeItemModal() {
    setShowItemModal(false);
    setEditingItem(null);
    setItemForm({ namaBarang: "", satuan: "", deskripsi: "" });
  }

  // === MASUK ===
  async function handleMasukSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/logistik/masuk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(masukForm),
    });
    if (res.ok) {
      setShowMasukModal(false);
      setMasukForm({ logistikItemId: "", jumlah: "", tanggal: new Date().toISOString().slice(0, 10), keterangan: "" });
      refreshData();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan");
    }
  }

  // === DISTRIBUSI ===
  async function handleDistribusiSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/logistik/distribusi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(distribusiForm),
    });
    if (res.ok) {
      setShowDistribusiModal(false);
      setDistribusiForm({ logistikItemId: "", jumlah: "", tanggal: new Date().toISOString().slice(0, 10), koordinatorId: "", keterangan: "" });
      refreshData();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan");
    }
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "barang", label: "Data Barang", count: totalItems },
    { key: "masuk", label: "Stok Masuk", count: allMasuk.length },
    { key: "distribusi", label: "Distribusi ke Koordinator", count: allDistribusi.length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Logistik</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jenis Barang</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Masuk</p>
              <p className="text-2xl font-bold text-green-600">{totalStokMasuk}</p>
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
              <p className="text-sm text-gray-500">Total Keluar</p>
              <p className="text-2xl font-bold text-orange-600">{totalDistribusi}</p>
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
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Action */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Cari barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm max-w-xs"
        />
        {activeTab === "barang" && (
          <button onClick={openCreateItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
            + Tambah Barang
          </button>
        )}
        {activeTab === "masuk" && (
          <button onClick={() => setShowMasukModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
            + Stok Masuk
          </button>
        )}
        {activeTab === "distribusi" && (
          <button onClick={() => setShowDistribusiModal(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm">
            + Distribusi ke Koordinator
          </button>
        )}
      </div>

      {/* TAB: Data Barang */}
      {activeTab === "barang" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Nama Barang</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Satuan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Deskripsi</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Stok Masuk</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Didistribusikan</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Tersedia</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 text-xs uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Belum ada data barang</td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.namaBarang}</td>
                    <td className="px-4 py-3 text-gray-600">{item.satuan}</td>
                    <td className="px-4 py-3 text-gray-600">{item.deskripsi || "-"}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">{item.totalMasuk}</td>
                    <td className="px-4 py-3 text-right font-medium text-orange-600">{item.totalKeluar}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${item.stokTersedia > 0 ? "text-blue-600" : "text-red-600"}`}>
                        {item.stokTersedia}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditItem(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleItemDelete(item.id)} className="text-red-600 hover:text-red-800 p-1" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Stok Masuk */}
      {activeTab === "masuk" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Barang</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Jumlah</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Satuan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allMasuk.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada data stok masuk</td>
                </tr>
              ) : (
                allMasuk.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.namaBarang}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">+{m.jumlah}</td>
                    <td className="px-4 py-3 text-gray-600">{m.satuan}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(m.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.keterangan || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Distribusi ke Koordinator */}
      {activeTab === "distribusi" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Barang</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase">Jumlah</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Satuan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Koordinator</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Wilayah</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allDistribusi.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Belum ada data distribusi</td>
                </tr>
              ) : (
                allDistribusi.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.namaBarang}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-600">-{d.jumlah}</td>
                    <td className="px-4 py-3 text-gray-600">{d.satuan}</td>
                    <td className="px-4 py-3 font-medium">{d.koordinator?.namaLengkap}</td>
                    <td className="px-4 py-3 text-gray-600">{d.koordinator?.wilayah?.namaWilayah}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.keterangan || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Tambah/Edit Barang */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <form onSubmit={handleItemSubmit} className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingItem ? "Edit Barang" : "Tambah Barang Baru"}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang *</label>
                  <input
                    type="text"
                    value={itemForm.namaBarang}
                    onChange={(e) => setItemForm({ ...itemForm, namaBarang: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Contoh: Beras, Minyak Goreng, Gula, dll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan *</label>
                  <input
                    type="text"
                    value={itemForm.satuan}
                    onChange={(e) => setItemForm({ ...itemForm, satuan: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Contoh: kg, pcs, pak, liter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={itemForm.deskripsi}
                    onChange={(e) => setItemForm({ ...itemForm, deskripsi: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    placeholder="Keterangan tambahan (opsional)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={closeItemModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  {editingItem ? "Simpan Perubahan" : "Tambah Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stok Masuk */}
      {showMasukModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <form onSubmit={handleMasukSubmit} className="p-6">
              <h2 className="text-xl font-bold mb-4">Tambah Stok Masuk</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Barang *</label>
                  <select
                    value={masukForm.logistikItemId}
                    onChange={(e) => setMasukForm({ ...masukForm, logistikItemId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">-- Pilih Barang --</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.namaBarang} ({item.satuan})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah *</label>
                    <input
                      type="number"
                      min="1"
                      value={masukForm.jumlah}
                      onChange={(e) => setMasukForm({ ...masukForm, jumlah: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
                    <input
                      type="date"
                      value={masukForm.tanggal}
                      onChange={(e) => setMasukForm({ ...masukForm, tanggal: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea
                    value={masukForm.keterangan}
                    onChange={(e) => setMasukForm({ ...masukForm, keterangan: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    placeholder="Sumber/asal barang (opsional)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowMasukModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  Simpan Stok Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Distribusi ke Koordinator */}
      {showDistribusiModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <form onSubmit={handleDistribusiSubmit} className="p-6">
              <h2 className="text-xl font-bold mb-4">Distribusi ke Koordinator</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Barang *</label>
                  <select
                    value={distribusiForm.logistikItemId}
                    onChange={(e) => setDistribusiForm({ ...distribusiForm, logistikItemId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">-- Pilih Barang --</option>
                    {items.filter((i) => i.stokTersedia > 0).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.namaBarang} — tersedia: {item.stokTersedia} {item.satuan}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Koordinator Penerima *</label>
                  <select
                    value={distribusiForm.koordinatorId}
                    onChange={(e) => setDistribusiForm({ ...distribusiForm, koordinatorId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">-- Pilih Koordinator --</option>
                    {koordinatorList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaLengkap} — {k.wilayah.namaWilayah}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah *</label>
                    <input
                      type="number"
                      min="1"
                      value={distribusiForm.jumlah}
                      onChange={(e) => setDistribusiForm({ ...distribusiForm, jumlah: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
                    <input
                      type="date"
                      value={distribusiForm.tanggal}
                      onChange={(e) => setDistribusiForm({ ...distribusiForm, tanggal: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea
                    value={distribusiForm.keterangan}
                    onChange={(e) => setDistribusiForm({ ...distribusiForm, keterangan: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    placeholder="Catatan distribusi (opsional)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowDistribusiModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium">
                  Distribusikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
