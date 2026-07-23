"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ALL_ROLES, ROLE_LABELS, type Action } from "@/lib/auth/permissions";
import { updateRolePermission, bulkUpdateRolePermission } from "@/app/admin/(dashboard)/roles/actions";
import type { MenuGroupRow, MenuItemRow } from "@/lib/cms/menu";
import type { AdminUser } from "@/lib/cms/users";
import type { UserRole } from "@/lib/supabase/types";

type PermRow = {
  role: UserRole;
  module_key: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_publish: boolean;
};

type PermState = Record<string, Record<string, Record<Action, boolean>>>;

const ACTIONS: { key: Action; label: string }[] = [
  { key: "view", label: "View" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "approve", label: "Approve" },
  { key: "publish", label: "Tampil di Portal" },
];

function toPermState(rows: PermRow[]): PermState {
  const state: PermState = {};
  for (const role of ALL_ROLES) state[role] = {};
  for (const row of rows) {
    state[row.role][row.module_key] = {
      view: row.can_view,
      edit: row.can_edit,
      delete: row.can_delete,
      approve: row.can_approve,
      publish: row.can_publish,
    };
  }
  return state;
}

export default function RolesClient({
  groups,
  items,
  permissions,
  users,
}: {
  groups: MenuGroupRow[];
  items: MenuItemRow[];
  permissions: PermRow[];
  users: AdminUser[];
}) {
  const [activeRole, setActiveRole] = useState<UserRole>("admin");
  const [permState, setPermState] = useState<PermState>(() => toPermState(permissions));

  const roleUsers = useMemo(() => users.filter((u) => u.role === activeRole), [users, activeRole]);
  const isLocked = activeRole === "super_admin";

  function getValue(moduleKey: string, action: Action) {
    return permState[activeRole]?.[moduleKey]?.[action] ?? false;
  }

  async function toggle(moduleKey: string, action: Action) {
    if (isLocked) return;
    const next = !getValue(moduleKey, action);

    setPermState((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [moduleKey]: { ...prev[activeRole]?.[moduleKey], [action]: next } as Record<Action, boolean>,
      },
    }));

    try {
      await updateRolePermission(activeRole, moduleKey, action, next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui hak akses");
      setPermState((prev) => ({
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          [moduleKey]: { ...prev[activeRole]?.[moduleKey], [action]: !next } as Record<Action, boolean>,
        },
      }));
    }
  }

  async function toggleGroup(groupModuleKeys: string[], action: Action) {
    if (isLocked) return;
    const allChecked = groupModuleKeys.every((key) => getValue(key, action));
    const next = !allChecked;

    setPermState((prev) => {
      const rolePerm = { ...prev[activeRole] };
      for (const key of groupModuleKeys) {
        rolePerm[key] = { ...rolePerm[key], [action]: next } as Record<Action, boolean>;
      }
      return { ...prev, [activeRole]: rolePerm };
    });

    try {
      await bulkUpdateRolePermission(activeRole, groupModuleKeys, action, next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui hak akses");
      setPermState(toPermState(permissions));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl border border-ink-900/10 bg-white p-1.5">
        {ALL_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeRole === role ? "bg-brand-blue/10 text-brand-blue" : "text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-900/5 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold text-ink-900">
            Pengguna dengan Role {ROLE_LABELS[activeRole]}
          </p>
          <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
            {roleUsers.length} pengguna
          </span>
        </div>
        {roleUsers.length === 0 ? (
          <p className="text-sm text-ink-500">Belum ada pengguna dengan role ini.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {roleUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 rounded-xl bg-ink-900/[0.03] px-3 py-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-blue-light text-xs font-semibold text-white">
                  {(u.fullName ?? u.email ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{u.fullName ?? "-"}</p>
                  <p className="truncate text-xs text-ink-500">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLocked && (
        <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-4 text-sm text-brand-blue">
          Hak akses Super Admin selalu penuh dan tidak bisa diubah — ini mencegah semua orang kehilangan akses tanpa
          sengaja.
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-ink-900/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-900/5 bg-ink-900/[0.02]">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Menu
              </th>
              {ACTIONS.map((a) => (
                <th
                  key={a.key}
                  className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-500"
                >
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const groupItems = items.filter((i) => i.group_id === group.id);
              if (groupItems.length === 0) return null;
              const moduleKeys = groupItems.map((i) => i.module_key);
              return (
                <>
                  <tr key={`group-${group.id}`} className="border-b border-ink-900/5 bg-ink-900/[0.02]">
                    <td className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      {group.label}
                    </td>
                    {ACTIONS.map((a) => (
                      <td key={a.key} className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          disabled={isLocked}
                          checked={moduleKeys.every((key) => getValue(key, a.key))}
                          onChange={() => toggleGroup(moduleKeys, a.key)}
                          className="h-4 w-4 rounded border-ink-900/20 disabled:opacity-40"
                        />
                      </td>
                    ))}
                  </tr>
                  {groupItems.map((item) => (
                    <tr key={item.id} className="border-b border-ink-900/5 last:border-0">
                      <td className="px-4 py-3 text-ink-900">{item.label}</td>
                      {ACTIONS.map((a) => (
                        <td key={a.key} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={getValue(item.module_key, a.key)}
                            onChange={() => toggle(item.module_key, a.key)}
                            className="h-4 w-4 rounded border-ink-900/20 disabled:opacity-40"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
