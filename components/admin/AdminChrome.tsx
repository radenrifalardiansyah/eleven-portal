"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, LogOut, ChevronDown, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "./ConfirmDialog";
import { ICON_MAP } from "./icon-map";
import type { NavGroup } from "@/lib/auth/nav";
import type { CurrentProfile } from "@/lib/auth/session";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import type { NavItem } from "@/lib/auth/nav";
import type { SiteBranding, SiteCompany } from "@/lib/cms/public-site-settings";

export default function AdminChrome({
  profile,
  navGroups,
  branding,
  company,
  children,
}: {
  profile: CurrentProfile;
  navGroups: NavGroup[];
  branding: SiteBranding;
  company: SiteCompany;
  children: React.ReactNode;
}) {
  const adminLogoUrl = branding.adminLogoUrl || branding.logoUrl;
  const brandName = company.brandName || "Eleven Digital";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem("admin-sidebar-collapsed") === "1");
  }, []);

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  }

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.parentId && item.href && (pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href)))) {
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
  const bottomNavItems = flatItems
    .filter((item): item is NavItem & { href: string } => item.showBottomNav && Boolean(item.href))
    .slice(0, 4);

  function renderSidebar(isCollapsed: boolean) {
    return (
      <div className="flex h-full flex-col">
        <div className={`flex items-center gap-2 py-6 ${isCollapsed ? "justify-center px-3" : "px-6"}`}>
          {adminLogoUrl ? (
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl">
              <Image src={adminLogoUrl} alt={brandName} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow-lg shadow-brand-blue/30">
              11
            </div>
          )}
          {!isCollapsed && (
            <div>
              <p className="font-heading text-sm font-semibold text-ink-900">{brandName}</p>
              <p className="text-xs text-ink-500">Content Studio</p>
            </div>
          )}
        </div>

        <nav
          className={`flex-1 space-y-2 overflow-y-auto pb-4 ${
            isCollapsed ? "scrollbar-none px-2" : "px-3"
          }`}
        >
          {navGroups.map((group) => {
            const collapsed = !isCollapsed && collapsedGroups.has(group.label);
            return (
              <div key={group.label}>
                {isCollapsed ? (
                  <div className="mx-2 my-2 border-t border-ink-900/5" />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="flex w-full items-center justify-between px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500/70 hover:text-ink-700"
                  >
                    {group.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
                  </button>
                )}
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className={isCollapsed ? "overflow-visible" : "overflow-hidden"}
                    >
                      <div className="space-y-1 pb-1">
                        {group.items
                          .filter((item) => !item.parentId)
                          .map((item) => {
                            const children = group.items.filter((child) => child.parentId === item.id);
                            const hasChildren = children.length > 0;
                            const submenuOpen = openSubmenus.has(item.id);
                            const active = Boolean(
                              item.href &&
                                (pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href)))
                            );

                            if (isCollapsed) {
                              const Icon = ICON_MAP[item.icon];
                              const iconEl = item.href ? (
                                <Link
                                  href={item.href}
                                  className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                                    active
                                      ? "bg-brand-blue/10 text-brand-blue"
                                      : "text-ink-700 hover:scale-105 hover:bg-ink-900/5 hover:text-ink-900"
                                  }`}
                                >
                                  {Icon && <Icon className="h-[18px] w-[18px]" />}
                                </Link>
                              ) : (
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-ink-400">
                                  {Icon && <Icon className="h-[18px] w-[18px]" />}
                                </div>
                              );

                              if (hasChildren) {
                                return (
                                  <RailFlyout key={item.id} label={item.label} trigger={iconEl}>
                                    {children.map((child) => (
                                      <NavLink
                                        key={child.id}
                                        item={child}
                                        pathname={pathname}
                                        onNavigate={() => setMobileOpen(false)}
                                      />
                                    ))}
                                  </RailFlyout>
                                );
                              }

                              return (
                                <RailTooltip key={item.id} label={item.label}>
                                  {iconEl}
                                </RailTooltip>
                              );
                            }

                            return (
                              <div key={item.id}>
                                <div
                                  className={`flex items-center gap-1 rounded-xl ${active ? "bg-brand-blue/10 text-brand-blue" : ""}`}
                                >
                                  <NavLink
                                    item={item}
                                    pathname={pathname}
                                    onNavigate={() => setMobileOpen(false)}
                                    className="flex-1"
                                    plain={hasChildren}
                                    onToggle={hasChildren ? () => toggleSubmenu(item.id) : undefined}
                                  />
                                  {hasChildren && (
                                    <button
                                      type="button"
                                      onClick={() => toggleSubmenu(item.id)}
                                      aria-label={submenuOpen ? "Tutup submenu" : "Buka submenu"}
                                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                                        active ? "text-brand-blue" : "text-ink-400 hover:bg-ink-900/5 hover:text-ink-700"
                                      }`}
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
          <div
            className={`flex items-center gap-3 rounded-xl bg-ink-900/[0.03] p-3 ${
              isCollapsed ? "flex-col" : ""
            }`}
          >
            <div className="relative h-9 w-9 shrink-0">
              <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-brand-blue-light text-sm font-semibold text-white">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt="" width={36} height={36} className="h-full w-full object-cover" unoptimized />
                ) : (
                  initial
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">
                  {profile.fullName ?? profile.email}
                </p>
                <p className="text-xs text-ink-500">{profile.roleLabel}</p>
              </div>
            )}
            <button
              onClick={() => setLogoutConfirmOpen(true)}
              aria-label="Logout"
              title="Logout"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <Toaster richColors position="top-right" />
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Logout dari akun?"
        description="Kamu perlu login kembali untuk mengakses Content Studio."
        confirmLabel="Logout"
        loadingLabel="Logout..."
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-ink-900/5 bg-white transition-all duration-200 lg:block ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {renderSidebar(sidebarCollapsed)}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          aria-label={sidebarCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-ink-900/10 bg-white text-ink-500 shadow-md transition-all duration-200 hover:scale-110 hover:border-brand-blue/30 hover:bg-brand-blue/10 hover:text-brand-blue hover:shadow-lg active:scale-95 lg:flex"
        >
          <motion.span
            key={sidebarCollapsed ? "right" : "left"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex"
          >
            {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </motion.span>
        </button>
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
              {renderSidebar(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={`transition-all duration-200 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
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

            <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-blue-light text-xs font-semibold text-white">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="" width={32} height={32} className="h-full w-full object-cover" unoptimized />
              ) : (
                initial
              )}
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
  plain = false,
  onToggle,
}: {
  item: NavItem;
  pathname: string | null;
  onNavigate: () => void;
  className?: string;
  /** Skip this link's own active background/text color — used when a sibling
   *  submenu toggle button shares one pill background supplied by the parent. */
  plain?: boolean;
  /** Item has no href (pure category, e.g. no own page — like the account
   *  dropdown in the navbar) — clicking the label toggles its submenu
   *  instead of navigating. */
  onToggle?: () => void;
}) {
  const Icon = ICON_MAP[item.icon];
  const active = Boolean(
    item.href && (pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href)))
  );
  const classes = `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    plain
      ? active
        ? "text-brand-blue"
        : "text-ink-700 hover:bg-ink-900/5 hover:text-ink-900"
      : active
        ? "bg-brand-blue/10 text-brand-blue"
        : "text-ink-700 hover:bg-ink-900/5 hover:text-ink-900"
  } ${className}`;

  if (!item.href) {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={!onToggle}
        className={`${classes} ${onToggle ? "" : "cursor-default opacity-60"}`}
      >
        {Icon && <Icon className="h-[18px] w-[18px]" />}
        <span className="flex-1 text-left">{item.label}</span>
      </button>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={classes}>
      {Icon && <Icon className="h-[18px] w-[18px]" />}
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}

/** Hover tooltip anchored to its trigger via viewport coordinates and
 *  rendered through a portal — avoids being clipped by scrollable/animated
 *  ancestors (e.g. the sidebar rail's `overflow-y-auto` nav). */
function RailTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  function show() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.top + rect.height / 2, left: rect.right });
  }

  return (
    <div ref={triggerRef} onMouseEnter={show} onMouseLeave={() => setCoords(null)} className="relative">
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {coords && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 4, y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: 12, y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: 4, y: "-50%" }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: "fixed", top: coords.top, left: coords.left }}
                className="pointer-events-none z-[100] whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg shadow-ink-900/25"
              >
                {label}
                <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink-900" />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

/** Same portal-anchored positioning as {@link RailTooltip}, for the
 *  collapsed rail's submenu flyout (keeps rendering while the pointer is
 *  over either the trigger icon or the flyout panel itself). */
function RailFlyout({
  label,
  trigger,
  children,
}: {
  label: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  function show() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.top, left: rect.right });
  }

  function scheduleHide() {
    closeTimer.current = setTimeout(() => setCoords(null), 120);
  }

  return (
    <div ref={triggerRef} onMouseEnter={show} onMouseLeave={scheduleHide} className="relative">
      {trigger}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {coords && (
              <motion.div
                onMouseEnter={show}
                onMouseLeave={scheduleHide}
                initial={{ opacity: 0, scale: 0.95, x: 4, y: 0 }}
                animate={{ opacity: 1, scale: 1, x: 12, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 4, y: 0 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: "fixed", top: coords.top, left: coords.left }}
                className="z-[100] w-48 origin-left rounded-xl border border-ink-900/5 bg-white p-2 shadow-lg shadow-ink-900/10"
              >
                <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500/70">
                  {label}
                </p>
                <div className="space-y-1">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
