"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, CornerDownRight, Pencil, Trash2, Plus, Search, LayoutGrid, List } from "lucide-react";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import MenuItemForm from "@/components/admin/menu/MenuItemForm";
import TiltCard from "@/components/ui/TiltCard";
import { ICON_MAP } from "@/components/admin/icon-map";
import { deleteMenuItem, moveMenuItem } from "@/app/admin/(dashboard)/menu-struktur/actions";
import type { MenuGroupRow, MenuItemRow } from "@/lib/cms/menu";
import type { ModuleRow } from "@/lib/cms/modules";

type FormModalState = { mode: "create" } | { mode: "edit"; item: MenuItemRow } | null;

export default function MenuClient({
  groups,
  items,
  modules,
  canEdit,
  canDelete,
}: {
  groups: MenuGroupRow[];
  items: MenuItemRow[];
  modules: ModuleRow[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "card">("table");
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [pendingDelete, setPendingDelete] = useState<MenuItemRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  function matchesSearch(item: MenuItemRow) {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q);
  }

  // Sort order is scoped per level (top-level items count separately from each
  // parent's children), so numbering/up-down boundaries must use each level's
  // own sibling list — never the group's full flattened item list.
  const hierarchyByGroup = useMemo(() => {
    const map = new Map<string, { topLevel: MenuItemRow[]; childrenByParent: Map<string, MenuItemRow[]> }>();
    for (const group of groups) {
      const groupItems = items.filter((i) => i.group_id === group.id);
      const topLevel = groupItems.filter((i) => !i.parent_id).sort((a, b) => a.sort_order - b.sort_order);
      const childrenByParent = new Map<string, MenuItemRow[]>();
      for (const item of groupItems) {
        if (!item.parent_id) continue;
        const list = childrenByParent.get(item.parent_id) ?? [];
        list.push(item);
        childrenByParent.set(item.parent_id, list);
      }
      for (const list of childrenByParent.values()) list.sort((a, b) => a.sort_order - b.sort_order);
      map.set(group.id, { topLevel, childrenByParent });
    }
    return map;
  }, [groups, items]);

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

  const anyVisible = groups.some((group) => {
    const { topLevel, childrenByParent } = hierarchyByGroup.get(group.id) ?? { topLevel: [], childrenByParent: new Map() };
    return topLevel.some((p) => matchesSearch(p) || (childrenByParent.get(p.id) ?? []).some(matchesSearch));
  });

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
              Tambah Menu
            </button>
          )}
        </div>
      </div>

      {view === "table" ? (
      <div className="overflow-x-auto rounded-2xl border border-ink-900/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-900/5 bg-ink-900/[0.02]">
            <tr>
              {["#", "Label", "Href", "Urutan", "Flag", ""].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const { topLevel, childrenByParent } = hierarchyByGroup.get(group.id) ?? {
                topLevel: [],
                childrenByParent: new Map<string, MenuItemRow[]>(),
              };
              const visibleTopLevel = topLevel.filter(
                (p) => matchesSearch(p) || (childrenByParent.get(p.id) ?? []).some(matchesSearch)
              );
              if (visibleTopLevel.length === 0) return null;

              function renderRow(item: MenuItemRow, position: number, siblingCount: number, isChild: boolean) {
                const Icon = ICON_MAP[item.icon];
                return (
                  <tr key={item.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.015]">
                    <td className="px-4 py-3 text-ink-500">{position + 1}</td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-2 font-medium text-ink-900 ${isChild ? "pl-5" : ""}`}>
                        {isChild && <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-ink-900/30" />}
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-ink-500" />}
                        {item.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{item.href}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-ink-500">#{position + 1}</span>
                        {canEdit && (
                          <div className="flex flex-col">
                            <button
                              disabled={movingId === item.id || position === 0}
                              onClick={() => handleMove(item.id, "up")}
                              className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              disabled={movingId === item.id || position === siblingCount - 1}
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
              }

              return (
                <Fragment key={group.id}>
                  <tr className="border-b border-ink-900/5 bg-ink-900/[0.02]">
                    <td colSpan={6} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {group.label}
                    </td>
                  </tr>
                  {visibleTopLevel.map((parent, parentIndex) => {
                    const children = childrenByParent.get(parent.id) ?? [];
                    return (
                      <Fragment key={parent.id}>
                        {renderRow(parent, parentIndex, visibleTopLevel.length, false)}
                        {children.map((child, childIndex) => renderRow(child, childIndex, children.length, true))}
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const { topLevel, childrenByParent } = hierarchyByGroup.get(group.id) ?? {
              topLevel: [],
              childrenByParent: new Map<string, MenuItemRow[]>(),
            };
            const visibleTopLevel = topLevel.filter(
              (p) => matchesSearch(p) || (childrenByParent.get(p.id) ?? []).some(matchesSearch)
            );
            if (visibleTopLevel.length === 0) return null;

            function renderCard(item: MenuItemRow, position: number, siblingCount: number) {
              const Icon = ICON_MAP[item.icon];
              return (
                <TiltCard
                  key={item.id}
                  className="group flex h-full flex-col rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-blue/10">
                      {Icon && <Icon className="h-4 w-4 text-brand-blue" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-semibold text-ink-900">{item.label}</p>
                      <p className="truncate text-xs text-ink-500">{item.href}</p>
                    </div>
                    {canEdit && (
                      <div className="flex flex-col">
                        <button
                          disabled={movingId === item.id || position === 0}
                          onClick={() => handleMove(item.id, "up")}
                          className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={movingId === item.id || position === siblingCount - 1}
                          onClick={() => handleMove(item.id, "down")}
                          className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-ink-500">Urutan #{position + 1}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
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
                  <div className="mt-3 flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => setFormModal({ mode: "edit", item })}
                        className="flex-1 rounded-lg border border-ink-900/10 py-1.5 text-center text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setPendingDelete(item)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </TiltCard>
              );
            }

            return (
              <div key={`group-card-${group.id}`}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">{group.label}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleTopLevel.map((parent, parentIndex) => {
                    const children = childrenByParent.get(parent.id) ?? [];
                    return (
                      <Fragment key={parent.id}>
                        {renderCard(parent, parentIndex, visibleTopLevel.length)}
                        {children.map((child, childIndex) => (
                          <div key={child.id} className="sm:col-start-auto sm:pl-6">
                            {renderCard(child, childIndex, children.length)}
                          </div>
                        ))}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!anyVisible && <p className="py-10 text-center text-sm text-ink-500">Tidak ada data.</p>}
        </div>
      )}

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
            modules={modules}
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
