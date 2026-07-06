import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import ScrollToTop from "@/components/ui/ScrollToTop";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig, absoluteUrl } from "@/lib/seo";

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

export const metadata: Metadata = {
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
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: absoluteUrl("/images/logo-eleven.png"),
  image: absoluteUrl(siteConfig.ogImage),
  description: siteConfig.description,
  priceRange: "Rp 500.000 - Rp 9.000.000",
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.addressLocality,
    addressRegion: siteConfig.address.addressRegion,
    addressCountry: siteConfig.address.addressCountry,
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: siteConfig.phone,
    contactType: "customer service",
    areaServed: "ID",
    availableLanguage: ["Indonesian", "English"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable} ${notoSans.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd} />
        <SmoothScroll>
          <Cursor />
          {children}
          <ScrollToTop />
        </SmoothScroll>
      </body>
    </html>
  );
}
