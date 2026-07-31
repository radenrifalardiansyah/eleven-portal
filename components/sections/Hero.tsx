"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import { isVideoUrl } from "@/lib/media";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Hero({
  eyebrow = "Digital Creative Agency",
  titlePrefix = "Wujudkan ",
  titleHighlight = "transformasi digital",
  titleSuffix = " bisnis Anda.",
  ctaLabel = "Mulai Sekarang",
  ctaHref = "#contact",
  secondaryLabel = "Lihat portofolio kami",
  secondaryHref = "#case-study",
  image = "/images/cover-illustration.png",
}: {
  eyebrow?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image?: string;
}) {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-start overflow-hidden bg-white lg:items-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-glow"
      />
      <div
        aria-hidden
        className="absolute -left-32 top-20 h-72 w-72 animate-blob rounded-full bg-brand-blue/10 blur-[100px]"
      />
      <div
        aria-hidden
        className="absolute -right-24 bottom-10 h-80 w-80 animate-blob rounded-full bg-brand-yellow/20 blur-[110px]"
        style={{ animationDelay: "4s" }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-24 lg:grid-cols-2 lg:pt-24">
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.span
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-brand-blue/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-brand-ink/70 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
            {eyebrow}
          </motion.span>

          <motion.h1
            variants={item}
            className="font-heading text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-5xl lg:text-6xl"
          >
            {titlePrefix}
            <span className="bg-brand-gradient bg-clip-text text-transparent text-glow">
              {titleHighlight}
            </span>
            {titleSuffix}
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-md text-lg text-brand-ink/70">
            Partner digital agency untuk pembuatan website, aplikasi, UI/UX design, dan branding
            yang membawa bisnis Anda tampil lebih profesional.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex items-center gap-4">
            <MagneticButton href={ctaHref}>{ctaLabel}</MagneticButton>
            <a
              href={secondaryHref}
              className="text-sm font-semibold text-brand-ink/70 underline-offset-4 transition-colors hover:text-brand-blue hover:underline"
            >
              {secondaryLabel}
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative hidden aspect-square lg:block"
        >
          {isVideoUrl(image) ? (
            <video
              src={image}
              autoPlay
              muted
              loop
              playsInline
              className="relative h-full w-full object-contain"
            />
          ) : (
            <Image
              src={image}
              alt="Illustration of a team building a digital product"
              fill
              className="relative object-contain"
              priority
            />
          )}
        </motion.div>
      </div>

      <motion.a
        href="#services"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-brand-ink/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em]">Scroll</span>
        <span className="relative h-9 w-6 rounded-full border border-brand-ink/20">
          <span className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-blue animate-scroll-wheel" />
        </span>
      </motion.a>
    </section>
  );
}
