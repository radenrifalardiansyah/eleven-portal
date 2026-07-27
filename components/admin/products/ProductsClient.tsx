"use client";

import { useMemo, useRef, useState } from "react";
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
  deleteProduct,
  deleteProducts,
  importProducts,
  moveProduct,
  reviewProduct,
  reviewProducts,
} from "@/app/admin/(dashboard)/products/actions";
import ProductForm from "@/components/admin/products/ProductForm";
import { productToExcelRow, excelRowToProductImportRow, downloadProductImportTemplate } from "@/components/admin/products/excel";
import { exportRowsToExcel, parseExcelFile } from "@/lib/excel";
import type { Product } from "@/lib/cms/products";
import type { Service } from "@/lib/cms/services";
import { formatPrice } from "@/lib/currency";

type FormModalState = { mode: "create" } | { mode: "edit"; product: Product } | null;

export default function ProductsClient({
  products,
  services,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  canPublish,
}: {
  products: Product[];
  services: Service[];
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
  const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds[p.id]),
    [products, selectedIds]
  );
  const selectedPendingProducts = useMemo(
    () => selectedProducts.filter((p) => p.status === "pending"),
    [selectedProducts]
  );

  function handleExport() {
    exportRowsToExcel(products.map(productToExcelRow), "products");
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      const inputs = rows.map(excelRowToProductImportRow).filter((r) => r !== null);
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

  async function handleMove(id: string, direction: "up" | "down") {
    setMovingId(id);
    try {
      await moveProduct(id, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan urutan produk");
    } finally {
      setMovingId(null);
    }
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    try {
      await deleteProducts(selectedProducts.map((p) => ({ id: p.id, slug: p.slug })));
      toast.success(`${selectedProducts.length} produk dihapus`);
      setSelectedIds({});
      setBulkDeleteConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus produk terpilih");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleBulkApprove() {
    setBulkApproving(true);
    try {
      await reviewProducts(
        selectedPendingProducts.map((p) => ({ id: p.id, slug: p.slug })),
        true
      );
      toast.success(`${selectedPendingProducts.length} produk disetujui & tayang`);
      setSelectedIds({});
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui produk terpilih");
    } finally {
      setBulkApproving(false);
    }
  }

  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="relative mx-auto h-10 w-10 overflow-hidden rounded-lg bg-ink-900/5">
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
        accessorKey: "serviceTitle",
        header: "Layanan",
        cell: ({ getValue }) => <CategoryBadge label={getValue<string>()} />,
      },
      {
        id: "price",
        header: "Harga",
        cell: ({ row }) => formatPrice(row.original.price_amount, row.original.price_currency),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<Product["status"]>()} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const position = products.findIndex((p) => p.id === row.original.id);
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
                      disabled={movingId === row.original.id || position === products.length - 1}
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
          );
        },
      },
    ],
    [canEdit, canDelete, canApprove, reviewingId, movingId, products]
  );

  const canBulkSelect = canDelete || canApprove;

  return (
    <>
      {canBulkSelect && selectedProducts.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-2.5">
          <span className="text-sm font-medium text-ink-900">{selectedProducts.length} produk dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && selectedPendingProducts.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Setujui Terpilih ({selectedPendingProducts.length})
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
        data={products}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari produk..."
        selection={canBulkSelect ? { selectedIds, onChange: setSelectedIds } : undefined}
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions
              onExport={handleExport}
              onImport={canCreate ? handleImport : undefined}
              onDownloadTemplate={canCreate ? downloadProductImportTemplate : undefined}
              importing={importing}
            />
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
        renderCard={(product) => {
          const position = products.findIndex((p) => p.id === product.id);
          return (
          <TiltCard className="group flex h-full flex-col rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm">
            <div className="relative h-36 w-full overflow-hidden rounded-xl bg-ink-900/5">
              <GalleryCarousel images={[product.image, ...product.gallery].filter(Boolean)} alt={product.name} />
              <div className="absolute left-2 top-2">
                <StatusBadge status={product.status} />
              </div>
            </div>
            <div className="mt-3 flex-1">
              <p className="font-heading text-sm font-semibold text-ink-900">{product.name}</p>
              <p className="text-xs text-ink-500">/{product.slug}</p>
              <div className="mt-2">
                <CategoryBadge label={product.serviceTitle} />
              </div>
              <p className="mt-2 text-sm font-semibold text-brand-blue">
                {formatPrice(product.price_amount, product.price_currency)}
              </p>
              {canEdit && <p className="mt-1 text-xs text-ink-500">Urutan #{position + 1}</p>}
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
                <div className="flex flex-col">
                  <button
                    disabled={movingId === product.id || position === 0}
                    onClick={() => handleMove(product.id, "up")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    aria-label="Naikkan urutan"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={movingId === product.id || position === products.length - 1}
                    onClick={() => handleMove(product.id, "down")}
                    className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                    aria-label="Turunkan urutan"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
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
          );
        }}
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
            services={services}
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
        title={`Hapus ${selectedProducts.length} produk terpilih?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </>
  );
}

/** Card-view photo preview: swipeable when a product has more than one photo
 *  (main image + gallery), so reviewers can flip through without opening edit. */
function GalleryCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const startXRef = useRef<number | null>(null);

  if (images.length === 0) return null;

  function handlePointerDown(e: React.PointerEvent) {
    startXRef.current = e.clientX;
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (startXRef.current === null) return;
    const delta = e.clientX - startXRef.current;
    startXRef.current = null;
    const threshold = 30;
    if (delta > threshold) {
      setIndex((i) => (i - 1 + images.length) % images.length);
    } else if (delta < -threshold) {
      setIndex((i) => (i + 1) % images.length);
    }
  }

  return (
    <div
      className={`relative h-full w-full select-none ${images.length > 1 ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
      onPointerDown={images.length > 1 ? handlePointerDown : undefined}
      onPointerUp={images.length > 1 ? handlePointerUp : undefined}
    >
      <Image src={images[index]} alt={alt} fill className="pointer-events-none object-cover" unoptimized />
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 w-1.5 rounded-full transition ${i === index ? "bg-white" : "bg-white/40"}`}
              aria-label={`Foto ke-${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-lg bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
      {label}
    </span>
  );
}
