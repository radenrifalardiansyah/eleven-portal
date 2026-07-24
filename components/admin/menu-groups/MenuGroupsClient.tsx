"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import MenuGroupForm from "@/components/admin/menu-groups/MenuGroupForm";
import { deleteMenuGroup, moveMenuGroup } from "@/app/admin/(dashboard)/modules/actions";
import type { MenuGroupRow } from "@/lib/cms/menu";

type FormModalState = { mode: "create" } | { mode: "edit"; item: MenuGroupRow } | null;

export default function MenuGroupsClient({
  groups,
  canEdit,
  canDelete,
}: {
  groups: MenuGroupRow[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [pendingDelete, setPendingDelete] = useState<MenuGroupRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  const sorted = useMemo(() => [...groups].sort((a, b) => a.sort_order - b.sort_order), [groups]);

  async function handleMove(id: string, direction: "up" | "down") {
    setMovingId(id);
    try {
      await moveMenuGroup(id, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan modul");
    } finally {
      setMovingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteMenuGroup(pendingDelete.id);
      toast.success("Modul dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus modul");
    } finally {
      setDeleting(false);
    }
  }

  function handleFormSuccess() {
    setFormModal(null);
    router.refresh();
  }

  const columns = useMemo<ColumnDef<MenuGroupRow, unknown>[]>(
    () => [
      { accessorKey: "label", header: "Label" },
      {
        id: "order",
        header: "Urutan",
        enableSorting: false,
        cell: ({ row }) => {
          const index = sorted.findIndex((g) => g.id === row.original.id);
          return (
            <div className="flex items-center gap-1">
              <span className="text-ink-500">#{index + 1}</span>
              {canEdit && (
                <div className="flex flex-col">
                  <button
                    disabled={movingId === row.original.id || index === 0}
                    onClick={() => handleMove(row.original.id, "up")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={movingId === row.original.id || index === sorted.length - 1}
                    onClick={() => handleMove(row.original.id, "down")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            {canEdit && (
              <button
                onClick={() => setFormModal({ mode: "edit", item: row.original })}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-900/5 hover:text-ink-900"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setPendingDelete(row.original)}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [canEdit, canDelete, sorted, movingId]
  );

  return (
    <>
      <DataTable
        data={sorted}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari modul..."
        renderCard={(item) => {
          const index = sorted.findIndex((g) => g.id === item.id);
          return (
            <div className="rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink-900">{item.label}</p>
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
                      disabled={movingId === item.id || index === sorted.length - 1}
                      onClick={() => handleMove(item.id, "down")}
                      className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-ink-500">Urutan #{index + 1}</p>
              <div className="mt-3 flex gap-2">
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
            </div>
          );
        }}
        actions={
          canEdit && (
            <button
              onClick={() => setFormModal({ mode: "create" })}
              className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Tambah Modul
            </button>
          )
        }
      />

      <Modal
        open={!!formModal}
        onClose={() => setFormModal(null)}
        title={formModal?.mode === "edit" ? "Edit Modul" : "Tambah Modul"}
        description={
          formModal?.mode === "edit" ? formModal.item.label : "Tambahkan kategori/grup menu baru untuk sidebar admin."
        }
      >
        {formModal && (
          <MenuGroupForm
            key={formModal.mode === "edit" ? formModal.item.id : "create"}
            defaultValues={formModal.mode === "edit" ? formModal.item : undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setFormModal(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Hapus modul "${pendingDelete?.label}"?`}
        description="Modul tidak bisa dihapus jika masih ada menu di dalamnya. Pindahkan atau hapus menu tersebut dulu lewat Struktur Menu."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
