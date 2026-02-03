"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  namaLengkap: string;
  email: string | null;
  nomorHp: string | null;
  role: string;
  aktif: boolean;
  createdAt: string;
}

interface Wilayah {
  id: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
}

interface Koordinator {
  id: string;
  namaLengkap: string;
  user: { namaLengkap: string };
}

interface UsersClientProps {
  initialUsers: User[];
  wilayahList: Wilayah[];
  koordinatorList: Koordinator[];
}

export default function UsersClient({ initialUsers, wilayahList, koordinatorList }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role: "RELAWAN",
    wilayahId: "",
    koordinatorId: "",
  });

  const filteredUsers = users.filter((u) => {
    const matchRole = !filterRole || u.role === filterRole;
    const matchSearch = !search || u.namaLengkap.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    CALEG: "bg-blue-100 text-blue-700",
    KOORDINATOR: "bg-purple-100 text-purple-700",
    RELAWAN: "bg-green-100 text-green-700",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
    const method = editingUser ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingUser(null);
      setForm({ username: "", password: "", name: "", email: "", phone: "", role: "RELAWAN", wilayahId: "", koordinatorId: "" });
      router.refresh();
      const data = await fetch("/api/admin/users").then((r) => r.json());
      setUsers(data);
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan user");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus user ini?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  async function handleResetPassword(id: string) {
    const newPassword = prompt("Masukkan password baru:");
    if (!newPassword) return;
    const res = await fetch(`/api/admin/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    if (res.ok) {
      alert("Password berhasil direset");
    } else {
      alert("Gagal reset password");
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, aktif: !isActive } : u)));
    }
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: "",
      name: user.namaLengkap,
      email: user.email || "",
      phone: user.nomorHp || "",
      role: user.role,
      wilayahId: "",
      koordinatorId: "",
    });
    setShowModal(true);
  }

  function openCreate() {
    setEditingUser(null);
    setForm({ username: "", password: "", name: "", email: "", phone: "", role: "RELAWAN", wilayahId: "", koordinatorId: "" });
    setShowModal(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          + Tambah User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama atau username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex-1 max-w-xs"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Role</option>
          <option value="ADMIN">Admin</option>
          <option value="CALEG">Caleg</option>
          <option value="KOORDINATOR">Koordinator</option>
          <option value="RELAWAN">Relawan</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Username</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">No HP</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user, idx) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{user.namaLengkap}</td>
                <td className="px-4 py-3 text-gray-600">{user.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>{user.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.nomorHp || "-"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggleActive(user.id, user.aktif)} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${user.aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {user.aktif ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleResetPassword(user.id)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Reset Password">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">{editingUser ? "Edit User" : "Tambah User Baru"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required disabled={!!editingUser} />
                </div>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required={!editingUser} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="RELAWAN">Relawan</option>
                  <option value="KOORDINATOR">Koordinator</option>
                  <option value="CALEG">Caleg</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {(form.role === "KOORDINATOR" || form.role === "RELAWAN") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
                  <select value={form.wilayahId} onChange={(e) => setForm({ ...form, wilayahId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                    <option value="">Pilih Wilayah</option>
                    {wilayahList.map((w) => (
                      <option key={w.id} value={w.id}>{w.kecamatan}, {w.kelurahan} - {w.kabupaten}</option>
                    ))}
                  </select>
                </div>
              )}
              {form.role === "RELAWAN" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Koordinator</label>
                  <select value={form.koordinatorId} onChange={(e) => setForm({ ...form, koordinatorId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                    <option value="">Pilih Koordinator</option>
                    {koordinatorList.map((k) => (
                      <option key={k.id} value={k.id}>{k.namaLengkap}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                  {editingUser ? "Update" : "Simpan"}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
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
