"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import TiltCard from "@/components/ui/TiltCard";
import TeamAvatar from "@/components/ui/TeamAvatar";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { team } from "@/data/team";

export default function Team() {
  const featured = team.slice(0, 4);

  return (
    <section id="team" className="relative bg-brand-paper py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          eyebrow="Team"
          title="Kenali Board of Directors Kami"
          description="Tim inti yang mengarahkan visi dan kualitas kerja di balik setiap proyek Eleven Digital Indonesia."
        />

        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((member) => (
            <RevealItem key={member.slug}>
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
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-14 flex justify-center">
          <Link
            href="/team"
            data-cursor-hover
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
          >
            Lihat Semua Tim
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
