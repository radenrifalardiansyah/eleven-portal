export const siteConfig = {
  name: "Eleven Digital Indonesia",
  url: "https://eleven-digital.id",
  description:
    "Eleven Digital Indonesia adalah digital agency di Jakarta yang menyediakan jasa web development, UI/UX design, branding, dan digital marketing untuk membantu bisnis Anda tumbuh secara digital.",
  locale: "id_ID",
  ogImage: "/images/cover-illustration.png",
};

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
