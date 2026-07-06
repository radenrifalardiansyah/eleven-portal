"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { navLinks } from "@/data/clients";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("/#home");

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isHome) {
      const matched = navLinks.find(
        (link) => link.matchPath && pathname.startsWith(link.matchPath)
      );
      setActive(matched?.href ?? "");
      return;
    }

    setActive("/#home");

    const sections = navLinks
      .map((link) => document.querySelector(`#${link.href.split("#")[1]}`))
      .filter(Boolean) as Element[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`/#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome, pathname]);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-3" : "py-6"
      )}
    >
      <div className="mx-auto max-w-6xl px-5">
        <div
          className={clsx(
            "flex items-center justify-between rounded-full border px-6 py-3 transition-all duration-500",
            scrolled
              ? "border-black/5 bg-white/80 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              : "border-transparent bg-transparent shadow-none backdrop-blur-0"
          )}
        >
          <Link href="/#home" className="relative h-8 w-32">
            <Image
              src="/images/logo-eleven.png"
              alt="Eleven Digital Indonesia"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative text-sm font-medium tracking-wide transition-colors",
                  active === link.href ? "text-brand-ink" : "text-brand-ink/50 hover:text-brand-ink"
                )}
              >
                {link.label}
                {active === link.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-1.5 left-0 right-0 h-px bg-brand-blue"
                  />
                )}
              </Link>
            ))}
          </nav>

          <Link
            href="/#contact"
            className="hidden rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105 md:inline-flex"
          >
            Contact Us
          </Link>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="text-brand-ink md:hidden"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
            className="mx-5 mt-3 flex flex-col gap-1 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-brand-ink/80 transition-colors hover:bg-black/5 hover:text-brand-ink"
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
