import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionTitle from "@/components/ui/SectionTitle";
import TiltCard from "@/components/ui/TiltCard";
import { FadeInGroup, FadeInItem } from "@/components/ui/FadeIn";
import { projects } from "@/data/projects";

const title = "Case Study";
const fullTitle = "Case Study - Eleven Digital Indonesia";
const description =
  "Kumpulan studi kasus dan proyek yang telah kami kerjakan untuk berbagai klien, mulai dari korporasi, kementerian, hingga brand nasional.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/case-study" },
  openGraph: { title: fullTitle, description, url: "/case-study", type: "website" },
  twitter: { title: fullTitle, description },
};

export default function CaseStudyPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative bg-white pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="Case Study"
              title="Semua Case Study Kami"
              description="Kumpulan studi kasus dan proyek yang telah kami kerjakan untuk berbagai klien."
            />

            <FadeInGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <FadeInItem key={project.slug}>
                  <Link href={`/case-study/${project.slug}`} data-cursor-hover>
                    <TiltCard
                      strength={8}
                      className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 90vw, 32vw"
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
                </FadeInItem>
              ))}
            </FadeInGroup>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
