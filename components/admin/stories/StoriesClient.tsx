"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, ChevronUp, ChevronDown } from "lucide-react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import ExcelActions from "@/components/admin/ExcelActions";
import StatusBadge from "@/components/admin/StatusBadge";
import ApprovalActions from "@/components/admin/ApprovalActions";
import TiltCard from "@/components/ui/TiltCard";
import {
  deleteStory,
  deleteStories,
  importStories,
  moveStory,
  reviewStory,
  reviewStories,
} from "@/app/admin/(dashboard)/stories/actions";
import StoryForm from "@/components/admin/stories/StoryForm";
import { storyToExcelRow, excelRowToStoryInput, downloadStoryImportTemplate } from "@/components/admin/stories/excel";
import { exportRowsToExcel, parseExcelFile } from "@/lib/excel";
import type { Story } from "@/lib/cms/stories";

type FormModalState = { mode: "create" } | { mode: "edit"; story: Story } | null;

export default function StoriesClient({
  stories,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  canPublish,
}: {
  stories: Story[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Story | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [importing, setImporting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);

  const selectedStories = useMemo(
    () => stories.filter((s) => selectedIds[s.id]),
    [stories, selectedIds]
  );
  const selectedPendingStories = useMemo(
    () => selectedStories.filter((s) => s.status === "pending"),
    [selectedStories]
  );

  function handleExport() {
    exportRowsToExcel(stories.map(storyToExcelRow), "stories");
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      const inputs = rows.map(excelRowToStoryInput).filter((r) => r !== null);
      if (inputs.length === 0) {
        toast.error("Tidak ada baris valid ditemukan di file tersebut");
        return;
      }
      await importStories(inputs);
      toast.success(`${inputs.length} story berhasil diimpor`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengimpor file");
    } finally {
      setImporting(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteStory(pendingDelete.id, pendingDelete.slug);
      toast.success("Story dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus story");
    } finally {
      setDeleting(false);
    }
  }

  async function handleReview(story: Story, approve: boolean) {
    setReviewingId(story.id);
    try {
      await reviewStory(story.id, story.slug, approve);
      toast.success(approve ? "Story disetujui & tayang" : "Story dikembalikan ke draft");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses review");
    } finally {
      setReviewingId(null);
    }
  }

  function handleFormSuccess() {
    setFormModal(null);
    router.refresh();
  }

  async function handleMove(id: string, direction: "up" | "down") {
    setMovingId(id);
    try {
      await moveStory(id, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan urutan story");
    } finally {
      setMovingId(null);
    }
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    try {
      await deleteStories(selectedStories.map((s) => ({ id: s.id, slug: s.slug })));
      toast.success(`${selectedStories.length} story dihapus`);
      setSelectedIds({});
      setBulkDeleteConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus story terpilih");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleBulkApprove() {
    setBulkApproving(true);
    try {
      await reviewStories(
        selectedPendingStories.map((s) => ({ id: s.id, slug: s.slug })),
        true
      );
      toast.success(`${selectedPendingStories.length} story disetujui & tayang`);
      setSelectedIds({});
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui story terpilih");
    } finally {
      setBulkApproving(false);
    }
  }

  const columns = useMemo<ColumnDef<Story, unknown>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-ink-900/5">
            {row.original.image && (
              <Image src={row.original.image} alt="" fill className="object-cover" unoptimized />
            )}
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Judul",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink-900">{row.original.title}</p>
            <p className="text-xs text-ink-500">/{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: "label",
        header: "Label",
        cell: ({ row }) => <LabelBadge label={row.original.label} color={row.original.label_color} />,
      },
      { accessorKey: "date", header: "Tanggal" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<Story["status"]>()} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const position = stories.findIndex((s) => s.id === row.original.id);
          return (
            <div className="flex items-center gap-2">
              {canEdit && (
                <div className="flex items-center gap-1">
                  <span className="text-ink-500">#{position + 1}</span>
                  <div className="flex flex-col">
                    <button
                      disabled={movingId === row.original.id || position === 0}
                      onClick={() => handleMove(row.original.id, "up")}
                      className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      aria-label="Naikkan urutan"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={movingId === row.original.id || position === stories.length - 1}
                      onClick={() => handleMove(row.original.id, "down")}
                      className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      aria-label="Turunkan urutan"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {canApprove && row.original.status === "pending" && (
                <ApprovalActions
                  disabled={reviewingId === row.original.id}
                  onApprove={() => handleReview(row.original, true)}
                  onReject={() => handleReview(row.original, false)}
                />
              )}
              {canEdit && (
                <button
                  onClick={() => setFormModal({ mode: "edit", story: row.original })}
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
          );
        },
      },
    ],
    [canEdit, canDelete, canApprove, reviewingId, movingId, stories]
  );

  const canBulkSelect = canDelete || canApprove;

  return (
    <>
      {canBulkSelect && selectedStories.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-2.5">
          <span className="text-sm font-medium text-ink-900">{selectedStories.length} story dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && selectedPendingStories.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Setujui Terpilih ({selectedPendingStories.length})
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus Terpilih
              </button>
            )}
            <button
              onClick={() => setSelectedIds({})}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-900/5"
            >
              <X className="h-3.5 w-3.5" />
              Batal Pilih
            </button>
          </div>
        </div>
      )}

      <DataTable
        data={stories}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari story..."
        selection={canBulkSelect ? { selectedIds, onChange: setSelectedIds } : undefined}
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions
              onExport={handleExport}
              onImport={canCreate ? handleImport : undefined}
              onDownloadTemplate={canCreate ? downloadStoryImportTemplate : undefined}
              importing={importing}
            />
            {canCreate && (
              <button
                onClick={() => setFormModal({ mode: "create" })}
                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                Tambah Story
              </button>
            )}
          </div>
        }
        renderCard={(story) => {
          const position = stories.findIndex((s) => s.id === story.id);
          return (
          <TiltCard className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-sm">
            <div className="relative h-36 w-full overflow-hidden bg-ink-900/5">
              {story.image && <Image src={story.image} alt={story.title} fill className="object-cover" unoptimized />}
              <div className="absolute left-2 top-2">
                <LabelBadge label={story.label} color={story.label_color} />
              </div>
              <div className="absolute right-2 top-2">
                <StatusBadge status={story.status} />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="font-heading text-sm font-semibold text-ink-900">{story.title}</p>
              <p className="text-xs text-ink-500">/{story.slug}</p>
              <p className="mt-2 flex-1 text-xs text-ink-500">{story.date}</p>
              {canEdit && <p className="text-xs text-ink-500">Urutan #{position + 1}</p>}
              {canApprove && story.status === "pending" && (
                <div className="mb-2 mt-2 flex justify-center">
                  <ApprovalActions
                    disabled={reviewingId === story.id}
                    onApprove={() => handleReview(story, true)}
                    onReject={() => handleReview(story, false)}
                  />
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                {canEdit && (
                  <div className="flex flex-col">
                    <button
                      disabled={movingId === story.id || position === 0}
                      onClick={() => handleMove(story.id, "up")}
                      className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      aria-label="Naikkan urutan"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={movingId === story.id || position === stories.length - 1}
                      onClick={() => handleMove(story.id, "down")}
                      className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      aria-label="Turunkan urutan"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {canEdit && (
                  <button
                    onClick={() => setFormModal({ mode: "edit", story })}
                    className="flex-1 rounded-lg border border-ink-900/10 py-1.5 text-center text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setPendingDelete(story)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </TiltCard>
          );
        }}
      />

      <Modal
        open={!!formModal}
        onClose={() => setFormModal(null)}
        title={formModal?.mode === "edit" ? "Edit Story" : "Tambah Story"}
        description={formModal?.mode === "edit" ? formModal.story.title : "Isi detail story baru untuk portal."}
        maxWidth="max-w-3xl"
      >
        {formModal && (
          <StoryForm
            key={formModal.mode === "edit" ? formModal.story.id : "create"}
            storyId={formModal.mode === "edit" ? formModal.story.id : undefined}
            defaultValues={formModal.mode === "edit" ? formModal.story : undefined}
            canPublish={canPublish}
            onSuccess={handleFormSuccess}
            onCancel={() => setFormModal(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Hapus "${pendingDelete?.title}"?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Hapus ${selectedStories.length} story terpilih?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </>
  );
}

function LabelBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
        color === "yellow" ? "bg-brand-yellow/20 text-[#8a6d00]" : "bg-brand-blue/10 text-brand-blue"
      }`}
    >
      {label}
    </span>
  );
}
