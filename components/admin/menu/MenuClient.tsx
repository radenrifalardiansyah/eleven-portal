"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Search } from "lucide-react";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import MenuItemForm from "@/components/admin/menu/MenuItemForm";
import { ICON_MAP } from "@/components/admin/icon-map";
import { deleteMenuItem, moveMenuItem } from "@/app/admin/(dashboard)/menu-struktur/actions";
import type { MenuGroupRow, MenuItemRow } from "@/lib/cms/menu";

type FormModalState = { mode: "create" } | { mode: "edit"; item: MenuItemRow } | null;

export default function MenuClient({
  groups,
  items,
  canEdit,
  canDelete,
}: {
  groups: MenuGroupRow[];
  items: MenuItemRow[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [pendingDelete, setPendingDelete] = useState<MenuItemRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  const labelById = useMemo(() => new Map(items.map((i) => [i.id, i.label])), [items]);

  const filtered = search.trim()
    ? items.filter(
        (i) =>
          i.label.toLowerCase().includes(search.toLowerCase()) ||
          i.href.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  async function handleMove(id: string, direction: "up" | "down") {
    setMovingId(id);
    try {
      await moveMenuItem(id, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan menu");
    } finally {
      setMovingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteMenuItem(pendingDelete.id);
      toast.success("Menu dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus menu");
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
            placeholder="Cari menu..."
            className="w-full rounded-xl border border-ink-900/10 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
        {canEdit && (
          <button
            onClick={() => setFormModal({ mode: "create" })}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Tambah Menu
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-900/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-900/5 bg-ink-900/[0.02]">
            <tr>
              {["#", "Label", "Href", "Induk", "Urutan", "Flag", ""].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const groupItems = filtered
                .filter((i) => i.group_id === group.id)
                .sort((a, b) => a.sort_order - b.sort_order);
              if (groupItems.length === 0) return null;
              return (
                <>
                  <tr key={`group-${group.id}`} className="border-b border-ink-900/5 bg-ink-900/[0.02]">
                    <td colSpan={7} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {group.label}
                    </td>
                  </tr>
                  {groupItems.map((item, index) => {
                    const Icon = ICON_MAP[item.icon];
                    return (
                      <tr key={item.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.015]">
                        <td className="px-4 py-3 text-ink-500">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-medium text-ink-900">
                            {Icon && <Icon className="h-4 w-4 text-ink-500" />}
                            {item.label}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-500">{item.href}</td>
                        <td className="px-4 py-3 text-ink-500">
                          {item.parent_id ? labelById.get(item.parent_id) ?? "—" : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="text-ink-500">#{index + 1}</span>
                            {canEdit && (
                              <div className="flex flex-col">
                                <button
                                  disabled={movingId === item.id || index === 0}
                                  onClick={() => handleMove(item.id, "up")}
                                  className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  disabled={movingId === item.id || index === groupItems.length - 1}
                                  onClick={() => handleMove(item.id, "down")}
                                  className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.always_visible && (
                              <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-medium text-brand-blue">
                                Selalu Terlihat
                              </span>
                            )}
                            {item.show_bottom_nav && (
                              <span className="rounded-full bg-ink-900/10 px-2 py-0.5 text-xs font-medium text-ink-700">
                                Bottom Nav
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <button
                                onClick={() => setFormModal({ mode: "edit", item })}
                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setPendingDelete(item)}
                                className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!formModal}
        onClose={() => setFormModal(null)}
        title={formModal?.mode === "edit" ? "Edit Menu" : "Tambah Menu"}
        description={formModal?.mode === "edit" ? formModal.item.label : "Tambahkan item menu baru ke sidebar admin."}
      >
        {formModal && (
          <MenuItemForm
            key={formModal.mode === "edit" ? formModal.item.id : "create"}
            itemId={formModal.mode === "edit" ? formModal.item.id : undefined}
            defaultValues={
              formModal.mode === "edit"
                ? { ...formModal.item, parent_id: formModal.item.parent_id ?? "" }
                : undefined
            }
            groups={groups}
            parentOptions={items}
            onSuccess={handleFormSuccess}
            onCancel={() => setFormModal(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Hapus menu "${pendingDelete?.label}"?`}
        description="Tindakan ini tidak bisa dibatalkan. Item menu yang punya sub-menu (induk) akan ikut terhapus."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
