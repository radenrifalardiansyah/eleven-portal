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
import { deleteService, importServices, reviewService } from "@/app/admin/(dashboard)/services/actions";
import ServiceForm from "@/components/admin/services/ServiceForm";
import { serviceToExcelRow, excelRowToServiceInput } from "@/components/admin/services/excel";
import { exportRowsToExcel, parseExcelFile } from "@/lib/excel";
import type { Service } from "@/lib/cms/services";

type FormModalState = { mode: "create" } | { mode: "edit"; service: Service } | null;

export default function ServicesClient({
  services,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  canPublish,
}: {
  services: Service[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [importing, setImporting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  function handleExport() {
    exportRowsToExcel(services.map(serviceToExcelRow), "services");
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      const inputs = rows.map(excelRowToServiceInput).filter((r) => r !== null);
      if (inputs.length === 0) {
        toast.error("Tidak ada baris valid ditemukan di file tersebut");
        return;
      }
      await importServices(inputs);
      toast.success(`${inputs.length} layanan berhasil diimpor`);
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
      await deleteService(pendingDelete.id, pendingDelete.slug);
      toast.success("Layanan dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus layanan");
    } finally {
      setDeleting(false);
    }
  }

  async function handleReview(service: Service, approve: boolean) {
    setReviewingId(service.id);
    try {
      await reviewService(service.id, service.slug, approve);
      toast.success(approve ? "Layanan disetujui & tayang" : "Layanan dikembalikan ke draft");
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

  const columns = useMemo<ColumnDef<Service, unknown>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-brand-blue/10">
            {row.original.icon && (
              <Image src={row.original.icon} alt="" width={22} height={22} className="object-contain" />
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
        accessorKey: "benefits",
        header: "Benefit",
        enableSorting: false,
        cell: ({ getValue }) => <span className="text-ink-500">{getValue<string[]>().length} benefit</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<Service["status"]>()} />,
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
                onClick={() => setFormModal({ mode: "edit", service: row.original })}
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
        data={services}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari layanan..."
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions onExport={handleExport} onImport={canCreate ? handleImport : undefined} importing={importing} />
            {canCreate && (
              <button
                onClick={() => setFormModal({ mode: "create" })}
                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                Tambah Layanan
              </button>
            )}
          </div>
        }
        renderCard={(service) => (
          <TiltCard className="group flex h-full flex-col rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-blue/10">
                {service.icon && (
                  <Image src={service.icon} alt="" width={24} height={24} className="object-contain" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold text-ink-900">{service.title}</p>
                <p className="text-xs text-ink-500">/{service.slug}</p>
              </div>
              <StatusBadge status={service.status} />
            </div>
            <p className="mt-3 line-clamp-2 flex-1 text-xs text-ink-500">{service.description}</p>
            {canApprove && service.status === "pending" && (
              <div className="mt-3 flex justify-center">
                <ApprovalActions
                  disabled={reviewingId === service.id}
                  onApprove={() => handleReview(service, true)}
                  onReject={() => handleReview(service, false)}
                />
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => setFormModal({ mode: "edit", service })}
                  className="flex-1 rounded-lg border border-ink-900/10 py-1.5 text-center text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setPendingDelete(service)}
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
        title={formModal?.mode === "edit" ? "Edit Layanan" : "Tambah Layanan"}
        description={formModal?.mode === "edit" ? formModal.service.title : "Isi detail layanan baru untuk portal."}
      >
        {formModal && (
          <ServiceForm
            key={formModal.mode === "edit" ? formModal.service.id : "create"}
            serviceId={formModal.mode === "edit" ? formModal.service.id : undefined}
            defaultValues={formModal.mode === "edit" ? formModal.service : undefined}
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
