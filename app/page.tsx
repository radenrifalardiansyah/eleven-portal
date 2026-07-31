import { Fragment } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Team from "@/components/sections/Team";
import CaseStudy from "@/components/sections/CaseStudy";
import ClientLogos from "@/components/sections/ClientLogos";
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
import { getPublishedClientLogos, getPublishedTestimonialQuotes } from "@/lib/cms/public-testimonials";
import { getHomeSectionContent } from "@/lib/cms/public-page-sections";
import { getVisibleHomeSections } from "@/lib/cms/public-menu";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
};

export default async function Home() {
  const [products, services, stories, team, projects, clientLogos, testimonials, sections, visibleSections] =
    await Promise.all([
      getPublishedProducts(),
      getPublishedServices(),
      getPublishedStories(),
      getPublishedTeamMembers(),
      getPublishedProjects(),
      getPublishedClientLogos(),
      getPublishedTestimonialQuotes(),
      getHomeSectionContent(),
      getVisibleHomeSections(),
    ]);

  const hero = sections.hero;
  const about = sections.about;
  const contact = sections.contact;

  // Hero/About/Contact have no menu_item/module behind them, so they stay
  // as fixed bookends. Everything else is keyed by module_key and rendered
  // in the menu's own sort_order — the same order the admin sidebar, Hak
  // Akses Role, and the public navbar all use, so reordering in Struktur
  // Menu keeps the navbar and homepage sections in sync automatically.
  const sectionsByModule: Record<string, React.ReactNode> = {
    services: (
      <Services
        key="services"
        services={services}
        eyebrow={sections.services_header?.eyebrow}
        title={sections.services_header?.title}
        description={sections.services_header?.description}
        ctaLabel={sections.services_header?.cta_label}
      />
    ),
    projects: (
      <CaseStudy
        key="projects"
        projects={projects}
        eyebrow={sections.casestudy_header?.eyebrow}
        title={sections.casestudy_header?.title}
        description={sections.casestudy_header?.description}
        ctaLabel={sections.casestudy_header?.cta_label}
      />
    ),
    testimonials: (
      <Fragment key="testimonials">
        <ClientLogos
          clients={clientLogos}
          eyebrow={sections.testimonials_header?.eyebrow}
          title={sections.testimonials_header?.title}
          description={sections.testimonials_header?.description}
        />
        <Testimonials
          testimonials={testimonials}
          eyebrow={sections.testimonial_quotes_header?.eyebrow}
          title={sections.testimonial_quotes_header?.title}
          description={sections.testimonial_quotes_header?.description}
        />
      </Fragment>
    ),
    products: (
      <Products
        key="products"
        products={products}
        eyebrow={sections.products_header?.eyebrow}
        title={sections.products_header?.title}
        description={sections.products_header?.description}
        ctaLabel={sections.products_header?.cta_label}
      />
    ),
    team: (
      <Team
        key="team"
        team={team}
        eyebrow={sections.team_header?.eyebrow}
        title={sections.team_header?.title}
        description={sections.team_header?.description}
        ctaLabel={sections.team_header?.cta_label}
      />
    ),
    stories: (
      <Stories
        key="stories"
        stories={stories}
        eyebrow={sections.stories_header?.eyebrow}
        title={sections.stories_header?.title}
        description={sections.stories_header?.description}
        ctaLabel={sections.stories_header?.cta_label}
      />
    ),
  };

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <Navbar />
      <main>
        <Hero
          eyebrow={hero?.eyebrow}
          titlePrefix={hero?.title_prefix}
          titleHighlight={hero?.title_highlight}
          titleSuffix={hero?.title_suffix}
          ctaLabel={hero?.cta_label}
          ctaHref={hero?.cta_href}
          secondaryLabel={hero?.secondary_label}
          secondaryHref={hero?.secondary_href}
          image={hero?.image}
        />
        <About
          eyebrow={about?.eyebrow}
          title={about?.title}
          ctaLabel={about?.cta_label}
          ctaHref={about?.cta_href}
          image={about?.image}
        />
        {visibleSections.map((moduleKey) => sectionsByModule[moduleKey] ?? null)}
        <Contact
          eyebrow={contact?.eyebrow}
          title={contact?.title}
          submitLabel={contact?.submit_label}
          image={contact?.image}
        />
      </main>
      <Footer />
    </>
  );
}
