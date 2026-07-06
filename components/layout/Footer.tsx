import Image from "next/image";
import { footerLinks } from "@/data/clients";
import Reveal from "@/components/ui/Reveal";

export default function Footer() {
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
                src="/images/logo-eleven.png"
                alt="Eleven Digital Indonesia"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-brand-ink/60">
              Partner your digital experience product and best solutions for better transformation
              platform.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <Reveal delay={0.05}>
              <div>
                <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-900">
                  Contact Us
                </div>
                <p className="text-sm leading-relaxed text-brand-ink/60">
                  Jl. Kebon Jeruk Indah Utama 4
                  <br />
                  West Jakarta
                  <br />
                  Indonesia
                </p>
                <p className="mt-2 text-sm text-brand-ink/60">+62 877 234 999 550</p>
              </div>
            </Reveal>

            {footerLinks.map((group, i) => (
              <Reveal delay={0.1 + i * 0.05} key={group.title}>
                <div>
                  <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-900">
                    {group.title}
                  </div>
                  <ul className="space-y-2.5">
                    {group.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-sm text-brand-ink/60 transition-colors hover:text-brand-blue"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 text-xs text-brand-ink/40 sm:flex-row">
          <span>© {new Date().getFullYear()} Eleven Digital Indonesia. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Twitter" className="opacity-60 transition-opacity hover:opacity-100">
              <Image src="/images/icon/twitter.svg" alt="" width={16} height={16} />
            </a>
            <a href="#" aria-label="Facebook" className="opacity-60 transition-opacity hover:opacity-100">
              <Image src="/images/icon/facebook.svg" alt="" width={16} height={16} />
            </a>
            <a href="#" aria-label="Instagram" className="opacity-60 transition-opacity hover:opacity-100">
              <Image src="/images/icon/instagram.svg" alt="" width={16} height={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
