"use client";

import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The admin dashboard is data-dense and role-gated — the marketing site's
  // custom cursor and inertial (Lenis) scroll hurt usability there, so skip both.
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <SmoothScroll>
      <Cursor />
      {children}
      <ScrollToTop />
    </SmoothScroll>
  );
}
