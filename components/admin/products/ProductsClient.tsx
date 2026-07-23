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
import { deleteProduct, importProducts, reviewProduct } from "@/app/admin/(dashboard)/products/actions";
import ProductForm from "@/components/admin/products/ProductForm";
import { productToExcelRow, excelRowToProductInput } from "@/components/admin/products/excel";
import { exportRowsToExcel, parseExcelFile } from "@/lib/excel";
import type { Product } from "@/lib/cms/products";

type FormModalState = { mode: "create" } | { mode: "edit"; product: Product } | null;

export default function ProductsClient({
  products,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  canPublish,
}: {
  products: Product[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [importing, setImporting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  function handleExport() {
    exportRowsToExcel(products.map(productToExcelRow), "products");
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      const inputs = rows.map(excelRowToProductInput).filter((r) => r !== null);
      if (inputs.length === 0) {
        toast.error("Tidak ada baris valid ditemukan di file tersebut");
        return;
      }
      await importProducts(inputs);
      toast.success(`${inputs.length} produk berhasil diimpor`);
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
      await deleteProduct(pendingDelete.id, pendingDelete.slug);
      toast.success("Produk dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus produk");
    } finally {
      setDeleting(false);
    }
  }

  async function handleReview(product: Product, approve: boolean) {
    setReviewingId(product.id);
    try {
      await reviewProduct(product.id, product.slug, approve);
      toast.success(approve ? "Produk disetujui & tayang" : "Produk dikembalikan ke draft");
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

  const columns = useMemo<ColumnDef<Product, unknown>[]>(
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
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink-900">{row.original.name}</p>
            <p className="text-xs text-ink-500">/{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Kategori",
        cell: ({ getValue }) => <CategoryBadge label={getValue<string>()} />,
      },
      { accessorKey: "price", header: "Harga" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<Product["status"]>()} />,
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
                onClick={() => setFormModal({ mode: "edit", product: row.original })}
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
        data={products}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari produk..."
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions onExport={handleExport} onImport={canCreate ? handleImport : undefined} importing={importing} />
            {canCreate && (
              <button
                onClick={() => setFormModal({ mode: "create" })}
                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                Tambah Produk
              </button>
            )}
          </div>
        }
        renderCard={(product) => (
          <TiltCard className="group flex h-full flex-col rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm">
            <div className="relative h-36 w-full overflow-hidden rounded-xl bg-ink-900/5">
              {product.image && (
                <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
              )}
              <div className="absolute left-2 top-2">
                <StatusBadge status={product.status} />
              </div>
            </div>
            <div className="mt-3 flex-1">
              <p className="font-heading text-sm font-semibold text-ink-900">{product.name}</p>
              <p className="text-xs text-ink-500">/{product.slug}</p>
              <div className="mt-2">
                <CategoryBadge label={product.category} />
              </div>
              <p className="mt-2 text-sm font-semibold text-brand-blue">{product.price}</p>
            </div>
            {canApprove && product.status === "pending" && (
              <div className="mt-3 flex justify-center">
                <ApprovalActions
                  disabled={reviewingId === product.id}
                  onApprove={() => handleReview(product, true)}
                  onReject={() => handleReview(product, false)}
                />
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => setFormModal({ mode: "edit", product })}
                  className="flex-1 rounded-lg border border-ink-900/10 py-1.5 text-center text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setPendingDelete(product)}
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
        title={formModal?.mode === "edit" ? "Edit Produk" : "Tambah Produk"}
        description={formModal?.mode === "edit" ? formModal.product.name : "Isi detail produk baru untuk portal."}
      >
        {formModal && (
          <ProductForm
            key={formModal.mode === "edit" ? formModal.product.id : "create"}
            productId={formModal.mode === "edit" ? formModal.product.id : undefined}
            defaultValues={formModal.mode === "edit" ? formModal.product : undefined}
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

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-lg bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
      {label}
    </span>
  );
}
