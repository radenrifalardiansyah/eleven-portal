"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Lock, LayoutGrid, List, Pencil, Trash2, Plus, Search } from "lucide-react";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Tooltip from "@/components/admin/Tooltip";
import RoleForm from "@/components/admin/roles-master/RoleForm";
import { ICON_MAP } from "@/components/admin/icon-map";
import { deactivateRole, moveRole } from "@/app/admin/(dashboard)/role-master/actions";
import type { RoleRow } from "@/lib/cms/roles";
import type { AdminUser } from "@/lib/cms/users";

type FormModalState = { mode: "create" } | { mode: "edit"; item: RoleRow } | null;

export default function RoleMasterClient({
  roles,
  users,
  canEdit,
  canDelete,
}: {
  roles: RoleRow[];
  users: AdminUser[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "card">("table");
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [pendingDelete, setPendingDelete] = useState<RoleRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [movingKey, setMovingKey] = useState<string | null>(null);

  function toggleExpanded(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const sortedAll = useMemo(() => [...roles].sort((a, b) => a.sort_order - b.sort_order), [roles]);

  async function handleMove(key: string, direction: "up" | "down") {
    setMovingKey(key);
    try {
      await moveRole(key, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan role");
    } finally {
      setMovingKey(null);
    }
  }

  const usersByRole = useMemo(() => {
    const map = new Map<string, AdminUser[]>();
    for (const u of users) {
      const list = map.get(u.role) ?? [];
      list.push(u);
      map.set(u.role, list);
    }
    return map;
  }, [users]);

  const filtered = search.trim()
    ? sortedAll.filter(
        (r) =>
          r.label.toLowerCase().includes(search.toLowerCase()) || r.key.toLowerCase().includes(search.toLowerCase())
      )
    : sortedAll;

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deactivateRole(pendingDelete.key);
      toast.success("Role dinonaktifkan");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menonaktifkan role");
    } finally {
      setDeleting(false);
    }
  }

  function handleFormSuccess() {
    setFormModal(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari role..."
            className="w-full rounded-xl border border-ink-900/10 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-ink-900/10 bg-white p-1">
            <button
              onClick={() => setView("table")}
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                view === "table" ? "bg-brand-blue/10 text-brand-blue" : "text-ink-500 hover:bg-ink-900/5"
              }`}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("card")}
              className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                view === "card" ? "bg-brand-blue/10 text-brand-blue" : "text-ink-500 hover:bg-ink-900/5"
              }`}
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          {canEdit && (
            <button
              onClick={() => setFormModal({ mode: "create" })}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Tambah Role
            </button>
          )}
        </div>
      </div>

      {view === "table" ? (
      <div className="overflow-x-auto rounded-2xl border border-ink-900/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-900/5 bg-ink-900/[0.02]">
            <tr>
              {["expand", "Role", "Key", "Urutan", "Pengguna", "Hak Akses", "actions"].map((h, i) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500"
                >
                  {i === 0 || i === 6 ? "" : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((role) => {
              const Icon = ICON_MAP[role.icon];
              const isSuperAdmin = role.key === "super_admin";
              const roleUsers = usersByRole.get(role.key) ?? [];
              const isExpanded = expanded.has(role.key);
              return (
                <Fragment key={role.key}>
                  <tr className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.015]">
                    <td className="w-10 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(role.key)}
                        className="grid h-6 w-6 place-items-center rounded text-ink-400 hover:bg-ink-900/5 hover:text-ink-700"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-ink-900">
                        {Icon && <Icon className="h-4 w-4 text-ink-500" />}
                        {role.label}
                        {isSuperAdmin && (
                          <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-medium text-brand-blue">
                            Super Admin
                          </span>
                        )}
                        {!role.is_active && (
                          <span className="rounded-full bg-ink-900/10 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-ink-900/[0.04] px-1.5 py-0.5 text-xs text-ink-700">{role.key}</code>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const index = sortedAll.findIndex((r) => r.key === role.key);
                        return (
                          <div className="flex items-center gap-1">
                            <span className="text-ink-500">#{index + 1}</span>
                            {canEdit && (
                              <div className="flex flex-col">
                                <button
                                  disabled={movingKey === role.key || index === 0}
                                  onClick={() => handleMove(role.key, "up")}
                                  className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  disabled={movingKey === role.key || index === sortedAll.length - 1}
                                  onClick={() => handleMove(role.key, "down")}
                                  className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{roleUsers.length} pengguna</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/roles?role=${role.key}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-900/10 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-blue/30 hover:bg-brand-blue/5 hover:text-brand-blue"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Hak Akses
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && !isSuperAdmin && (
                          <Tooltip label="Edit">
                            <button
                              onClick={() => setFormModal({ mode: "edit", item: role })}
                              aria-label="Edit"
                              className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        )}
                        {canDelete && !isSuperAdmin && role.is_active && roleUsers.length === 0 && (
                          <Tooltip label="Nonaktifkan">
                            <button
                              onClick={() => setPendingDelete(role)}
                              aria-label="Nonaktifkan"
                              className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-ink-900/5 bg-ink-900/[0.015]">
                      <td colSpan={7} className="px-4 py-3">
                        {roleUsers.length === 0 ? (
                          <p className="text-sm text-ink-500">Belum ada pengguna dengan role ini.</p>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {roleUsers.map((u) => (
                              <div
                                key={u.id}
                                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm"
                              >
                                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-blue-light text-xs font-semibold text-white">
                                  {(u.fullName ?? u.email ?? "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-ink-900">{u.fullName ?? "-"}</p>
                                  <p className="truncate text-xs text-ink-500">{u.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-500">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((role) => {
            const Icon = ICON_MAP[role.icon];
            const isSuperAdmin = role.key === "super_admin";
            const roleUsers = usersByRole.get(role.key) ?? [];
            const isExpanded = expanded.has(role.key);
            const index = sortedAll.findIndex((r) => r.key === role.key);
            return (
              <div
                key={role.key}
                className="flex flex-col gap-3 rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-blue/10">
                      {Icon && <Icon className="h-4 w-4 text-brand-blue" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-semibold text-ink-900">{role.label}</p>
                      <code className="text-xs text-ink-500">{role.key}</code>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex shrink-0 flex-col">
                      <button
                        disabled={movingKey === role.key || index === 0}
                        onClick={() => handleMove(role.key, "up")}
                        className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={movingKey === role.key || index === sortedAll.length - 1}
                        onClick={() => handleMove(role.key, "down")}
                        className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {isSuperAdmin && (
                    <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-medium text-brand-blue">
                      Super Admin
                    </span>
                  )}
                  {!role.is_active && (
                    <span className="rounded-full bg-ink-900/10 px-2 py-0.5 text-[10px] font-medium text-ink-500">
                      Nonaktif
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpanded(role.key)}
                  className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900"
                >
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                  {roleUsers.length} pengguna
                </button>

                {isExpanded && (
                  <div className="space-y-2 rounded-xl bg-ink-900/[0.02] p-2">
                    {roleUsers.length === 0 ? (
                      <p className="px-1 py-1 text-xs text-ink-500">Belum ada pengguna dengan role ini.</p>
                    ) : (
                      roleUsers.map((u) => (
                        <div key={u.id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 shadow-sm">
                          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-blue-light text-[10px] font-semibold text-white">
                            {(u.fullName ?? u.email ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-ink-900">{u.fullName ?? "-"}</p>
                            <p className="truncate text-[11px] text-ink-500">{u.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <Link
                  href={`/admin/roles?role=${role.key}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink-900/10 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-blue/30 hover:bg-brand-blue/5 hover:text-brand-blue"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Hak Akses
                </Link>

                {(canEdit || canDelete) && !isSuperAdmin && (
                  <div className="flex gap-2 border-t border-ink-900/5 pt-3">
                    {canEdit && (
                      <button
                        onClick={() => setFormModal({ mode: "edit", item: role })}
                        className="flex-1 rounded-lg border border-ink-900/10 py-1.5 text-center text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && role.is_active && roleUsers.length === 0 && (
                      <button
                        onClick={() => setPendingDelete(role)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Nonaktifkan
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="col-span-full py-10 text-center text-sm text-ink-500">Tidak ada data.</p>}
        </div>
      )}

      <Modal
        open={!!formModal}
        onClose={() => setFormModal(null)}
        title={formModal?.mode === "edit" ? "Edit Role" : "Tambah Role"}
        description={formModal?.mode === "edit" ? formModal.item.label : "Tambahkan role baru sebagai master data."}
      >
        {formModal && (
          <RoleForm
            key={formModal.mode === "edit" ? formModal.item.key : "create"}
            defaultValues={formModal.mode === "edit" ? formModal.item : undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setFormModal(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Nonaktifkan role "${pendingDelete?.label}"?`}
        confirmLabel="Nonaktifkan"
        description="Role tidak bisa dinonaktifkan jika masih ada pengguna dengan role ini. Role yang sudah dinonaktifkan tidak akan muncul di pilihan role baru."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
