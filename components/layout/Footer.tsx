import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { getSiteSettings } from "@/lib/cms/public-site-settings";
import { getPublishedServices } from "@/lib/cms/public-services";
import Reveal from "@/components/ui/Reveal";
import TiktokIcon from "@/components/ui/TiktokIcon";

const DEFAULT_TAGLINE =
  "Partner your digital experience product and best solutions for better transformation platform.";

export default async function Footer() {
  const [{ contact, branding, company, socialLinks, copyright }, services] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
  ]);
  const brandName = company.brandName || "Eleven Digital Indonesia";
  const socials = [
    { key: "instagram", href: socialLinks.instagram, label: "Instagram", Icon: Instagram },
    { key: "linkedin", href: socialLinks.linkedin, label: "LinkedIn", Icon: Linkedin },
    { key: "tiktok", href: socialLinks.tiktok, label: "TikTok", Icon: TiktokIcon },
    { key: "youtube", href: socialLinks.youtube, label: "YouTube", Icon: Youtube },
  ].filter((social) => social.href);

  return (
    <footer className="relative overflow-hidden border-t border-black/5 bg-white pb-10 pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-[120px]"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <Reveal>
            <div className="relative h-9 w-36">
              <Image
                src={branding.logoUrl || "/images/logo-eleven.png"}
                alt={brandName}
                fill
                className="object-contain object-left"
                unoptimized={Boolean(branding.logoUrl)}
              />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-brand-ink/60">
              {company.tagline || DEFAULT_TAGLINE}
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <Reveal delay={0.05}>
              <div>
                <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-900">
                  Contact Us
                </div>
                <p className="text-sm leading-relaxed text-brand-ink/60">
                  {contact.address.streetAddress}
                  <br />
                  {contact.address.addressLocality}
                  <br />
                  Indonesia
                </p>
                <p className="mt-2 text-sm text-brand-ink/60">{contact.phone}</p>
                {contact.email && <p className="text-sm text-brand-ink/60">{contact.email}</p>}
              </div>
            </Reveal>

            {services.map((service, i) => (
              <Reveal delay={0.1 + i * 0.05} key={service.slug}>
                <div>
                  <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-900">
                    {service.title}
                  </div>
                  <ul className="space-y-2.5">
                    {service.benefits.map((benefit) => (
                      <li key={benefit}>
                        <Link
                          href={`/services/${service.slug}`}
                          className="text-sm text-brand-ink/60 transition-colors hover:text-brand-blue"
                        >
                          {benefit}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 text-xs text-brand-ink/40 sm:flex-row">
          <span>{copyright.text || `© ${new Date().getFullYear()} Eleven Digital Indonesia. All rights reserved.`}</span>
          {socials.length > 0 && (
            <div className="flex items-center gap-5">
              {socials.map(({ key, href, label, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="opacity-60 transition-opacity hover:opacity-100"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
