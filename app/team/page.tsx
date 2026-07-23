import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionTitle from "@/components/ui/SectionTitle";
import TiltCard from "@/components/ui/TiltCard";
import TeamAvatar from "@/components/ui/TeamAvatar";
import { FadeInGroup, FadeInItem } from "@/components/ui/FadeIn";
import { getPublishedTeamMembers } from "@/lib/cms/public-team";

const title = "Tim Kami";
const fullTitle = "Tim Kami - Eleven Digital Indonesia";
const description = "Kenali Board of Directors di balik setiap proyek Eleven Digital Indonesia.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/team" },
  openGraph: { title: fullTitle, description, url: "/team", type: "website" },
  twitter: { title: fullTitle, description },
};

export default async function TeamPage() {
  const team = await getPublishedTeamMembers();

  return (
    <>
      <Navbar />
      <main>
        <section className="relative bg-brand-paper pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <SectionTitle
              eyebrow="Team"
              title="Board of Directors Kami"
              description="Kenali tim inti yang mengarahkan visi dan kualitas kerja di balik setiap proyek Eleven Digital Indonesia."
            />

            <FadeInGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <FadeInItem key={member.slug}>
                  <Link href={`/team/${member.slug}`} data-cursor-hover>
                    <TiltCard
                      strength={8}
                      className="group h-full overflow-hidden border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                    >
                      <TeamAvatar
                        name={member.name}
                        className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="p-5">
                        <h3 className="font-heading text-base font-semibold leading-snug text-ink-900">
                          {member.name}
                        </h3>
                        <p className="mt-1 text-sm text-brand-blue">{member.position}</p>
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
