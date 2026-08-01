"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import ScrollToTop from "@/components/ui/ScrollToTop";
import PageviewTracker from "@/components/analytics/PageviewTracker";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin || !("serviceWorker" in navigator)) return;
    // PWA is admin-only — drop any worker a portal visitor picked up before
    // the service worker scope was narrowed to /admin/.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        if (registration.scope === `${window.location.origin}/`) {
          registration.unregister();
        }
      }
    });
  }, [isAdmin]);

  // The admin dashboard is data-dense and role-gated — the marketing site's
  // custom cursor and inertial (Lenis) scroll hurt usability there, so skip both.
  // Portal analytics also only tracks this branch, so admin traffic is excluded.
  if (isAdmin) {
    return (
      <>
        <ServiceWorkerRegistration />
        {children}
      </>
    );
  }

  return (
    <SmoothScroll>
      <PageviewTracker />
      <Cursor />
      {children}
      <ScrollToTop />
    </SmoothScroll>
  );
}
