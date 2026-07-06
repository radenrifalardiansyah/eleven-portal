import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { projects } from "@/data/projects";
import { products } from "@/data/products";
import { services } from "@/data/services";
import { team } from "@/data/team";
import { stories } from "@/data/stories";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/case-study`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/products`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/team`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/stories`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/case-study/${project.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/products/${product.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteConfig.url}/services/${service.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const teamRoutes: MetadataRoute.Sitemap = team.map((member) => ({
    url: `${siteConfig.url}/team/${member.slug}`,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${siteConfig.url}/stories/${story.slug}`,
    lastModified: story.date,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...projectRoutes,
    ...productRoutes,
    ...serviceRoutes,
    ...teamRoutes,
    ...storyRoutes,
  ];
}
