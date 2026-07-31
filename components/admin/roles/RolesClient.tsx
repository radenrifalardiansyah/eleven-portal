"use client";

import { Fragment, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LayoutGrid, List, CornerDownRight, Save, Loader2, ChevronDown, Search } from "lucide-react";
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
  const [search, setSearch] = useState("");

  function matchesSearch(item: MenuItemRow) {
    if (!search.trim()) return true;
    return item.label.toLowerCase().includes(search.toLowerCase());
  }

  // Mirrors MenuClient's hierarchy: sort order is scoped per level, so
  // top-level items and each parent's children must be sorted within their
  // own sibling list rather than by a single flat sort_order pass.
  const hierarchyByGroup = useMemo(() => {
    const map = new Map<string, { topLevel: MenuItemRow[]; childrenByParent: Map<string, MenuItemRow[]> }>();
    for (const group of groups) {
      const groupItems = items.filter((i) => i.group_id === group.id);
      const topLevel = groupItems.filter((i) => !i.parent_id).sort((a, b) => a.sort_order - b.sort_order);
      const childrenByParent = new Map<string, MenuItemRow[]>();
      for (const item of groupItems) {
        if (!item.parent_id) continue;
        const list = childrenByParent.get(item.parent_id) ?? [];
        list.push(item);
        childrenByParent.set(item.parent_id, list);
      }
      for (const list of childrenByParent.values()) list.sort((a, b) => a.sort_order - b.sort_order);
      map.set(group.id, { topLevel, childrenByParent });
    }
    return map;
  }, [groups, items]);

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
  // "Tampil di Portal" (publish) may only be granted to Admin/Super Admin —
  // other roles never get to publish content live, so the whole column is
  // hidden while viewing them instead of showing a column full of dashes.
  const canTogglePublish = activeRole === "admin" || activeRole === "super_admin";
  const visibleActions = useMemo(
    () => (canTogglePublish ? ACTIONS : ACTIONS.filter((a) => a.key !== "publish")),
    [canTogglePublish]
  );

  const publishableModules = useMemo(
    () => new Set(permissions.filter((p) => p.can_publish).map((p) => p.module_key)),
    [permissions]
  );

  // Site Settings is the only module with no approve step at all (a single
  // always-live settings object, not draft/pending/published content) — an
  // explicit exclusion rather than inferring from current permission data,
  // since Sistem modules (Users, Menu Struktur, Hak Akses Role) deliberately
  // keep Approve toggleable even though it isn't wired up yet — an approval
  // step is planned for them later.
  const NO_APPROVE_MODULES = useMemo(() => new Set(["site_settings"]), []);

  const moduleKeysAll = useMemo(() => Array.from(new Set(items.map((i) => i.module_key))), [items]);

  const dirtyRows = useMemo(() => {
    const rows: PermissionRowPatch[] = [];
    for (const { key: role } of roles) {
      // Super Admin's view/edit/delete/approve are permanently locked true
      // (see getValue/toggle below) so they can never actually differ from
      // what's saved — only can_publish can end up dirty for this role.
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

  // Super Admin's view/edit/delete/approve stay permanently full — only
  // publish ("Tampil di Portal") is a real, editable permission for this
  // role too, since the portal itself is public and doesn't check roles;
  // this only governs who's allowed to make content go live.
  function isActionLocked(action: Action) {
    return isLocked && action !== "publish";
  }

  function getValue(moduleKey: string, action: Action) {
    if (isActionLocked(action)) return true;
    return permState[activeRole]?.[moduleKey]?.[action] ?? false;
  }

  function toggle(moduleKey: string, action: Action) {
    if (isActionLocked(action)) return;
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
    if (isActionLocked(action)) return;
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
          View, Edit, Delete, dan Approve untuk Super Admin selalu penuh dan tidak bisa diubah — ini mencegah semua
          orang kehilangan akses tanpa sengaja. Khusus &ldquo;Tampil di Portal&rdquo;, izinnya bisa diatur seperti role
          lain.
        </div>
      )}

      <div className="rounded-2xl border border-ink-900/5 bg-white">
      <div className="flex flex-col gap-3 p-4 pb-0 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-heading text-sm font-semibold text-ink-900">Hak Akses per Modul</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full rounded-xl border border-ink-900/10 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
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
                {visibleActions.map((a) => (
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
                const { topLevel, childrenByParent } = hierarchyByGroup.get(group.id) ?? {
                  topLevel: [],
                  childrenByParent: new Map<string, MenuItemRow[]>(),
                };
                const visibleTopLevel = topLevel.filter(
                  (p) => matchesSearch(p) || (childrenByParent.get(p.id) ?? []).some(matchesSearch)
                );
                if (visibleTopLevel.length === 0) return null;
                const groupItems = [...topLevel, ...topLevel.flatMap((p) => childrenByParent.get(p.id) ?? [])];
                const moduleKeys = groupItems.map((i) => i.module_key);
                const collapsed = collapsedGroups.has(group.id);

                function renderRow(item: MenuItemRow) {
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
                      {visibleActions.map((a) => {
                        if (
                          (a.key === "publish" && !publishableModules.has(item.module_key)) ||
                          (a.key === "approve" && NO_APPROVE_MODULES.has(item.module_key))
                        ) {
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
                              disabled={a.key === "publish" ? false : isLocked}
                              checked={getValue(item.module_key, a.key)}
                              onChange={() => toggle(item.module_key, a.key)}
                              className="h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                }

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
                      {visibleActions.map((a) => {
                        const applicableKeys =
                          a.key === "publish"
                            ? moduleKeys.filter((k) => publishableModules.has(k))
                            : a.key === "approve"
                              ? moduleKeys.filter((k) => !NO_APPROVE_MODULES.has(k))
                              : moduleKeys;
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
                              disabled={a.key === "publish" ? false : isLocked}
                              checked={applicableKeys.every((key) => getValue(key, a.key))}
                              onChange={() => toggleGroup(applicableKeys, a.key)}
                              className="h-4 w-4 cursor-pointer rounded border-ink-900/20 accent-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
                            />
                          </td>
                        );
                      })}
                    </tr>
                    {!collapsed &&
                      visibleTopLevel.map((parent) => (
                        <Fragment key={parent.id}>
                          {renderRow(parent)}
                          {(childrenByParent.get(parent.id) ?? []).map((child) => renderRow(child))}
                        </Fragment>
                      ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const { topLevel, childrenByParent } = hierarchyByGroup.get(group.id) ?? {
              topLevel: [],
              childrenByParent: new Map<string, MenuItemRow[]>(),
            };
            const visibleTopLevel = topLevel.filter(
              (p) => matchesSearch(p) || (childrenByParent.get(p.id) ?? []).some(matchesSearch)
            );
            if (visibleTopLevel.length === 0) return null;
            const groupItems = [...topLevel, ...topLevel.flatMap((p) => childrenByParent.get(p.id) ?? [])];
            const moduleKeys = groupItems.map((i) => i.module_key);
            const collapsed = collapsedGroups.has(group.id);

            function renderCard(item: MenuItemRow) {
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
                    {visibleActions.map((a) => {
                      if (
                        (a.key === "publish" && !publishableModules.has(item.module_key)) ||
                        (a.key === "approve" && NO_APPROVE_MODULES.has(item.module_key))
                      )
                        return null;
                      return (
                        <label key={a.key} className="flex items-center gap-1.5 text-xs text-ink-500">
                          <input
                            type="checkbox"
                            disabled={a.key === "publish" ? false : isLocked}
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
            }

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
                    {visibleActions.map((a) => {
                      const applicableKeys =
                        a.key === "publish"
                          ? moduleKeys.filter((k) => publishableModules.has(k))
                          : a.key === "approve"
                            ? moduleKeys.filter((k) => !NO_APPROVE_MODULES.has(k))
                            : moduleKeys;
                      if (applicableKeys.length === 0) return null;
                      return (
                        <label key={a.key} className="flex items-center gap-1.5 text-xs text-ink-500">
                          <input
                            type="checkbox"
                            disabled={a.key === "publish" ? false : isLocked}
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
                    {visibleTopLevel.map((parent) => (
                      <Fragment key={parent.id}>
                        {renderCard(parent)}
                        {(childrenByParent.get(parent.id) ?? []).map((child) => renderCard(child))}
                      </Fragment>
                    ))}
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
          disabled={saving}
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
