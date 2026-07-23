import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/ui/FadeIn";
import TiltCard from "@/components/ui/TiltCard";
import TeamAvatar from "@/components/ui/TeamAvatar";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, siteConfig } from "@/lib/seo";
import { getPublishedTeamMembers, getTeamMemberBySlug } from "@/lib/cms/public-team";

const SOCIAL_ICONS = {
  instagram: "/images/icon/instagram.svg",
  facebook: "/images/icon/facebook.svg",
  twitter: "/images/icon/twitter.svg",
} as const;

export async function generateStaticParams() {
  const team = await getPublishedTeamMembers();
  return team.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) return {};
  const fullTitle = `${member.name} - Eleven Digital Indonesia`;
  return {
    title: member.name,
    description: member.bio,
    alternates: { canonical: `/team/${member.slug}` },
    openGraph: {
      title: fullTitle,
      description: member.bio,
      url: `/team/${member.slug}`,
      type: "profile",
    },
    twitter: { title: fullTitle, description: member.bio },
  };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) notFound();

  const allTeam = await getPublishedTeamMembers();
  const related = allTeam.filter((item) => item.slug !== member.slug).slice(0, 4);
  const socialEntries = Object.entries(member.socials) as [keyof typeof SOCIAL_ICONS, string][];
  const sameAs = socialEntries.map(([, href]) => href).filter((href) => href !== "#");

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.position,
    description: member.bio,
    email: member.email,
    url: absoluteUrl(`/team/${member.slug}`),
    worksFor: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tim Kami", path: "/team" },
    { name: member.name, path: `/team/${member.slug}` },
  ]);

  return (
    <>
      <JsonLd data={personJsonLd} />
      <JsonLd data={breadcrumb} />
      <Navbar />
      <main>
        <section className="relative bg-brand-paper pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <Link
              href="/team"
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-ink/60 transition-colors hover:text-brand-blue"
            >
              <ArrowLeft size={16} />
              Back to Team
            </Link>

            <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.3fr]">
              <FadeIn>
                <div className="mx-auto w-full max-w-sm overflow-hidden border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                  <TeamAvatar name={member.name} className="aspect-[4/5] w-full" />
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <span className="mb-4 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  Board of Directors
                </span>
                <h1 className="font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                  {member.name}
                </h1>
                <p className="mt-2 text-base font-semibold text-brand-blue">{member.position}</p>
                <p className="mt-6 text-base leading-relaxed text-brand-ink/70">
                  {member.longBio}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href={`mailto:${member.email}`}
                    data-cursor-hover
                    className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
                  >
                    <Mail size={16} />
                    {member.email}
                  </a>

                  {socialEntries.map(([platform, href]) => (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={platform}
                      data-cursor-hover
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-brand-blue hover:bg-brand-blue/10"
                    >
                      <Image src={SOCIAL_ICONS[platform]} alt="" width={20} height={20} />
                    </a>
                  ))}
                </div>
              </FadeIn>
            </div>

            {related.length > 0 && (
              <div className="mt-24">
                <h2 className="mb-8 font-heading text-xl font-semibold text-ink-900">
                  Anggota Tim Lainnya
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((item) => (
                    <Link key={item.slug} href={`/team/${item.slug}`} data-cursor-hover>
                      <TiltCard
                        strength={8}
                        className="group h-full overflow-hidden border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                      >
                        <TeamAvatar
                          name={item.name}
                          className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="p-5">
                          <h3 className="font-heading text-base font-semibold leading-snug text-ink-900">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-brand-blue">{item.position}</p>
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
