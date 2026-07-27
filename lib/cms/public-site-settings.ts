import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type SiteContact = {
  phone: string;
  whatsapp: string;
  email: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
};

export type SiteBranding = {
  logoUrl: string;
  adminLogoUrl: string;
  faviconUrl: string;
  adminFaviconUrl: string;
  mobileIconUrl: string;
};

export type SiteCompany = { legalName: string; brandName: string; tagline: string };

export type SiteSocialLinks = { instagram: string; linkedin: string; tiktok: string; youtube: string };

export type SiteCopyright = { text: string };

export type SiteSettings = {
  contact: SiteContact;
  branding: SiteBranding;
  company: SiteCompany;
  socialLinks: SiteSocialLinks;
  copyright: SiteCopyright;
};

export const EMPTY_CONTACT: SiteContact = {
  phone: "",
  whatsapp: "",
  email: "",
  address: { streetAddress: "", addressLocality: "", addressRegion: "", addressCountry: "" },
};

export const EMPTY_BRANDING: SiteBranding = {
  logoUrl: "",
  adminLogoUrl: "",
  faviconUrl: "",
  adminFaviconUrl: "",
  mobileIconUrl: "",
};

export const EMPTY_COMPANY: SiteCompany = { legalName: "", brandName: "", tagline: "" };

export const EMPTY_SOCIAL_LINKS: SiteSocialLinks = { instagram: "", linkedin: "", tiktok: "", youtube: "" };

export const EMPTY_COPYRIGHT: SiteCopyright = { text: "" };

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  return {
    contact: (map.get("contact") as SiteContact | undefined) ?? EMPTY_CONTACT,
    branding: (map.get("branding") as SiteBranding | undefined) ?? EMPTY_BRANDING,
    company: (map.get("company") as SiteCompany | undefined) ?? EMPTY_COMPANY,
    socialLinks: (map.get("social_links") as SiteSocialLinks | undefined) ?? EMPTY_SOCIAL_LINKS,
    copyright: (map.get("copyright") as SiteCopyright | undefined) ?? EMPTY_COPYRIGHT,
  };
});
