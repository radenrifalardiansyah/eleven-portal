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
import {
  deleteTestimonialClient,
  importTestimonialClients,
  reviewTestimonialClient,
} from "@/app/admin/(dashboard)/testimonials/actions";
import TestimonialClientForm from "@/components/admin/testimonials/TestimonialClientForm";
import { testimonialClientToExcelRow, excelRowToTestimonialClientInput } from "@/components/admin/testimonials/excel";
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
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<TestimonialClient["status"]>()} />,
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
        ),
      },
    ],
    [canEdit, canDelete, canApprove, reviewingId]
  );

  return (
    <>
      <DataTable
        data={clients}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari klien..."
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions onExport={handleExport} onImport={canCreate ? handleImport : undefined} importing={importing} />
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
        renderCard={(client) => (
          <TiltCard className="group flex h-full flex-col items-center rounded-2xl border border-ink-900/5 bg-white p-4 text-center shadow-sm">
            <div className="relative grid h-16 w-full place-items-center overflow-hidden rounded-xl border border-ink-900/5 bg-white">
              {client.logo && <Image src={client.logo} alt="" fill className="object-contain p-2" unoptimized />}
            </div>
            <p className="mt-3 font-heading text-sm font-semibold text-ink-900">{client.name}</p>
            <div className="mt-1">
              <StatusBadge status={client.status} />
            </div>
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
        )}
      />

      <Modal
        open={!!formModal}
        onClose={() => setFormModal(null)}
        title={formModal?.mode === "edit" ? "Edit Klien" : "Tambah Klien"}
        description={formModal?.mode === "edit" ? formModal.client.name : "Isi detail klien baru untuk portal."}
        maxWidth="max-w-lg"
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
    </>
  );
}
