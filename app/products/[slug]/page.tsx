import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/ui/FadeIn";
import TiltCard from "@/components/ui/TiltCard";
import ProductGallery from "@/components/sections/ProductGallery";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, siteConfig } from "@/lib/seo";
import { getPublishedProducts, getProductBySlug } from "@/lib/cms/public-products";

const WHATSAPP_NUMBER = "62877234999550";

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const fullTitle = `${product.name} - Eleven Digital Indonesia`;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: fullTitle,
      description: product.description,
      url: `/products/${product.slug}`,
      type: "website",
      images: [{ url: product.image }],
    },
    twitter: {
      title: fullTitle,
      description: product.description,
      images: [product.image],
    },
  };
}

function parsePrice(price: string) {
  const digits = price.replace(/[^0-9]/g, "");
  return digits || "0";
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const allProducts = await getPublishedProducts();
  const related = allProducts.filter((item) => item.slug !== product.slug).slice(0, 3);
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Halo, saya tertarik dengan produk "${product.name}". Bisa minta info lebih lanjut?`
  )}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: absoluteUrl(product.image),
    category: product.category,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "IDR",
      price: parsePrice(product.price),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: siteConfig.name },
    },
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Produk", path: "/products" },
    { name: product.name, path: `/products/${product.slug}` },
  ]);

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumb} />
      <Navbar />
      <main>
        <section className="relative bg-brand-paper pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <Link
              href="/products"
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-brand-ink/60 transition-colors hover:text-brand-blue"
            >
              <ArrowLeft size={16} />
              Back to Products
            </Link>

            <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
              <FadeIn>
                <ProductGallery images={product.gallery} name={product.name} />
              </FadeIn>

              <FadeIn delay={0.1}>
                <span className="mb-4 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  {product.category}
                </span>
                <h1 className="font-heading text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                  {product.description}
                </p>
                <p className="mt-6 font-heading text-2xl font-semibold text-brand-blue">
                  {product.price}
                </p>

                <ul className="mt-8 space-y-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-brand-ink/70">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-blue" />
                      <span>{feature}</span>
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
                    Order via WhatsApp
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
                  Tentang Produk Ini
                </h2>
                <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                  {product.longDescription}
                </p>
              </div>
            </FadeIn>

            {related.length > 0 && (
              <div className="mt-24">
                <h2 className="mb-8 font-heading text-xl font-semibold text-ink-900">
                  Produk Lainnya
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <Link key={item.slug} href={`/products/${item.slug}`} data-cursor-hover>
                      <TiltCard
                        strength={8}
                        className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 90vw, 32vw"
                          />
                        </div>
                        <div className="p-6">
                          <span className="mb-3 inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                            {item.category}
                          </span>
                          <h3 className="font-heading text-lg font-semibold leading-snug text-ink-900">
                            {item.name}
                          </h3>
                          <p className="mt-5 font-heading text-base font-semibold text-brand-blue">
                            {item.price}
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
