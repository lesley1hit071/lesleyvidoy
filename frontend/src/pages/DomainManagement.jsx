import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { API_BASE_URL } from "../config";
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

function DomainManagement() {
  const { token, onUnauthorized } = useOutletContext();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add Domain form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addActive, setAddActive] = useState(true);
  const [adding, setAdding] = useState(false);

  // Edit Domain state
  const [editingDomain, setEditingDomain] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDomains = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/domains`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        onUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data domain");
      }

      setDomains(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!addUrl.trim()) return;

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/domains`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addName.trim(),
          url: addUrl.trim(),
          is_active: addActive,
        }),
      });

      if (res.status === 401) {
        onUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menambahkan domain");
      }

      setAddName("");
      setAddUrl("");
      setAddActive(true);
      setShowAddModal(false);
      setSuccess("Domain berhasil ditambahkan!");
      fetchDomains();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (dom) => {
    setEditingDomain(dom);
    setEditName(dom.name || "");
    setEditUrl(dom.url || "");
    setEditActive(!!dom.is_active);
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDomain || !editUrl.trim()) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/domains/${editingDomain.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          url: editUrl.trim(),
          is_active: editActive,
        }),
      });

      if (res.status === 401) {
        onUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui domain");
      }

      setEditingDomain(null);
      setSuccess("Domain berhasil diperbarui!");
      fetchDomains();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (dom, nextStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/domains/${dom.id}/active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: nextStatus,
        }),
      });

      if (res.status === 401) {
        onUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengubah status domain");
      }

      setDomains((prev) =>
        prev.map((item) =>
          item.id === dom.id ? { ...item, is_active: nextStatus ? 1 : 0 } : item,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus domain ini?")) return;

    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/domains/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        onUnauthorized();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus domain");
      }

      setSuccess("Domain berhasil dihapus!");
      setDomains((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Manajemen Domain
              </h2>
              <p className="text-xs text-slate-500">
                Kelola daftar domain untuk generator dan tombol copy shortlink
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDomains}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              title="Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-sky-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Domain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Nama / Label</th>
                <th className="px-4 py-3">URL Domain</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {domains.length === 0 && !loading && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-slate-500"
                    colSpan={4}
                  >
                    Belum ada domain terdaftar. Klik tombol{" "}
                    <strong>Tambah Domain</strong> untuk menambahkan domain baru.
                  </td>
                </tr>
              )}
              {domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {dom.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={dom.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-sky-600 hover:underline flex items-center gap-1"
                      >
                        {dom.url}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <span className="text-xs text-slate-600">
                        {dom.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={!!dom.is_active}
                        onChange={(e) =>
                          handleToggleActive(dom, e.target.checked)
                        }
                      />
                      <span className="relative h-4 w-7 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500">
                        <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow transition peer-checked:translate-x-3" />
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(dom)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(dom.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-semibold text-slate-800">
                Tambah Domain Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  URL Domain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. http://cdn.videycz.my.id atau https://domain.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  value={addUrl}
                  onChange={(e) => {
                    setAddUrl(e.target.value);
                    if (!addName) {
                      // auto fill name if still empty
                      const clean = e.target.value.replace(/^https?:\/\//, "");
                      if (clean) setAddName(clean);
                    }
                  }}
                />
                <span className="text-[11px] text-slate-400">
                  Protokol (http/https) akan otomatis ditambahkan jika tidak disertakan.
                </span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Nama / Label Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. cdn.videycz.my.id"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="addActiveCheckbox"
                  type="checkbox"
                  checked={addActive}
                  onChange={(e) => setAddActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label
                  htmlFor="addActiveCheckbox"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Aktifkan domain ini langsung
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition"
                >
                  {adding ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>{adding ? "Menyimpan..." : "Simpan Domain"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Domain Modal */}
      {editingDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-semibold text-slate-800">
                Edit Domain
              </h3>
              <button
                onClick={() => setEditingDomain(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  URL Domain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. http://cdn.videycz.my.id"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Nama / Label Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. cdn.videycz.my.id"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="editActiveCheckbox"
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label
                  htmlFor="editActiveCheckbox"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Domain Aktif
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setEditingDomain(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition"
                >
                  {updating ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>{updating ? "Memperbarui..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DomainManagement;
