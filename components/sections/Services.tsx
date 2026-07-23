"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import TiltCard from "@/components/ui/TiltCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { PublicService } from "@/lib/cms/public-services";

export default function Services({ services }: { services: PublicService[] }) {
  const featured = services.slice(0, 6);

  return (
    <section id="services" className="relative bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          eyebrow="Service"
          title="Layanan Digital yang Kami Sediakan"
          description="Dari web development, UI/UX design, hingga digital marketing, kami membantu setiap tahap transformasi digital bisnis Anda."
        />

        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((service) => (
            <RevealItem key={service.slug}>
              <Link href={`/services/${service.slug}`} data-cursor-hover>
                <TiltCard className="group h-full rounded-2xl border border-black/5 bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.05)] transition-colors duration-300 hover:border-brand-blue/30 hover:shadow-[0_12px_32px_rgba(0,83,255,0.12)]">
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-brand-blue/10">
                    <Image src={service.icon} alt="" width={36} height={36} />
                  </div>
                  <h3 className="mb-2 font-heading text-xl font-semibold text-ink-900">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-ink/60">{service.description}</p>
                </TiltCard>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-14 flex justify-center">
          <Link
            href="/services"
            data-cursor-hover
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
          >
            Lihat Semua Layanan
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
