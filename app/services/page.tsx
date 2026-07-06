import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionTitle from "@/components/ui/SectionTitle";
import TiltCard from "@/components/ui/TiltCard";
import { FadeInGroup, FadeInItem } from "@/components/ui/FadeIn";
import { services } from "@/data/services";

const title = "Layanan";
const fullTitle = "Layanan - Eleven Digital Indonesia";
const description =
  "Berbagai layanan digital yang kami sediakan, mulai dari web development, UI/UX design, mobile apps, hingga digital marketing.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/services" },
  openGraph: { title: fullTitle, description, url: "/services", type: "website" },
  twitter: { title: fullTitle, description },
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative bg-white pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="Service"
              title="Semua Layanan Kami"
              description="Jelajahi seluruh layanan yang kami sediakan untuk membantu kebutuhan digital bisnis kamu."
            />

            <FadeInGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <FadeInItem key={service.slug}>
                  <Link href={`/services/${service.slug}`} data-cursor-hover>
                    <TiltCard className="group h-full rounded-2xl border border-black/5 bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.05)] transition-colors duration-300 hover:border-brand-blue/30 hover:shadow-[0_12px_32px_rgba(0,83,255,0.12)]">
                      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-brand-blue/10">
                        <Image src={service.icon} alt="" width={36} height={36} />
                      </div>
                      <h3 className="mb-2 font-heading text-xl font-semibold text-ink-900">
                        {service.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-brand-ink/60">
                        {service.description}
                      </p>
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
