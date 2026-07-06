import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Eleven Digital",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0053ff",
    icons: [
      {
        src: "/images/favicon.png",
        sizes: "128x128",
        type: "image/png",
      },
    ],
  };
}
