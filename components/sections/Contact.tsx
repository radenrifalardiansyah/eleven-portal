"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
];

export default function Contact() {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <section id="contact" className="relative overflow-hidden bg-brand-paper py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[120px]"
      />
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          eyebrow="Contact"
          title="Punya Proyek Digital?"
          description="Ceritakan kebutuhan bisnis Anda dan tim kami akan membantu menemukan solusi digital yang tepat."
        />

        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <form action="" className="space-y-5">
              {fields.map((field) => (
                <div key={field.name} className="relative">
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.label}
                    onFocus={() => setFocused(field.name)}
                    onBlur={() => setFocused(null)}
                    className="w-full rounded-xl border border-black/10 bg-white px-5 py-4 text-brand-ink placeholder-brand-ink/35 outline-none transition-colors duration-300 focus:border-brand-blue"
                  />
                  <motion.span
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-blue"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: focused === field.name ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                  />
                </div>
              ))}
              <div className="relative">
                <textarea
                  name="message"
                  rows={6}
                  placeholder="Your Message"
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  className="w-full resize-none rounded-xl border border-black/10 bg-white px-5 py-4 text-brand-ink placeholder-brand-ink/35 outline-none transition-colors duration-300 focus:border-brand-blue"
                />
                <motion.span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-blue"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: focused === "message" ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                />
              </div>
              <MagneticButton as="button" type="button" className="mt-2 cursor-pointer">
                Send Message
              </MagneticButton>
            </form>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-full w-full"
              >
                <Image
                  src="/images/svg/contact-us.svg"
                  alt="Contact us"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
