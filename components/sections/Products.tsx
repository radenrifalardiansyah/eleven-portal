"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import TiltCard from "@/components/ui/TiltCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { PublicProduct } from "@/lib/cms/public-products";

export default function Products({ products }: { products: PublicProduct[] }) {
  const featured = products.slice(0, 3);

  return (
    <section id="products" className="relative bg-brand-paper py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          eyebrow="Product"
          title="Produk yang Kami Jual"
          description="Berbagai paket produk siap pakai untuk membantu bisnis kamu tampil lebih profesional."
        />

        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <RevealItem key={product.slug}>
              <Link href={`/products/${product.slug}`} data-cursor-hover>
                <TiltCard
                  strength={8}
                  className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 90vw, 32vw"
                    />
                    <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="mb-3 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                      {product.category}
                    </span>
                    <h3 className="font-heading text-lg font-semibold leading-snug text-ink-900">
                      {product.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-ink/60">
                      {product.description}
                    </p>
                    <p className="mt-5 font-heading text-base font-semibold text-brand-blue">
                      {product.price}
                    </p>
                  </div>
                </TiltCard>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-14 flex justify-center">
          <Link
            href="/products"
            data-cursor-hover
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(0,83,255,0.3)] transition-transform hover:scale-105"
          >
            Lihat Semua Produk
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
