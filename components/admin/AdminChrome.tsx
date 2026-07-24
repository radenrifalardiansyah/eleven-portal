"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, LogOut, ChevronRight, ChevronDown, Globe } from "lucide-react";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "./ConfirmDialog";
import { ICON_MAP } from "./icon-map";
import type { NavGroup } from "@/lib/auth/nav";
import type { CurrentProfile } from "@/lib/auth/session";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import type { NavItem } from "@/lib/auth/nav";

export default function AdminChrome({
  profile,
  navGroups,
  children,
}: {
  profile: CurrentProfile;
  navGroups: NavGroup[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.parentId && (pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href)))) {
          initial.add(item.parentId);
        }
      }
    }
    return initial;
  });

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleSubmenu(itemId: string) {
    setOpenSubmenus((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const flatItems = navGroups.flatMap((g) => g.items);
  const currentLabel = flatItems.find((n) => n.href === pathname)?.label ?? "Dashboard";
  const initial = (profile.fullName ?? profile.email ?? "?").charAt(0).toUpperCase();
  const bottomNavItems = flatItems.filter((item) => item.showBottomNav).slice(0, 4);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow-lg shadow-brand-blue/30">
          11
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-ink-900">Eleven Digital</p>
          <p className="text-xs text-ink-500">Content Studio</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => {
          const collapsed = collapsedGroups.has(group.label);
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500/70 hover:text-ink-700"
              >
                {group.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pb-1">
                      {group.items
                        .filter((item) => !item.parentId)
                        .map((item) => {
                          const children = group.items.filter((child) => child.parentId === item.id);
                          const hasChildren = children.length > 0;
                          const submenuOpen = openSubmenus.has(item.id);
                          return (
                            <div key={item.id}>
                              <div className="flex items-center gap-1">
                                <NavLink
                                  item={item}
                                  pathname={pathname}
                                  onNavigate={() => setMobileOpen(false)}
                                  className="flex-1"
                                />
                                {hasChildren && (
                                  <button
                                    type="button"
                                    onClick={() => toggleSubmenu(item.id)}
                                    aria-label={submenuOpen ? "Tutup submenu" : "Buka submenu"}
                                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-ink-900/5 hover:text-ink-700"
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform ${submenuOpen ? "" : "-rotate-90"}`}
                                    />
                                  </button>
                                )}
                              </div>
                              {hasChildren && (
                                <AnimatePresence initial={false}>
                                  {submenuOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                      className="overflow-hidden"
                                    >
                                      <div className="ml-4 space-y-1 border-l border-ink-900/5 pl-3 pt-1">
                                        {children.map((child) => (
                                          <NavLink
                                            key={child.id}
                                            item={child}
                                            pathname={pathname}
                                            onNavigate={() => setMobileOpen(false)}
                                          />
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-ink-900/5 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-ink-900/[0.03] p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-blue-light text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">
              {profile.fullName ?? profile.email}
            </p>
            <p className="text-xs text-ink-500">{profile.roleLabel}</p>
          </div>
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            aria-label="Logout"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <Toaster richColors position="top-right" />
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Logout dari akun?"
        description="Kamu perlu login kembali untuk mengakses Content Studio."
        confirmLabel="Logout"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-ink-900/5 bg-white lg:block">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-700 hover:bg-ink-900/5 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="flex-1 font-heading text-sm font-semibold text-ink-900">{currentLabel}</p>

            <InstallPrompt />

            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-full border border-ink-900/10 px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-ink-900/5 sm:flex"
            >
              <Globe className="h-3.5 w-3.5" />
              Website
            </Link>

            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-blue-light text-xs font-semibold text-white">
              {initial}
            </div>
          </div>
          <div className="h-[3px] w-full bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-yellow" />
        </header>

        <main className="p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-ink-900/5 bg-white/95 py-2 backdrop-blur lg:hidden">
        {bottomNavItems.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${
                active ? "text-brand-blue" : "text-ink-500"
              }`}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-ink-500"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
      </nav>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  onNavigate,
  className = "",
}: {
  item: NavItem;
  pathname: string | null;
  onNavigate: () => void;
  className?: string;
}) {
  const Icon = ICON_MAP[item.icon];
  const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? "bg-brand-blue/10 text-brand-blue" : "text-ink-700 hover:bg-ink-900/5 hover:text-ink-900"
      } ${className}`}
    >
      {Icon && <Icon className="h-[18px] w-[18px]" />}
      <span className="flex-1">{item.label}</span>
      {active && <ChevronRight className="h-4 w-4" />}
    </Link>
  );
}
