"use client";

import { useMemo, useState } from "react";
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
import TeamAvatar from "@/components/ui/TeamAvatar";
import { deleteTeamMember, importTeamMembers, reviewTeamMember } from "@/app/admin/(dashboard)/team/actions";
import TeamMemberForm from "@/components/admin/team/TeamMemberForm";
import { teamMemberToExcelRow, excelRowToTeamMemberInput } from "@/components/admin/team/excel";
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

  const columns = useMemo<ColumnDef<TeamMember, unknown>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="h-10 w-10 overflow-hidden rounded-lg">
            <TeamAvatar name={row.original.name} className="h-full w-full" />
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
        ),
      },
    ],
    [canEdit, canDelete, canApprove, reviewingId]
  );

  return (
    <>
      <DataTable
        data={members}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari anggota tim..."
        actions={
          <div className="flex items-center gap-2">
            <ExcelActions onExport={handleExport} onImport={canCreate ? handleImport : undefined} importing={importing} />
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
        renderCard={(member) => (
          <TiltCard className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-900/5 bg-white shadow-sm">
            <div className="relative h-36 w-full">
              <TeamAvatar name={member.name} className="h-full w-full" />
              <div className="absolute right-2 top-2">
                <StatusBadge status={member.status} />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="font-heading text-sm font-semibold text-ink-900">{member.name}</p>
              <p className="text-xs text-brand-blue">{member.position}</p>
              <p className="mt-2 flex-1 text-xs text-ink-500">/{member.slug}</p>
              {canApprove && member.status === "pending" && (
                <div className="mb-2 flex justify-center">
                  <ApprovalActions
                    disabled={reviewingId === member.id}
                    onApprove={() => handleReview(member, true)}
                    onReject={() => handleReview(member, false)}
                  />
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
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
        )}
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
    </>
  );
}
