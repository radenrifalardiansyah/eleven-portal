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
  deleteProject,
  deleteProjects,
  importProjects,
  moveProject,
  reviewProject,
  reviewProjects,
} from "@/app/admin/(dashboard)/projects/actions";
import ProjectForm from "@/components/admin/projects/ProjectForm";
import { projectToExcelRow, excelRowToProjectInput, downloadProjectImportTemplate } from "@/components/admin/projects/excel";
import { exportRowsToExcel, parseExcelFile } from "@/lib/excel";
import type { Project } from "@/lib/cms/projects";
import type { Product } from "@/lib/cms/products";
import type { TestimonialClient } from "@/lib/cms/testimonials";

type FormModalState = { mode: "create" } | { mode: "edit"; project: Project } | null;

export default function ProjectsClient({
  projects,
  products,
  clients,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  canPublish,
}: {
  projects: Project[];
  products: Product[];
  clients: TestimonialClient[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [importing, setImporting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);

  const selectedProjects = useMemo(
    () => projects.filter((p) => selectedIds[p.id]),
    [projects, selectedIds]
  );
  const selectedPendingProjects = useMemo(
    () => selectedProjects.filter((p) => p.status === "pending"),
    [selectedProjects]
  );

  function handleExport() {
    exportRowsToExcel(projects.map(projectToExcelRow), "case-study");
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      const inputs = rows.map(excelRowToProjectInput).filter((r) => r !== null);
      if (inputs.length === 0) {
        toast.error("Tidak ada baris valid ditemukan di file tersebut");
        return;
      }
      await importProjects(inputs);
      toast.success(`${inputs.length} case study berhasil diimpor`);
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
      await deleteProject(pendingDelete.id, pendingDelete.slug);
      toast.success("Case study dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus case study");
    } finally {
      setDeleting(false);
    }
  }

  async function handleReview(project: Project, approve: boolean) {
    setReviewingId(project.id);
    try {
      await reviewProject(project.id, project.slug, approve);
      toast.success(approve ? "Case study disetujui & tayang" : "Case study dikembalikan ke draft");
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
      await moveProject(id, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan urutan case study");
    } finally {
      setMovingId(null);
    }
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    try {
      await deleteProjects(selectedProjects.map((p) => ({ id: p.id, slug: p.slug })));
      toast.success(`${selectedProjects.length} case study dihapus`);
      setSelectedIds({});
      setBulkDeleteConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus case study terpilih");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleBulkApprove() {
    setBulkApproving(true);
    try {
      await reviewProjects(
        selectedPendingProjects.map((p) => ({ id: p.id, slug: p.slug })),
        true
      );
      toast.success(`${selectedPendingProjects.length} case study disetujui & tayang`);
      setSelectedIds({});
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui case study terpilih");
    } finally {
      setBulkApproving(false);
    }
  }

  const columns = useMemo<ColumnDef<Project, unknown>[]>(
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
        accessorKey: "productName",
        header: "Produk",
        cell: ({ getValue }) => <CategoryBadge label={getValue<string>()} />,
      },
      {
        accessorKey: "clientName",
        header: "Client",
        cell: ({ getValue }) => {
          const clientName = getValue<string>();
          return clientName ? <CategoryBadge label={clientName} /> : <span className="text-ink-400">-</span>;
        },
      },
      { accessorKey: "year", header: "Tahun" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<Project["status"]>()} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const position = projects.findIndex((p) => p.id === row.original.id);
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
                      disabled={movingId === row.original.id || position === projects.length - 1}
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
                  onClick={() => setFormModal({ mode: "edit", project: row.original })}
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
    [canEdit, canDelete, canApprove, reviewingId, movingId, projects]
  );

  const canBulkSelect = canDelete || canApprove;

  return (
    <>
      {canBulkSelect && selectedProjects.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-2.5">
          <span className="text-sm font-medium text-ink-900">{selectedProjects.length} case study dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && selectedPendingProjects.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Setujui Terpilih ({selectedPendingProjects.length})
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
        data={projects}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari case study..."
        selection={canBulkSelect ? { selectedIds, onChange: setSelectedIds } : undefined}
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions
              onExport={handleExport}
              onImport={canCreate ? handleImport : undefined}
              onDownloadTemplate={canCreate ? downloadProjectImportTemplate : undefined}
              importing={importing}
            />
            {canCreate && (
              <button
                onClick={() => setFormModal({ mode: "create" })}
                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                Tambah Case Study
              </button>
            )}
          </div>
        }
        renderCard={(project) => {
          const position = projects.findIndex((p) => p.id === project.id);
          return (
          <TiltCard className="group flex h-full flex-col rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm">
            <div className="relative h-36 w-full overflow-hidden rounded-xl bg-ink-900/5">
              {project.image && (
                <Image src={project.image} alt={project.title} fill className="object-cover" unoptimized />
              )}
              <div className="absolute left-2 top-2">
                <StatusBadge status={project.status} />
              </div>
            </div>
            <div className="mt-3 flex-1">
              <p className="font-heading text-sm font-semibold text-ink-900">{project.title}</p>
              <p className="text-xs text-ink-500">/{project.slug}</p>
              <div className="mt-2 flex items-center gap-2">
                <CategoryBadge label={project.productName} />
                <span className="text-xs text-ink-500">{project.year}</span>
              </div>
              {canEdit && <p className="mt-1 text-xs text-ink-500">Urutan #{position + 1}</p>}
            </div>
            {canApprove && project.status === "pending" && (
              <div className="mt-3 flex justify-center">
                <ApprovalActions
                  disabled={reviewingId === project.id}
                  onApprove={() => handleReview(project, true)}
                  onReject={() => handleReview(project, false)}
                />
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              {canEdit && (
                <div className="flex flex-col">
                  <button
                    disabled={movingId === project.id || position === 0}
                    onClick={() => handleMove(project.id, "up")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    aria-label="Naikkan urutan"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={movingId === project.id || position === projects.length - 1}
                    onClick={() => handleMove(project.id, "down")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    aria-label="Turunkan urutan"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {canEdit && (
                <button
                  onClick={() => setFormModal({ mode: "edit", project })}
                  className="flex-1 rounded-lg border border-ink-900/10 py-1.5 text-center text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setPendingDelete(project)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Hapus
                </button>
              )}
            </div>
          </TiltCard>
          );
        }}
      />

      <Modal
        open={!!formModal}
        onClose={() => setFormModal(null)}
        title={formModal?.mode === "edit" ? "Edit Case Study" : "Tambah Case Study"}
        description={formModal?.mode === "edit" ? formModal.project.title : "Isi detail proyek baru untuk portal."}
      >
        {formModal && (
          <ProjectForm
            key={formModal.mode === "edit" ? formModal.project.id : "create"}
            projectId={formModal.mode === "edit" ? formModal.project.id : undefined}
            defaultValues={
              formModal.mode === "edit"
                ? { ...formModal.project, product_id: formModal.project.product_id ?? "", client_id: formModal.project.client_id ?? "" }
                : undefined
            }
            products={products}
            clients={clients}
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
        title={`Hapus ${selectedProjects.length} case study terpilih?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-lg bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
      {label}
    </span>
  );
}
