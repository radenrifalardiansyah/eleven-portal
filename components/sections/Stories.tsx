"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";
import Reveal from "@/components/ui/Reveal";
import { stories } from "@/data/stories";

export default function Stories() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section id="stories" className="relative overflow-hidden bg-white py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-[1fr_2fr]">
        <div>
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue">
            Stories
          </span>
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
              Stories
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-brand-ink/70">
              Wawasan seputar desain, teknologi, dan kreativitas dari tim Eleven Digital Indonesia
              untuk membantu bisnis Anda terus berkembang.
            </p>
          </Reveal>

          <div className="mt-8 hidden items-center gap-3 lg:flex">
            <button
              aria-label="Previous story"
              onClick={() => emblaApi?.scrollPrev()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-brand-ink transition-colors hover:border-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              aria-label="Next story"
              onClick={() => emblaApi?.scrollNext()}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-brand-ink transition-colors hover:border-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="mt-6 hidden lg:block">
            <Link
              href="/stories"
              data-cursor-hover
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
            >
              Lihat Semua Stories
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {stories.map((story) => (
                <div key={story.slug} className="min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-[55%]">
                  <Link href={`/stories/${story.slug}`} data-cursor-hover>
                  <TiltCard
                    strength={6}
                    className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 85vw, 45vw"
                      />
                    </div>
                    <div className="p-6">
                      <span
                        className={clsx(
                          "mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold",
                          story.labelColor === "yellow"
                            ? "bg-brand-yellow/15 text-[#8a6d00]"
                            : "bg-brand-blue/10 text-brand-blue"
                        )}
                      >
                        {story.label}
                      </span>
                      <h3 className="font-heading text-lg font-semibold leading-snug text-ink-900">
                        {story.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-brand-ink/60">
                        {story.description}
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full">
                          <Image src={story.authorImage} alt="" fill className="object-cover" />
                        </div>
                        <span className="text-sm text-brand-ink/70">{story.author}</span>
                      </div>
                    </div>
                  </TiltCard>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to story ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === selected ? "w-6 bg-brand-blue" : "w-1.5 bg-black/10"
                )}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center lg:hidden">
            <Link
              href="/stories"
              data-cursor-hover
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
            >
              Lihat Semua Stories
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
