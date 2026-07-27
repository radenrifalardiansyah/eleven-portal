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
  deleteTestimonialClient,
  deleteTestimonialClients,
  importTestimonialClients,
  moveTestimonialClient,
  reviewTestimonialClient,
  reviewTestimonialClients,
} from "@/app/admin/(dashboard)/testimonials/actions";
import TestimonialClientForm from "@/components/admin/testimonials/TestimonialClientForm";
import {
  testimonialClientToExcelRow,
  excelRowToTestimonialClientInput,
  downloadTestimonialClientImportTemplate,
} from "@/components/admin/testimonials/excel";
import { exportRowsToExcel, parseExcelFile } from "@/lib/excel";
import type { TestimonialClient } from "@/lib/cms/testimonials";

type FormModalState = { mode: "create" } | { mode: "edit"; client: TestimonialClient } | null;

export default function TestimonialsClient({
  clients,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  canPublish,
}: {
  clients: TestimonialClient[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<TestimonialClient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [importing, setImporting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);

  const selectedClients = useMemo(
    () => clients.filter((c) => selectedIds[c.id]),
    [clients, selectedIds]
  );
  const selectedPendingClients = useMemo(
    () => selectedClients.filter((c) => c.status === "pending"),
    [selectedClients]
  );

  function handleExport() {
    exportRowsToExcel(clients.map(testimonialClientToExcelRow), "testimonials");
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      const inputs = rows.map(excelRowToTestimonialClientInput).filter((r) => r !== null);
      if (inputs.length === 0) {
        toast.error("Tidak ada baris valid ditemukan di file tersebut");
        return;
      }
      await importTestimonialClients(inputs);
      toast.success(`${inputs.length} klien berhasil diimpor`);
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
      await deleteTestimonialClient(pendingDelete.id);
      toast.success("Klien dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus klien");
    } finally {
      setDeleting(false);
    }
  }

  async function handleReview(client: TestimonialClient, approve: boolean) {
    setReviewingId(client.id);
    try {
      await reviewTestimonialClient(client.id, approve);
      toast.success(approve ? "Klien disetujui & tayang" : "Klien dikembalikan ke draft");
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
      await moveTestimonialClient(id, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan urutan klien");
    } finally {
      setMovingId(null);
    }
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    try {
      await deleteTestimonialClients(selectedClients.map((c) => ({ id: c.id })));
      toast.success(`${selectedClients.length} klien dihapus`);
      setSelectedIds({});
      setBulkDeleteConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus klien terpilih");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleBulkApprove() {
    setBulkApproving(true);
    try {
      await reviewTestimonialClients(
        selectedPendingClients.map((c) => ({ id: c.id })),
        true
      );
      toast.success(`${selectedPendingClients.length} klien disetujui & tayang`);
      setSelectedIds({});
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui klien terpilih");
    } finally {
      setBulkApproving(false);
    }
  }

  const columns = useMemo<ColumnDef<TestimonialClient, unknown>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="relative grid h-10 w-16 place-items-center overflow-hidden rounded-lg border border-ink-900/5 bg-white">
            {row.original.logo && (
              <Image src={row.original.logo} alt="" fill className="object-contain p-1" unoptimized />
            )}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Nama Klien",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink-900">{row.original.name}</p>
            <p className="text-xs text-ink-500">/{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: "industry",
        header: "Industri",
        cell: ({ getValue }) => {
          const industry = getValue<string>();
          return industry ? <span className="text-ink-700">{industry}</span> : <span className="text-ink-400">-</span>;
        },
      },
      {
        id: "contact",
        header: "PIC",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.contact_name ? (
            <div>
              <p className="text-ink-900">{row.original.contact_name}</p>
              {row.original.contact_position && <p className="text-xs text-ink-500">{row.original.contact_position}</p>}
            </div>
          ) : (
            <span className="text-ink-400">-</span>
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<TestimonialClient["status"]>()} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const position = clients.findIndex((c) => c.id === row.original.id);
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
                      disabled={movingId === row.original.id || position === clients.length - 1}
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
                  onClick={() => setFormModal({ mode: "edit", client: row.original })}
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
    [canEdit, canDelete, canApprove, reviewingId, movingId, clients]
  );

  const canBulkSelect = canDelete || canApprove;

  return (
    <>
      {canBulkSelect && selectedClients.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-2.5">
          <span className="text-sm font-medium text-ink-900">{selectedClients.length} klien dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && selectedPendingClients.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Setujui Terpilih ({selectedPendingClients.length})
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
        data={clients}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari klien..."
        selection={canBulkSelect ? { selectedIds, onChange: setSelectedIds } : undefined}
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions
              onExport={handleExport}
              onImport={canCreate ? handleImport : undefined}
              onDownloadTemplate={canCreate ? downloadTestimonialClientImportTemplate : undefined}
              importing={importing}
            />
            {canCreate && (
              <button
                onClick={() => setFormModal({ mode: "create" })}
                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                Tambah Klien
              </button>
            )}
          </div>
        }
        renderCard={(client) => {
          const position = clients.findIndex((c) => c.id === client.id);
          return (
          <TiltCard className="group flex h-full flex-col items-center rounded-2xl border border-ink-900/5 bg-white p-4 text-center shadow-sm">
            <div className="relative grid h-16 w-full place-items-center overflow-hidden rounded-xl border border-ink-900/5 bg-white">
              {client.logo && <Image src={client.logo} alt="" fill className="object-contain p-2" unoptimized />}
            </div>
            <p className="mt-3 font-heading text-sm font-semibold text-ink-900">{client.name}</p>
            {client.industry && <p className="text-xs text-ink-500">{client.industry}</p>}
            <div className="mt-1">
              <StatusBadge status={client.status} />
            </div>
            {canEdit && <p className="mt-1 text-xs text-ink-500">Urutan #{position + 1}</p>}
            {canApprove && client.status === "pending" && (
              <div className="mt-2">
                <ApprovalActions
                  disabled={reviewingId === client.id}
                  onApprove={() => handleReview(client, true)}
                  onReject={() => handleReview(client, false)}
                />
              </div>
            )}
            <div className="mt-3 flex w-full items-center gap-2">
              {canEdit && (
                <div className="flex flex-col">
                  <button
                    disabled={movingId === client.id || position === 0}
                    onClick={() => handleMove(client.id, "up")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    aria-label="Naikkan urutan"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={movingId === client.id || position === clients.length - 1}
                    onClick={() => handleMove(client.id, "down")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    aria-label="Turunkan urutan"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {canEdit && (
                <button
                  onClick={() => setFormModal({ mode: "edit", client })}
                  className="flex-1 rounded-lg border border-ink-900/10 py-1.5 text-center text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setPendingDelete(client)}
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
        title={formModal?.mode === "edit" ? "Edit Klien" : "Tambah Klien"}
        description={formModal?.mode === "edit" ? formModal.client.name : "Isi detail klien baru untuk portal."}
      >
        {formModal && (
          <TestimonialClientForm
            key={formModal.mode === "edit" ? formModal.client.id : "create"}
            clientId={formModal.mode === "edit" ? formModal.client.id : undefined}
            defaultValues={formModal.mode === "edit" ? formModal.client : undefined}
            canPublish={canPublish}
            onSuccess={handleFormSuccess}
            onCancel={() => setFormModal(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Hapus "${pendingDelete?.name}"?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Hapus ${selectedClients.length} klien terpilih?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </>
  );
}
