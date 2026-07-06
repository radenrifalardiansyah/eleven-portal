"use client";

import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";
import Marquee from "@/components/ui/Marquee";
import { clients } from "@/data/clients";

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-brand-paper py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          eyebrow="Testimonials"
          title="Dipercaya Berbagai Klien"
          description="Beragam korporasi, kementerian, dan brand nasional telah mempercayakan proyek digital mereka kepada kami."
        />
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-brand-paper to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-brand-paper to-transparent" />
        <Marquee>
          {clients.map((client, i) => (
            <div
              key={`${client}-${i}`}
              className="relative flex h-16 w-40 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-white opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <Image src={client} alt="" width={100} height={40} className="object-contain" />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
