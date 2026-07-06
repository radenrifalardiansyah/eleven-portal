import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Team from "@/components/sections/Team";
import CaseStudy from "@/components/sections/CaseStudy";
import Testimonials from "@/components/sections/Testimonials";
import Stories from "@/components/sections/Stories";
import Products from "@/components/sections/Products";
import Contact from "@/components/sections/Contact";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/seo";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
};

export default function Home() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <CaseStudy />
        <Testimonials />
        <Products />
        <Team />
        <Stories />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
