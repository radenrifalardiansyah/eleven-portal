import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/seo";
import { getSiteSettings } from "@/lib/cms/public-site-settings";

export async function GET() {
  const { branding } = await getSiteSettings();
  const mobileIcon = branding.mobileIconUrl || "/images/icon-192.png";
  const mobileIconLarge = branding.mobileIconUrl || "/images/icon-512.png";
  const maskableIcon = branding.mobileIconUrl || "/images/icon-maskable-512.png";

  return NextResponse.json(
    {
      name: siteConfig.name,
      short_name: "Eleven Digital",
      description: siteConfig.description,
      start_url: "/admin",
      scope: "/admin/",
      display: "standalone",
      orientation: "any",
      background_color: "#ffffff",
      theme_color: "#0053ff",
      icons: [
        {
          src: branding.faviconUrl || "/images/favicon.png",
          sizes: "128x128",
          type: "image/png",
          purpose: "any",
        },
        {
          src: mobileIcon,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: mobileIconLarge,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: maskableIcon,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
