import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { getSiteSettings } from "@/lib/cms/public-site-settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { branding } = await getSiteSettings();
  const mobileIcon = branding.mobileIconUrl || "/images/icon-192.png";
  const mobileIconLarge = branding.mobileIconUrl || "/images/icon-512.png";
  const maskableIcon = branding.mobileIconUrl || "/images/icon-maskable-512.png";

  return {
    name: siteConfig.name,
    short_name: "Eleven Digital",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
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
  };
}
