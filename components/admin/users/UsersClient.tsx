"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import SearchableSelect from "@/components/admin/SearchableSelect";
import { ICON_MAP } from "@/components/admin/icon-map";
import InviteUserForm from "@/components/admin/users/InviteUserForm";
import { updateUserRole, deleteUserAccount } from "@/app/admin/(dashboard)/users/actions";
import type { AdminUser } from "@/lib/cms/users";
import type { RoleRow } from "@/lib/cms/roles";
import type { UserRole } from "@/lib/supabase/types";

export default function UsersClient({
  users,
  roles,
  currentUserId,
  canCreate,
  canEdit,
  canDelete,
}: {
  users: AdminUser[];
  roles: RoleRow[];
  currentUserId: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const roleLabelByKey = new Map(roles.map((r) => [r.key, r.label]));
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  async function handleRoleChange(userId: string, role: UserRole) {
    setUpdatingRoleId(userId);
    try {
      await updateUserRole(userId, role);
      toast.success("Role berhasil diperbarui");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui role");
    } finally {
      setUpdatingRoleId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteUserAccount(pendingDelete.id);
      toast.success("Akun dihapus");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus akun");
    } finally {
      setDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        id: "avatar",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-blue-light text-xs font-semibold text-white">
            {(row.original.fullName ?? row.original.email ?? "?").charAt(0).toUpperCase()}
          </div>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Nama",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink-900">
              {row.original.fullName ?? "-"}
              {row.original.id === currentUserId && (
                <span className="ml-2 rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-medium text-brand-blue">
                  Anda
                </span>
              )}
            </p>
            <p className="text-xs text-ink-500">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const isSelf = row.original.id === currentUserId;
          if (!canEdit || isSelf) {
            return (
              <span className="inline-block rounded-lg bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
                {roleLabelByKey.get(row.original.role) ?? row.original.role}
              </span>
            );
          }
          return (
            <div className="w-40">
              <SearchableSelect
                value={row.original.role}
                onChange={(value) => handleRoleChange(row.original.id, value as UserRole)}
                disabled={updatingRoleId === row.original.id}
                options={roles.map((role) => ({ value: role.key, label: role.label, icon: ICON_MAP[role.icon] }))}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "lastSignInAt",
        header: "Terakhir Login",
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          return <span className="text-ink-500">{value ? new Date(value).toLocaleString("id-ID") : "-"}</span>;
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const isSelf = row.original.id === currentUserId;
          if (!canDelete || isSelf) return null;
          return (
            <button
              onClick={() => setPendingDelete(row.original)}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          );
        },
      },
    ],
    [canEdit, canDelete, currentUserId, updatingRoleId, roles, roleLabelByKey]
  );

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari nama atau email..."
        renderCard={(user) => (
          <div className="rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-blue-light text-sm font-semibold text-white">
                {(user.fullName ?? user.email ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{user.fullName ?? "-"}</p>
                <p className="truncate text-xs text-ink-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-block rounded-lg bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
                {roleLabelByKey.get(user.role) ?? user.role}
              </span>
              {canDelete && user.id !== currentUserId && (
                <button
                  onClick={() => setPendingDelete(user)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        )}
        actions={
          canCreate && (
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:opacity-95"
            >
              <UserPlus className="h-4 w-4" />
              Undang Pengguna
            </button>
          )
        }
      />

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Undang Pengguna" description="Kirim undangan email untuk akun baru.">
        <InviteUserForm
          roles={roles}
          onSuccess={() => {
            setInviteOpen(false);
            router.refresh();
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Hapus akun "${pendingDelete?.fullName ?? pendingDelete?.email}"?`}
        description="Akun ini akan dihapus permanen dan tidak bisa login lagi."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
