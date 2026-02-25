"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BuktiIsu {
  id: string;
  url: string;
  keterangan: string | null;
}

interface Isu {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  sumber: string | null;
  createdAt: string;
  buktiIsu: BuktiIsu[];
}

const kategoriOptions = [
  { value: "HOAX", label: "Hoax", color: "bg-red-100 text-red-700" },
  { value: "ISU_NEGATIF", label: "Isu Negatif", color: "bg-orange-100 text-orange-700" },
  { value: "BLACK_CAMPAIGN", label: "Black Campaign", color: "bg-purple-100 text-purple-700" },
  { value: "LAINNYA", label: "Lainnya", color: "bg-gray-100 text-gray-700" },
];

export default function IsuClient({ initialIsus }: { initialIsus: Isu[] }) {
  const [isus, setIsus] = useState(initialIsus);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Isu | null>(null);
  const [editingIsu, setEditingIsu] = useState<Isu | null>(null);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    kategori: "LAINNYA",
    sumber: "",
  });

  const [buktiList, setBuktiList] = useState<{ url: string; keterangan: string }[]>([]);

  const filteredIsus = isus.filter((isu) => {
    const matchKategori = !filterKategori || isu.kategori === filterKategori;
    const matchSearch =
      !search ||
      isu.judul.toLowerCase().includes(search.toLowerCase()) ||
      isu.deskripsi.toLowerCase().includes(search.toLowerCase());
    return matchKategori && matchSearch;
  });

  function addBukti() {
    setBuktiList([...buktiList, { url: "", keterangan: "" }]);
  }

  function removeBukti(idx: number) {
    setBuktiList(buktiList.filter((_, i) => i !== idx));
  }

  function updateBukti(idx: number, field: string, value: string) {
    setBuktiList(buktiList.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingIsu ? `/api/admin/isu/${editingIsu.id}` : "/api/admin/isu";
    const method = editingIsu ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, buktiList }),
    });

    if (res.ok) {
      closeModal();
      router.refresh();
      const data = await fetch("/api/admin/isu").then((r) => r.json());
      setIsus(data);
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan isu");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus isu ini?")) return;
    const res = await fetch(`/api/admin/isu/${id}`, { method: "DELETE" });
    if (res.ok) {
      setIsus((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  function openCreate() {
    setEditingIsu(null);
    setForm({ judul: "", deskripsi: "", kategori: "LAINNYA", sumber: "" });
    setBuktiList([]);
    setShowModal(true);
  }

  function openEdit(isu: Isu) {
    setEditingIsu(isu);
    setForm({
      judul: isu.judul,
      deskripsi: isu.deskripsi,
      kategori: isu.kategori,
      sumber: isu.sumber || "",
    });
    setBuktiList(
      isu.buktiIsu.map((b) => ({
        url: b.url,
        keterangan: b.keterangan || "",
      }))
    );
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingIsu(null);
    setForm({ judul: "", deskripsi: "", kategori: "LAINNYA", sumber: "" });
    setBuktiList([]);
  }

  function getKategoriStyle(kategori: string) {
    return kategoriOptions.find((k) => k.value === kategori)?.color || "bg-gray-100 text-gray-700";
  }

  function getKategoriLabel(kategori: string) {
    return kategoriOptions.find((k) => k.value === kategori)?.label || kategori;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Isu</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Tambah Isu
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari judul atau deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex-1 max-w-xs"
        />
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Kategori</option>
          {kategoriOptions.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      {/* Isu Cards */}
      <div className="grid gap-4">
        {filteredIsus.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            Belum ada data isu.
          </div>
        )}
        {filteredIsus.map((isu) => (
          <div key={isu.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{isu.judul}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getKategoriStyle(isu.kategori)}`}>
                    {getKategoriLabel(isu.kategori)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{isu.deskripsi}</p>
                {isu.sumber && (
                  <p className="text-xs text-gray-400 mt-1">
                    Sumber: <span className="text-gray-600">{isu.sumber}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setShowDetail(isu)}
                  className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                >
                  Detail
                </button>
                <button
                  onClick={() => openEdit(isu)}
                  className="px-3 py-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(isu.id)}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                {isu.buktiIsu.length} bukti terlampir
              </span>
              <span>{new Date(isu.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{showDetail.judul}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getKategoriStyle(showDetail.kategori)}`}>
                    {getKategoriLabel(showDetail.kategori)}
                  </span>
                </div>
                <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Deskripsi</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">{showDetail.deskripsi}</p>
                </div>

                {showDetail.sumber && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Sumber</h4>
                    <p className="text-gray-800">{showDetail.sumber}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Bukti ({showDetail.buktiIsu.length})
                  </h4>
                  {showDetail.buktiIsu.length === 0 ? (
                    <p className="text-sm text-gray-400">Belum ada bukti terlampir</p>
                  ) : (
                    <div className="space-y-2">
                      {showDetail.buktiIsu.map((bukti) => (
                        <div key={bukti.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <a
                              href={bukti.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm truncate block"
                            >
                              {bukti.url}
                            </a>
                            {bukti.keterangan && (
                              <p className="text-xs text-gray-500 mt-0.5">{bukti.keterangan}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-400">
                  Dibuat: {new Date(showDetail.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingIsu ? "Edit Isu" : "Tambah Isu Baru"}</h2>

              <div className="space-y-4">
                {/* Judul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Isu *</label>
                  <input
                    type="text"
                    value={form.judul}
                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Contoh: Isu hoax tentang..."
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {kategoriOptions.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
                  <textarea
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    placeholder="Jelaskan isu secara detail..."
                  />
                </div>

                {/* Sumber */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Isu</label>
                  <input
                    type="text"
                    value={form.sumber}
                    onChange={(e) => setForm({ ...form, sumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Dari mana isu ini berasal (medsos, chat, dsb)"
                  />
                </div>

                {/* Bukti */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Bukti / Lampiran</label>
                    <button
                      type="button"
                      onClick={addBukti}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Tambah Bukti
                    </button>
                  </div>

                  {buktiList.length === 0 && (
                    <p className="text-sm text-gray-400">Belum ada bukti ditambahkan</p>
                  )}

                  {buktiList.map((bukti, idx) => (
                    <div key={idx} className="flex gap-2 items-start mb-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="url"
                        placeholder="https://contoh.com/bukti-isu"
                        value={bukti.url}
                        onChange={(e) => updateBukti(idx, "url", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Keterangan"
                        value={bukti.keterangan}
                        onChange={(e) => updateBukti(idx, "keterangan", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeBukti(idx)}
                        className="px-2 py-2 text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingIsu ? "Simpan Perubahan" : "Tambah Isu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
