import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/ui/FadeIn";
import TiltCard from "@/components/ui/TiltCard";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, siteConfig } from "@/lib/seo";
import { getPublishedProjects, getProjectBySlug } from "@/lib/cms/public-projects";

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const fullTitle = `${project.title} - Eleven Digital Indonesia`;
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/case-study/${project.slug}` },
    openGraph: {
      title: fullTitle,
      description: project.description,
      url: `/case-study/${project.slug}`,
      type: "article",
      images: [{ url: project.image }],
    },
    twitter: {
      title: fullTitle,
      description: project.description,
      images: [project.image],
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = await getPublishedProjects();
  const related = allProjects.filter((item) => item.slug !== project.slug).slice(0, 3);

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image: absoluteUrl(project.image),
    url: absoluteUrl(`/case-study/${project.slug}`),
    datePublished: project.year,
    creator: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    keywords: project.services.join(", "),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Case Study", path: "/case-study" },
    { name: project.title, path: `/case-study/${project.slug}` },
  ]);

  return (
    <>
      <JsonLd data={creativeWorkJsonLd} />
      <JsonLd data={breadcrumb} />
      <Navbar />
      <main>
        <section className="relative bg-white pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <Link
              href="/case-study"
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-ink/60 transition-colors hover:text-brand-blue"
            >
              <ArrowLeft size={16} />
              Back to Case Study
            </Link>

            <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
              <FadeIn>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <span className="mb-4 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  {project.category} &middot; {project.year}
                </span>
                <h1 className="font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                  {project.title}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                  {project.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.services.map((service) => (
                    <span
                      key={service}
                      className="inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor-hover
                    className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
                  >
                    Visit Live Site
                    <ArrowUpRight size={16} />
                  </a>
                  <Link
                    href="/#contact"
                    data-cursor-hover
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
                  >
                    Contact Us
                  </Link>
                </div>
              </FadeIn>
            </div>

            <FadeIn>
              <div className="mt-20 max-w-3xl">
                <h2 className="font-heading text-xl font-semibold text-ink-900">
                  Tentang Proyek Ini
                </h2>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                  {project.longDescription}
                </p>
              </div>
            </FadeIn>

            {related.length > 0 && (
              <div className="mt-24">
                <h2 className="mb-8 font-heading text-xl font-semibold text-ink-900">
                  Case Study Lainnya
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <Link key={item.slug} href={`/case-study/${item.slug}`} data-cursor-hover>
                      <TiltCard
                        strength={8}
                        className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 90vw, 32vw"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="font-heading text-lg font-semibold text-ink-900">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-brand-ink/50">
                            {item.category} &middot; {item.year}
                          </p>
                        </div>
                      </TiltCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
