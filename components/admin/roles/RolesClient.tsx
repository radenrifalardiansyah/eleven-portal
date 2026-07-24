"use client";

import { Fragment, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LayoutGrid, List, CornerDownRight, Save, Loader2, ChevronDown } from "lucide-react";
import { type Action } from "@/lib/auth/permissions";
import { saveRolePermissions, type PermissionRowPatch } from "@/app/admin/(dashboard)/roles/actions";
import { ICON_MAP } from "@/components/admin/icon-map";
import type { MenuGroupRow, MenuItemRow } from "@/lib/cms/menu";
import type { AdminUser } from "@/lib/cms/users";
import type { RoleRow } from "@/lib/cms/roles";
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

const EMPTY_PERMISSION: Record<Action, boolean> = {
  view: false,
  edit: false,
  delete: false,
  approve: false,
  publish: false,
};

const ACTIONS: { key: Action; label: string }[] = [
  { key: "view", label: "View" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "approve", label: "Approve" },
  { key: "publish", label: "Tampil di Portal" },
];

function toPermState(rows: PermRow[], roles: RoleRow[]): PermState {
  const state: PermState = {};
  for (const role of roles) state[role.key] = {};
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
  roles,
}: {
  groups: MenuGroupRow[];
  items: MenuItemRow[];
  permissions: PermRow[];
  users: AdminUser[];
  roles: RoleRow[];
}) {
  const searchParams = useSearchParams();
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const fromQuery = searchParams.get("role");
    if (fromQuery && roles.some((r) => r.key === fromQuery)) return fromQuery;
    return roles.find((r) => r.key !== "super_admin")?.key ?? roles[0]?.key ?? "admin";
  });
  const [permState, setPermState] = useState<PermState>(() => toPermState(permissions, roles));
  const [savedPermState, setSavedPermState] = useState<PermState>(() => toPermState(permissions, roles));
  const [view, setView] = useState<"table" | "card">("table");
  const [saving, setSaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  function toggleGroupCollapse(groupId: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  const roleUsers = useMemo(() => users.filter((u) => u.role === activeRole), [users, activeRole]);
  const isLocked = activeRole === "super_admin";

  const publishableModules = useMemo(
    () => new Set(permissions.filter((p) => p.can_publish).map((p) => p.module_key)),
    [permissions]
  );

  const moduleKeysAll = useMemo(() => Array.from(new Set(items.map((i) => i.module_key))), [items]);

  const dirtyRows = useMemo(() => {
    const rows: PermissionRowPatch[] = [];
    for (const { key: role } of roles) {
      if (role === "super_admin") continue;
      for (const moduleKey of moduleKeysAll) {
        const cur = permState[role]?.[moduleKey];
        if (!cur) continue;
        const saved = savedPermState[role]?.[moduleKey];
        const changed =
          !saved ||
          cur.view !== saved.view ||
          cur.edit !== saved.edit ||
          cur.delete !== saved.delete ||
          cur.approve !== saved.approve ||
          cur.publish !== saved.publish;
        if (changed) {
          rows.push({
            role,
            module_key: moduleKey,
            can_view: cur.view,
            can_edit: cur.edit,
            can_delete: cur.delete,
            can_approve: cur.approve,
            can_publish: cur.publish,
          });
        }
      }
    }
    return rows;
  }, [permState, savedPermState, moduleKeysAll, roles]);

  const isDirty = dirtyRows.length > 0;

  function getValue(moduleKey: string, action: Action) {
    return permState[activeRole]?.[moduleKey]?.[action] ?? false;
  }

  function toggle(moduleKey: string, action: Action) {
    if (isLocked) return;
    const current = permState[activeRole]?.[moduleKey] ?? EMPTY_PERMISSION;
    const next = !current[action];

    setPermState((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [moduleKey]: { ...current, [action]: next },
      },
    }));
  }

  function toggleGroup(groupModuleKeys: string[], action: Action) {
    if (isLocked) return;
    const allChecked = groupModuleKeys.every((key) => getValue(key, action));
    const next = !allChecked;

    setPermState((prev) => {
      const rolePerm = { ...prev[activeRole] };
      for (const key of groupModuleKeys) {
        const current = rolePerm[key] ?? EMPTY_PERMISSION;
        rolePerm[key] = { ...current, [action]: next };
      }
      return { ...prev, [activeRole]: rolePerm };
    });
  }

  async function handleSave() {
    if (dirtyRows.length === 0) return;
    setSaving(true);
    try {
      await saveRolePermissions(dirtyRows);
      setSavedPermState(permState);
      toast.success("Hak akses disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan hak akses");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl border border-ink-900/10 bg-white p-1.5">
        {roles.map((role) => {
          const RoleIcon = ICON_MAP[role.icon];
          return (
            <button
              key={role.key}
              onClick={() => setActiveRole(role.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeRole === role.key ? "bg-brand-blue/10 text-brand-blue" : "text-ink-700 hover:bg-ink-900/5"
              }`}
            >
              {RoleIcon && <RoleIcon className="h-4 w-4" />}
              {role.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-ink-900/5 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold text-ink-900">
            Pengguna dengan Role {roles.find((r) => r.key === activeRole)?.label ?? activeRole}
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

      <div className="rounded-2xl border border-ink-900/5 bg-white">
      <div className="flex items-center justify-between p-4 pb-0">
        <p className="font-heading text-sm font-semibold text-ink-900">Hak Akses per Modul</p>
        <div className="flex items-center gap-1 rounded-xl border border-ink-900/10 bg-white p-1">
          <button
            onClick={() => setView("table")}
            className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
              view === "table" ? "bg-brand-blue/10 text-brand-blue" : "text-ink-500 hover:bg-ink-900/5"
            }`}
            aria-label="Table view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("card")}
            className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
              view === "card" ? "bg-brand-blue/10 text-brand-blue" : "text-ink-500 hover:bg-ink-900/5"
            }`}
            aria-label="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
      {view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-ink-900/5">
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
                const collapsed = collapsedGroups.has(group.id);
                return (
                  <Fragment key={group.id}>
                    <tr className="border-b border-ink-900/5 bg-ink-900/[0.02]">
                      <td className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapse(group.id)}
                          className="flex items-center gap-1.5 normal-case tracking-normal hover:text-ink-900"
                        >
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
                          <span className="uppercase tracking-wide">{group.label}</span>
                          <span className="normal-case text-ink-500/70">({groupItems.length})</span>
                        </button>
                      </td>
                      {ACTIONS.map((a) => {
                        const applicableKeys =
                          a.key === "publish" ? moduleKeys.filter((k) => publishableModules.has(k)) : moduleKeys;
                        if (applicableKeys.length === 0) {
                          return (
                            <td key={a.key} className="px-4 py-2 text-center text-ink-900/30">
                              —
                            </td>
                          );
                        }
                        return (
                          <td key={a.key} className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              disabled={isLocked}
                              checked={applicableKeys.every((key) => getValue(key, a.key))}
                              onChange={() => toggleGroup(applicableKeys, a.key)}
                              className="h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                            />
                          </td>
                        );
                      })}
                    </tr>
                    {!collapsed &&
                      groupItems.map((item) => {
                        const Icon = ICON_MAP[item.icon];
                        return (
                          <tr key={item.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.015]">
                            <td className="px-4 py-3 text-ink-900">
                              <div className={`flex items-center gap-2 ${item.parent_id ? "pl-5" : ""}`}>
                                {item.parent_id && <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-ink-900/30" />}
                                {Icon && <Icon className="h-4 w-4 shrink-0 text-ink-500" />}
                                {item.label}
                              </div>
                            </td>
                            {ACTIONS.map((a) => {
                              if (a.key === "publish" && !publishableModules.has(item.module_key)) {
                                return (
                                  <td key={a.key} className="px-4 py-3 text-center text-ink-900/30">
                                    —
                                  </td>
                                );
                              }
                              return (
                                <td key={a.key} className="px-4 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    disabled={isLocked}
                                    checked={getValue(item.module_key, a.key)}
                                    onChange={() => toggle(item.module_key, a.key)}
                                    className="h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const groupItems = items.filter((i) => i.group_id === group.id);
            if (groupItems.length === 0) return null;
            const moduleKeys = groupItems.map((i) => i.module_key);
            const collapsed = collapsedGroups.has(group.id);
            return (
              <div key={`group-card-${group.id}`} className="overflow-hidden rounded-2xl border border-ink-900/5 bg-white">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleGroupCollapse(group.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500 hover:text-ink-900"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
                    {group.label}
                    <span className="normal-case text-ink-500/70">({groupItems.length})</span>
                  </button>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {ACTIONS.map((a) => {
                      const applicableKeys =
                        a.key === "publish" ? moduleKeys.filter((k) => publishableModules.has(k)) : moduleKeys;
                      if (applicableKeys.length === 0) return null;
                      return (
                        <label key={a.key} className="flex items-center gap-1.5 text-xs text-ink-500">
                          <input
                            type="checkbox"
                            disabled={isLocked}
                            checked={applicableKeys.every((key) => getValue(key, a.key))}
                            onChange={() => toggleGroup(applicableKeys, a.key)}
                            className="h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                          />
                          {a.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                {!collapsed && (
                  <div className="grid grid-cols-1 gap-3 border-t border-ink-900/5 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupItems.map((item) => {
                      const Icon = ICON_MAP[item.icon];
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-ink-900/5 bg-ink-900/[0.02] p-3 transition hover:border-brand-blue/20 hover:bg-brand-blue/[0.03]"
                        >
                          <div className={`mb-2.5 flex items-center gap-2 text-sm font-medium text-ink-900 ${item.parent_id ? "pl-3" : ""}`}>
                            {item.parent_id && <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-ink-900/30" />}
                            {Icon && <Icon className="h-4 w-4 shrink-0 text-ink-500" />}
                            <span className="truncate">{item.label}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                            {ACTIONS.map((a) => {
                              if (a.key === "publish" && !publishableModules.has(item.module_key)) return null;
                              return (
                                <label key={a.key} className="flex items-center gap-1.5 text-xs text-ink-500">
                                  <input
                                    type="checkbox"
                                    disabled={isLocked}
                                    checked={getValue(item.module_key, a.key)}
                                    onChange={() => toggle(item.module_key, a.key)}
                                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-ink-900/20 accent-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                                  />
                                  <span className="truncate">{a.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-ink-900/5 p-4">
        {isDirty && (
          <span className="mr-auto rounded-full bg-brand-yellow/20 px-2.5 py-1 text-xs font-medium text-ink-700">
            Ada perubahan belum disimpan
          </span>
        )}
        <button
          onClick={() => (isDirty ? handleSave() : toast.info("Tidak ada perubahan untuk disimpan"))}
          disabled={saving || isLocked}
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/25 transition hover:bg-brand-blue-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan
        </button>
      </div>
      </div>
    </div>
  );
}
