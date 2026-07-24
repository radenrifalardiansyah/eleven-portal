import { getSiteSettings } from "@/lib/cms/public-site-settings";
import { getPortalNavLinks } from "@/lib/cms/public-menu";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const [navLinks, { branding, company }] = await Promise.all([getPortalNavLinks(), getSiteSettings()]);
  return (
    <NavbarClient
      navLinks={navLinks}
      logoUrl={branding.logoUrl}
      brandName={company.brandName || "Eleven Digital Indonesia"}
    />
  );
}
