import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Sans } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/layout/AppChrome";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig, absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/cms/public-site-settings";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0053ff",
};

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getSiteSettings();
  const faviconUrl = branding.faviconUrl || "/images/favicon.png";

  return {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Eleven Digital Indonesia - Jasa Website & Digital Agency Jakarta",
    template: "%s | Eleven Digital Indonesia",
  },
  description: siteConfig.description,
  keywords: [
    "digital agency indonesia",
    "jasa pembuatan website",
    "web development jakarta",
    "ui ux design",
    "jasa branding logo",
    "digital marketing",
    "aplikasi mobile",
    "eleven digital indonesia",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: faviconUrl,
    apple: faviconUrl,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Eleven Digital Indonesia - Jasa Website & Digital Agency Jakarta",
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 820,
        height: 603,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eleven Digital Indonesia - Jasa Website & Digital Agency Jakarta",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { contact, branding, company } = await getSiteSettings();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: company.brandName || siteConfig.name,
    legalName: company.legalName || undefined,
    url: siteConfig.url,
    logo: branding.logoUrl || absoluteUrl("/images/logo-eleven.png"),
    image: absoluteUrl(siteConfig.ogImage),
    description: siteConfig.description,
    priceRange: "Rp 500.000 - Rp 9.000.000",
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.streetAddress,
      addressLocality: contact.address.addressLocality,
      addressRegion: contact.address.addressRegion,
      addressCountry: contact.address.addressCountry,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contact.phone,
      email: contact.email || undefined,
      contactType: "customer service",
      areaServed: "ID",
      availableLanguage: ["Indonesian", "English"],
    },
  };

  return (
    <html lang="id" className={`${poppins.variable} ${notoSans.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd} />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
