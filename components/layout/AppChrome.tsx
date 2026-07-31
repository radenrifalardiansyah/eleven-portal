"use client";

import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import ScrollToTop from "@/components/ui/ScrollToTop";
import PageviewTracker from "@/components/analytics/PageviewTracker";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The admin dashboard is data-dense and role-gated — the marketing site's
  // custom cursor and inertial (Lenis) scroll hurt usability there, so skip both.
  // Portal analytics also only tracks this branch, so admin traffic is excluded.
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
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
