import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionTitle from "@/components/ui/SectionTitle";
import TiltCard from "@/components/ui/TiltCard";
import { FadeInGroup, FadeInItem } from "@/components/ui/FadeIn";
import { getPublishedStories } from "@/lib/cms/public-stories";

const title = "Stories";
const fullTitle = "Stories - Eleven Digital Indonesia";
const description = "Kumpulan artikel dan wawasan seputar desain, teknologi, dan kreativitas.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/stories" },
  openGraph: { title: fullTitle, description, url: "/stories", type: "website" },
  twitter: { title: fullTitle, description },
};

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <>
      <Navbar />
      <main>
        <section className="relative bg-white pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="Stories"
              title="Semua Stories Kami"
              description="Kumpulan artikel dan cerita seputar desain, teknologi, dan kreativitas."
            />

            <FadeInGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <FadeInItem key={story.slug}>
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
                          sizes="(max-width: 768px) 90vw, 32vw"
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
