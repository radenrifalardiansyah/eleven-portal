"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, ChevronUp, ChevronDown, Instagram, Facebook, Twitter } from "lucide-react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import ExcelActions from "@/components/admin/ExcelActions";
import StatusBadge from "@/components/admin/StatusBadge";
import ApprovalActions from "@/components/admin/ApprovalActions";
import TiltCard from "@/components/ui/TiltCard";
import TeamAvatar from "@/components/ui/TeamAvatar";
import {
  deleteTeamMember,
  deleteTeamMembers,
  importTeamMembers,
  moveTeamMember,
  reviewTeamMember,
  reviewTeamMembers,
} from "@/app/admin/(dashboard)/team/actions";
import TeamMemberForm from "@/components/admin/team/TeamMemberForm";
import { teamMemberToExcelRow, excelRowToTeamMemberInput, downloadTeamMemberImportTemplate } from "@/components/admin/team/excel";
import { exportRowsToExcel, parseExcelFile } from "@/lib/excel";
import type { TeamMember } from "@/lib/cms/team";

type FormModalState = { mode: "create" } | { mode: "edit"; member: TeamMember } | null;

export default function TeamClient({
  members,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  canPublish,
}: {
  members: TeamMember[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [importing, setImporting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);

  const selectedMembers = useMemo(
    () => members.filter((m) => selectedIds[m.id]),
    [members, selectedIds]
  );
  const selectedPendingMembers = useMemo(
    () => selectedMembers.filter((m) => m.status === "pending"),
    [selectedMembers]
  );

  function handleExport() {
    exportRowsToExcel(members.map(teamMemberToExcelRow), "team");
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      const inputs = rows.map(excelRowToTeamMemberInput).filter((r) => r !== null);
      if (inputs.length === 0) {
        toast.error("Tidak ada baris valid ditemukan di file tersebut");
        return;
      }
      await importTeamMembers(inputs);
      toast.success(`${inputs.length} anggota tim berhasil diimpor`);
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
      await deleteTeamMember(pendingDelete.id, pendingDelete.slug);
      toast.success("Anggota tim dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus anggota tim");
    } finally {
      setDeleting(false);
    }
  }

  async function handleReview(member: TeamMember, approve: boolean) {
    setReviewingId(member.id);
    try {
      await reviewTeamMember(member.id, member.slug, approve);
      toast.success(approve ? "Anggota tim disetujui & tayang" : "Anggota tim dikembalikan ke draft");
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
      await moveTeamMember(id, direction);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindahkan urutan anggota tim");
    } finally {
      setMovingId(null);
    }
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true);
    try {
      await deleteTeamMembers(selectedMembers.map((m) => ({ id: m.id, slug: m.slug })));
      toast.success(`${selectedMembers.length} anggota tim dihapus`);
      setSelectedIds({});
      setBulkDeleteConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus anggota tim terpilih");
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleBulkApprove() {
    setBulkApproving(true);
    try {
      await reviewTeamMembers(
        selectedPendingMembers.map((m) => ({ id: m.id, slug: m.slug })),
        true
      );
      toast.success(`${selectedPendingMembers.length} anggota tim disetujui & tayang`);
      setSelectedIds({});
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui anggota tim terpilih");
    } finally {
      setBulkApproving(false);
    }
  }

  const columns = useMemo<ColumnDef<TeamMember, unknown>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="h-10 w-10 overflow-hidden rounded-lg">
            <TeamAvatar name={row.original.name} photoUrl={row.original.photo_url} className="h-full w-full" />
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
      { accessorKey: "position", header: "Jabatan" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<TeamMember["status"]>()} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const position = members.findIndex((m) => m.id === row.original.id);
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
                      disabled={movingId === row.original.id || position === members.length - 1}
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
                  onClick={() => setFormModal({ mode: "edit", member: row.original })}
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
    [canEdit, canDelete, canApprove, reviewingId, movingId, members]
  );

  const canBulkSelect = canDelete || canApprove;

  return (
    <>
      {canBulkSelect && selectedMembers.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-2.5">
          <span className="text-sm font-medium text-ink-900">{selectedMembers.length} anggota tim dipilih</span>
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && selectedPendingMembers.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Setujui Terpilih ({selectedPendingMembers.length})
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
        data={members}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari anggota tim..."
        selection={canBulkSelect ? { selectedIds, onChange: setSelectedIds } : undefined}
        renderExpandedRow={(member) => (
          <TeamMemberDetail
            member={member}
            canEdit={canEdit}
            onEdit={() => setFormModal({ mode: "edit", member })}
          />
        )}
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions
              onExport={handleExport}
              onImport={canCreate ? handleImport : undefined}
              onDownloadTemplate={canCreate ? downloadTeamMemberImportTemplate : undefined}
              importing={importing}
            />
            {canCreate && (
              <button
                onClick={() => setFormModal({ mode: "create" })}
                className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
              >
                <Plus className="h-4 w-4" />
                Tambah Anggota
              </button>
            )}
          </div>
        }
        renderCard={(member) => {
          const position = members.findIndex((m) => m.id === member.id);
          return (
          <TiltCard className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-sm">
            <div className="relative h-36 w-full">
              <TeamAvatar name={member.name} photoUrl={member.photo_url} className="h-full w-full" />
              <div className="absolute right-2 top-2">
                <StatusBadge status={member.status} />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="font-heading text-sm font-semibold text-ink-900">{member.name}</p>
              <p className="text-xs text-brand-blue">{member.position}</p>
              <p className="mt-2 flex-1 text-xs text-ink-500">/{member.slug}</p>
              {canEdit && <p className="text-xs text-ink-500">Urutan #{position + 1}</p>}
              {canApprove && member.status === "pending" && (
                <div className="mb-2 mt-2 flex justify-center">
                  <ApprovalActions
                    disabled={reviewingId === member.id}
                    onApprove={() => handleReview(member, true)}
                    onReject={() => handleReview(member, false)}
                  />
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                {canEdit && (
                  <div className="flex flex-col">
                    <button
                      disabled={movingId === member.id || position === 0}
                      onClick={() => handleMove(member.id, "up")}
                      className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      aria-label="Naikkan urutan"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={movingId === member.id || position === members.length - 1}
                      onClick={() => handleMove(member.id, "down")}
                      className="text-ink-400 hover:text-ink-700 disabled:opacity-30"
                      aria-label="Turunkan urutan"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {canEdit && (
                  <button
                    onClick={() => setFormModal({ mode: "edit", member })}
                    className="flex-1 rounded-lg border border-ink-900/10 py-1.5 text-center text-xs font-medium text-ink-700 hover:bg-ink-900/5"
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setPendingDelete(member)}
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
        title={formModal?.mode === "edit" ? "Edit Anggota Tim" : "Tambah Anggota Tim"}
        description={formModal?.mode === "edit" ? formModal.member.name : "Isi detail anggota tim baru."}
      >
        {formModal && (
          <TeamMemberForm
            key={formModal.mode === "edit" ? formModal.member.id : "create"}
            memberId={formModal.mode === "edit" ? formModal.member.id : undefined}
            defaultValues={formModal.mode === "edit" ? formModal.member : undefined}
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
        title={`Hapus ${selectedMembers.length} anggota tim terpilih?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </>
  );
}

function TeamMemberDetail({
  member,
  canEdit,
  onEdit,
}: {
  member: TeamMember;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const socials = member.socials;
  const hasSocials = socials.instagram || socials.facebook || socials.twitter;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <TeamAvatar name={member.name} photoUrl={member.photo_url} className="h-14 w-14 rounded-xl" />
        <div>
          <p className="font-heading text-sm font-semibold text-ink-900">{member.name}</p>
          <p className="text-xs text-brand-blue">{member.position}</p>
        </div>
        <StatusBadge status={member.status} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Bio Singkat</p>
        <p className="mt-1 text-sm text-ink-900">{member.bio}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Bio Lengkap</p>
        <p className="mt-1 whitespace-pre-line text-sm text-ink-900">{member.long_bio}</p>
      </div>

      {hasSocials && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Sosial Media</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-ink-900/5 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-900/10"
              >
                <Instagram className="h-3.5 w-3.5" />
                Instagram
              </a>
            )}
            {socials.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-ink-900/5 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-900/10"
              >
                <Facebook className="h-3.5 w-3.5" />
                Facebook
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-ink-900/5 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-900/10"
              >
                <Twitter className="h-3.5 w-3.5" />
                Twitter
              </a>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 border-t border-ink-900/5 pt-4 text-xs text-ink-500">
        <p>Dibuat: {new Date(member.created_at).toLocaleString("id-ID")}</p>
        <p>Diperbarui: {new Date(member.updated_at).toLocaleString("id-ID")}</p>
      </div>

      {canEdit && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
          >
            <Pencil className="h-4 w-4" />
            Edit Anggota
          </button>
        </div>
      )}
    </div>
  );
}
