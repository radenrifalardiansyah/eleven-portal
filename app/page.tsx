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
import { getPublishedProducts } from "@/lib/cms/public-products";
import { getPublishedServices } from "@/lib/cms/public-services";
import { getPublishedStories } from "@/lib/cms/public-stories";
import { getPublishedTeamMembers } from "@/lib/cms/public-team";
import { getPublishedProjects } from "@/lib/cms/public-projects";
import { getPublishedClientLogos } from "@/lib/cms/public-testimonials";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
};

export default async function Home() {
  const products = await getPublishedProducts();
  const services = await getPublishedServices();
  const stories = await getPublishedStories();
  const team = await getPublishedTeamMembers();
  const projects = await getPublishedProjects();
  const clientLogos = await getPublishedClientLogos();

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <Navbar />
      <main>
        <Hero />
        <Services services={services} />
        <About />
        <CaseStudy projects={projects} />
        <Testimonials clients={clientLogos} />
        <Products products={products} />
        <Team team={team} />
        <Stories stories={stories} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
