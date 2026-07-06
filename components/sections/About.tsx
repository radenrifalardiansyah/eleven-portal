"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import TiltCard from "@/components/ui/TiltCard";

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-brand-paper py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-yellow/10 blur-[120px]"
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <Reveal>
          <TiltCard
            strength={6}
            className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-3xl border border-black/5 bg-white p-10 shadow-[0_8px_40px_rgba(15,23,42,0.06)]"
          >
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-full w-full"
            >
              <Image
                src="/images/svg/celebration.svg"
                alt="Why we are different"
                fill
                className="object-contain"
              />
            </motion.div>
          </TiltCard>
        </Reveal>

        <div>
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue">
            Creative
          </span>
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
              Kenapa Memilih Eleven Digital Indonesia
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-brand-ink/70 sm:text-lg">
              Kami memadukan strategi, desain, dan teknologi dalam satu tim untuk menghadirkan
              solusi digital yang terukur, mulai dari website, aplikasi, hingga branding bisnis
              Anda.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8">
              <MagneticButton href="#services">Pelajari Lebih Lanjut</MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
