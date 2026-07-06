"use client";

import { useCallback, useEffect, useState, CSSProperties } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import TiltCard from "@/components/ui/TiltCard";
import { projects } from "@/data/projects";

export default function CaseStudy() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", containScroll: false },
    [AutoScroll({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section id="case-study" className="relative overflow-hidden bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          eyebrow="Case Study"
          title="Karya Terbaru Kami"
          description="Sebagian proyek yang telah kami kerjakan bersama berbagai klien, mulai dari korporasi, kementerian, hingga brand nasional."
        />
      </div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className="min-w-0 shrink-0 grow-0 basis-[85%] px-3 sm:basis-[55%] lg:basis-[32%]"
              >
                <Link href={`/case-study/${project.slug}`} data-cursor-hover>
                  <TiltCard
                    strength={8}
                    className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-transform duration-500"
                    style={{
                      transform: index === selected ? "scale(1)" : "scale(0.94)",
                      opacity: index === selected ? 1 : 0.55,
                    } as CSSProperties}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 85vw, 32vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-lg font-semibold text-ink-900">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-sm text-brand-ink/50">
                        {project.category} &middot; {project.year}
                      </p>
                    </div>
                  </TiltCard>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            aria-label="Previous project"
            onClick={() => emblaApi?.scrollPrev()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-brand-ink transition-colors hover:border-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            aria-label="Next project"
            onClick={() => emblaApi?.scrollNext()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-brand-ink transition-colors hover:border-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/case-study"
            data-cursor-hover
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
          >
            Lihat Semua Case Study
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
