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
  deleteService,
  deleteServices,
  importServices,
  moveService,
  reviewService,
  reviewServices,
} from "@/app/admin/(dashboard)/services/actions";
import ServiceForm from "@/components/admin/services/ServiceForm";
import { serviceToExcelRow, excelRowToServiceInput, downloadServiceImportTemplate } from "@/components/admin/services/excel";
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
  const [movingId, setMovingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedIds[s.id]),
    [services, selectedIds]
  );
  const selectedPendingServices = useMemo(
    () => selectedServices.filter((s) => s.status === "pending"),
    [selectedServices]
  );

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

  async function handleMove(id: string, direction: "up" | "down") {
    setMovingId(id);
    try {
      await moveService(id, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan urutan layanan");
    } finally {
      setMovingId(null);
    }
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    try {
      await deleteServices(selectedServices.map((s) => ({ id: s.id, slug: s.slug })));
      toast.success(`${selectedServices.length} layanan dihapus`);
      setSelectedIds({});
      setBulkDeleteConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus layanan terpilih");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleBulkApprove() {
    setBulkApproving(true);
    try {
      await reviewServices(
        selectedPendingServices.map((s) => ({ id: s.id, slug: s.slug })),
        true
      );
      toast.success(`${selectedPendingServices.length} layanan disetujui & tayang`);
      setSelectedIds({});
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui layanan terpilih");
    } finally {
      setBulkApproving(false);
    }
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
        cell: ({ row }) => {
          const position = services.findIndex((s) => s.id === row.original.id);
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
                      disabled={movingId === row.original.id || position === services.length - 1}
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
          );
        },
      },
    ],
    [canEdit, canDelete, canApprove, reviewingId, movingId, services]
  );

  const canBulkSelect = canDelete || canApprove;

  return (
    <>
      {canBulkSelect && selectedServices.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-2.5">
          <span className="text-sm font-medium text-ink-900">{selectedServices.length} layanan dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && selectedPendingServices.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Setujui Terpilih ({selectedPendingServices.length})
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
        data={services}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari layanan..."
        selection={canBulkSelect ? { selectedIds, onChange: setSelectedIds } : undefined}
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions
              onExport={handleExport}
              onImport={canCreate ? handleImport : undefined}
              onDownloadTemplate={canCreate ? downloadServiceImportTemplate : undefined}
              importing={importing}
            />
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
        renderCard={(service) => {
          const position = services.findIndex((s) => s.id === service.id);
          return (
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
            {canEdit && <p className="mt-1 text-xs text-ink-500">Urutan #{position + 1}</p>}
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
                <div className="flex flex-col">
                  <button
                    disabled={movingId === service.id || position === 0}
                    onClick={() => handleMove(service.id, "up")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    aria-label="Naikkan urutan"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={movingId === service.id || position === services.length - 1}
                    onClick={() => handleMove(service.id, "down")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    aria-label="Turunkan urutan"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
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
          );
        }}
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

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Hapus ${selectedServices.length} layanan terpilih?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </>
  );
}
