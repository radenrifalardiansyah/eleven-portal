import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/ui/FadeIn";
import TiltCard from "@/components/ui/TiltCard";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, siteConfig } from "@/lib/seo";
import { services } from "@/data/services";

const WHATSAPP_NUMBER = "62877234999550";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  const fullTitle = `${service.title} - Eleven Digital Indonesia`;
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: fullTitle,
      description: service.description,
      url: `/services/${service.slug}`,
      type: "website",
    },
    twitter: { title: fullTitle, description: service.description },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  const related = services.filter((item) => item.slug !== service.slug).slice(0, 3);
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Halo, saya tertarik dengan layanan "${service.title}". Bisa minta info lebih lanjut?`
  )}`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.longDescription,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    areaServed: "ID",
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Layanan", path: "/services" },
    { name: service.title, path: `/services/${service.slug}` },
  ]);

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumb} />
      <Navbar />
      <main>
        <section className="relative bg-white pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <Link
              href="/services"
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-ink/60 transition-colors hover:text-brand-blue"
            >
              <ArrowLeft size={16} />
              Back to Services
            </Link>

            <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
              <FadeIn>
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-black/5 bg-brand-blue/5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                  <div className="relative h-32 w-32">
                    <Image src={service.icon} alt={service.title} fill className="object-contain" />
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <span className="mb-4 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  Service
                </span>
                <h1 className="font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                  {service.title}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                  {service.longDescription}
                </p>

                <ul className="mt-8 space-y-3">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm text-brand-ink/70">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-blue" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor-hover
                    className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
                  >
                    <MessageCircle size={16} />
                    Konsultasi via WhatsApp
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

            {related.length > 0 && (
              <div className="mt-24">
                <h2 className="mb-8 font-heading text-xl font-semibold text-ink-900">
                  Layanan Lainnya
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <Link key={item.slug} href={`/services/${item.slug}`} data-cursor-hover>
                      <TiltCard className="group h-full rounded-2xl border border-black/5 bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.05)] transition-colors duration-300 hover:border-brand-blue/30 hover:shadow-[0_12px_32px_rgba(0,83,255,0.12)]">
                        <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-brand-blue/10">
                          <Image src={item.icon} alt="" width={36} height={36} />
                        </div>
                        <h3 className="mb-2 font-heading text-lg font-semibold text-ink-900">
                          {item.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-brand-ink/60">
                          {item.description}
                        </p>
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
