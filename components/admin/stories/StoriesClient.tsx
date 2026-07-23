"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import ExcelActions from "@/components/admin/ExcelActions";
import StatusBadge from "@/components/admin/StatusBadge";
import ApprovalActions from "@/components/admin/ApprovalActions";
import TiltCard from "@/components/ui/TiltCard";
import { deleteStory, importStories, reviewStory } from "@/app/admin/(dashboard)/stories/actions";
import StoryForm from "@/components/admin/stories/StoryForm";
import { storyToExcelRow, excelRowToStoryInput } from "@/components/admin/stories/excel";
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
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
        ),
      },
    ],
    [canEdit, canDelete, canApprove, reviewingId]
  );

  return (
    <>
      <DataTable
        data={stories}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari story..."
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions onExport={handleExport} onImport={canCreate ? handleImport : undefined} importing={importing} />
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
        renderCard={(story) => (
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
              {canApprove && story.status === "pending" && (
                <div className="mb-2 flex justify-center">
                  <ApprovalActions
                    disabled={reviewingId === story.id}
                    onApprove={() => handleReview(story, true)}
                    onReject={() => handleReview(story, false)}
                  />
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
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
        )}
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
