"use client";

import Image from "next/image";
import { Quote, Star } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { PublicTestimonial } from "@/lib/cms/public-testimonials";

export default function Testimonials({
  testimonials,
  eyebrow = "Testimoni",
  title = "Apa Kata Klien Kami",
  description = "Pengalaman nyata klien yang telah bekerja sama dengan kami.",
}: {
  testimonials: PublicTestimonial[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  if (testimonials.length === 0) return null;

  return (
    <section className="relative bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle eyebrow={eyebrow} title={title} description={description} />

        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <RevealItem key={`${testimonial.name}-${i}`}>
              <div className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                <Quote className="h-6 w-6 text-brand-blue/40" />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink/70">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                {typeof testimonial.rating === "number" && (
                  <div className="mt-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star < testimonial.rating!
                            ? "fill-brand-yellow text-brand-yellow"
                            : "text-black/10"
                        }
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-3 border-t border-black/5 pt-4">
                  <div className="relative h-8 w-16 shrink-0">
                    <Image src={testimonial.logo} alt={testimonial.name} fill className="object-contain object-left" />
                  </div>
                  <div>
                    {testimonial.author && (
                      <p className="text-sm font-medium text-ink-900">{testimonial.author}</p>
                    )}
                    <p className="text-xs text-brand-ink/50">{testimonial.name}</p>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
