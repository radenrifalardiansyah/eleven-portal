import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/ui/FadeIn";
import TiltCard from "@/components/ui/TiltCard";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, siteConfig } from "@/lib/seo";
import { stories } from "@/data/stories";

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = stories.find((item) => item.slug === slug);
  if (!story) return {};
  const fullTitle = `${story.title} - Eleven Digital Indonesia`;
  return {
    title: story.title,
    description: story.description,
    alternates: { canonical: `/stories/${story.slug}` },
    openGraph: {
      title: fullTitle,
      description: story.description,
      url: `/stories/${story.slug}`,
      type: "article",
      publishedTime: story.date,
      images: [{ url: story.image }],
    },
    twitter: {
      title: fullTitle,
      description: story.description,
      images: [story.image],
    },
  };
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = stories.find((item) => item.slug === slug);
  if (!story) notFound();

  const related = stories.filter((item) => item.slug !== story.slug).slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: story.title,
    description: story.description,
    image: absoluteUrl(story.image),
    datePublished: story.date,
    dateModified: story.date,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo-eleven.png") },
    },
    mainEntityOfPage: absoluteUrl(`/stories/${story.slug}`),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Stories", path: "/stories" },
    { name: story.title, path: `/stories/${story.slug}` },
  ]);

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumb} />
      <Navbar />
      <main>
        <section className="relative bg-white pb-28 pt-40">
          <div className="mx-auto max-w-3xl px-6">
            <Link
              href="/stories"
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-ink/60 transition-colors hover:text-brand-blue"
            >
              <ArrowLeft size={16} />
              Back to Stories
            </Link>

            <FadeIn>
              <span
                className={clsx(
                  "mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold",
                  story.labelColor === "yellow"
                    ? "bg-brand-yellow/15 text-[#8a6d00]"
                    : "bg-brand-blue/10 text-brand-blue"
                )}
              >
                {story.label}
              </span>
              <h1 className="font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                {story.title}
              </h1>
              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full">
                  <Image src={story.authorImage} alt="" fill className="object-cover" />
                </div>
                <span className="text-sm text-brand-ink/70">{story.author}</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-black/5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 768px"
                  priority
                />
              </div>
            </FadeIn>

            <FadeIn>
              <div className="mt-10 space-y-5">
                {story.content.map((paragraph, index) => (
                  <p key={index} className="text-base leading-relaxed text-brand-ink/70">
                    {paragraph}
                  </p>
                ))}
              </div>
            </FadeIn>
          </div>

          {related.length > 0 && (
            <div className="mx-auto mt-24 max-w-6xl px-6">
              <h2 className="mb-8 font-heading text-xl font-semibold text-ink-900">
                Stories Lainnya
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.slug} href={`/stories/${item.slug}`} data-cursor-hover>
                    <TiltCard
                      strength={6}
                      className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 90vw, 32vw"
                        />
                      </div>
                      <div className="p-6">
                        <span
                          className={clsx(
                            "mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold",
                            item.labelColor === "yellow"
                              ? "bg-brand-yellow/15 text-[#8a6d00]"
                              : "bg-brand-blue/10 text-brand-blue"
                          )}
                        >
                          {item.label}
                        </span>
                        <h3 className="font-heading text-lg font-semibold leading-snug text-ink-900">
                          {item.title}
                        </h3>
                      </div>
                    </TiltCard>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
