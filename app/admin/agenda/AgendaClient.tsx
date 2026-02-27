"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AgendaRespon {
  id: string;
  agendaId: string;
  calegId: string;
  status: "approve" | "reject" | null;
  waktuRespon: string | null;
}

interface Agenda {
  id: string;
  judul: string;
  deskripsi: string | null;
  lokasi: string | null;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  statusAktif: boolean;
  createdAt: string;
  respon: AgendaRespon[];
}

export default function AgendaClient({ initialAgendas }: { initialAgendas: Agenda[] }) {
  const [agendas, setAgendas] = useState<Agenda[]>(initialAgendas);
  const [showModal, setShowModal] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    lokasi: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
    statusAktif: true,
  });

  const filteredAgendas = agendas.filter((a) => {
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && a.statusAktif) ||
      (filterStatus === "inactive" && !a.statusAktif);
    const matchSearch =
      !search ||
      a.judul.toLowerCase().includes(search.toLowerCase()) ||
      a.lokasi?.toLowerCase().includes(search.toLowerCase()) ||
      a.deskripsi?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const upcomingAgendas = agendas.filter(
    (a) => new Date(a.tanggal) >= new Date() && a.statusAktif
  );
  const pastAgendas = agendas.filter(
    (a) => new Date(a.tanggal) < new Date()
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingAgenda
        ? `/api/admin/agenda/${editingAgenda.id}`
        : "/api/admin/agenda";
      const method = editingAgenda ? "PUT" : "POST";

      // Combine tanggal + waktu menjadi datetime
      const payload = {
        ...form,
        waktuMulai: form.tanggal && form.waktuMulai
          ? `${form.tanggal}T${form.waktuMulai}:00`
          : form.waktuMulai,
        waktuSelesai: form.tanggal && form.waktuSelesai
          ? `${form.tanggal}T${form.waktuSelesai}:00`
          : form.waktuSelesai,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingAgenda(null);
        setForm({
          judul: "",
          deskripsi: "",
          lokasi: "",
          tanggal: "",
          waktuMulai: "",
          waktuSelesai: "",
          statusAktif: true,
        });
        // Refresh data from API
        const data = await fetch("/api/admin/agenda").then((r) => r.json());
        if (Array.isArray(data)) {
          setAgendas(data);
        }
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan agenda");
      }
    } catch {
      alert("Terjadi kesalahan saat menyimpan agenda");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus agenda ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/agenda/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAgendas((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus agenda");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus agenda");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/agenda/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusAktif: !isActive }),
      });
      if (res.ok) {
        setAgendas((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, statusAktif: !isActive } : a
          )
        );
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengubah status agenda");
      }
    } catch {
      alert("Terjadi kesalahan saat mengubah status");
    } finally {
      setLoading(false);
    }
  }

  function extractTime(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return d.toTimeString().slice(0, 5); // "HH:MM"
    } catch {
      return "";
    }
  }

  function openEdit(agenda: Agenda) {
    setEditingAgenda(agenda);
    setForm({
      judul: agenda.judul,
      deskripsi: agenda.deskripsi || "",
      lokasi: agenda.lokasi || "",
      tanggal: agenda.tanggal.split("T")[0],
      waktuMulai: extractTime(agenda.waktuMulai),
      waktuSelesai: extractTime(agenda.waktuSelesai),
      statusAktif: agenda.statusAktif,
    });
    setShowModal(true);
  }

  function openCreate() {
    setEditingAgenda(null);
    setForm({
      judul: "",
      deskripsi: "",
      lokasi: "",
      tanggal: "",
      waktuMulai: "",
      waktuSelesai: "",
      statusAktif: true,
    });
    setShowModal(true);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Agenda Kegiatan</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Tambah Agenda
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Agenda</p>
              <p className="text-2xl font-bold text-gray-900">{agendas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agenda Akan Datang</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAgendas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agenda Lalu</p>
              <p className="text-2xl font-bold text-gray-900">{pastAgendas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari judul, lokasi, atau deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex-1 max-w-xs"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {/* Agenda Cards */}
      <div className="grid gap-4">
        {filteredAgendas.map((agenda) => {
          const isPast = new Date(agenda.tanggal) < new Date();
          const isToday = new Date(agenda.tanggal).toDateString() === new Date().toDateString();

          return (
            <div
              key={agenda.id}
              className={`bg-white rounded-xl border p-5 ${
                isPast ? "border-gray-200 bg-gray-50" : "border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{agenda.judul}</h3>
                    {agenda.statusAktif ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Nonaktif
                      </span>
                    )}
                    {isToday && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium animate-pulse">
                        Hari Ini
                      </span>
                    )}
                    {isPast && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Sudah Lewat
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{agenda.deskripsi}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(agenda.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatTime(agenda.waktuMulai)} - {formatTime(agenda.waktuSelesai)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span>{agenda.lokasi || "Tidak ada lokasi"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => openEdit(agenda)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleActive(agenda.id, agenda.statusAktif)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                    title="Toggle Status"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(agenda.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Hapus"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Respon Section */}
              {agenda.respon && agenda.respon.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Respon Caleg ({agenda.respon.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {agenda.respon.map((r) => (
                      <div key={r.id} className="flex items-center gap-1 text-sm">
                        {r.status === "approve" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Hadir
                          </span>
                        ) : r.status === "reject" ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Tidak Hadir
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Belum Respon
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAgendas.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Tidak ada agenda yang ditemukan</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">
                {editingAgenda ? "Edit Agenda" : "Tambah Agenda Baru"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Agenda *
                </label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.statusAktif ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, statusAktif: e.target.value === "true" })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Mulai *
                  </label>
                  <input
                    type="time"
                    value={form.waktuMulai}
                    onChange={(e) => setForm({ ...form, waktuMulai: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Selesai *
                  </label>
                  <input
                    type="time"
                    value={form.waktuSelesai}
                    onChange={(e) => setForm({ ...form, waktuSelesai: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Menyimpan..." : editingAgenda ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAgenda(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
