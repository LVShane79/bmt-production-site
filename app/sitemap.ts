import type { MetadataRoute } from "next";
import { articles } from "./insights/articles";
import { absoluteUrl } from "./lib/site";

const staticPages = [
  { path: "/", lastModified: "2026-07-24", changeFrequency: "monthly" as const, priority: 1 },
  { path: "/contact", lastModified: "2026-07-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/insights", lastModified: "2026-09-16", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/resources", lastModified: "2026-07-24", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/resources/projection-lab", lastModified: "2026-07-30", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/resources/project-questionnaire", lastModified: "2026-07-23", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/resources/site-survey", lastModified: "2026-07-24", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/resources/responsibility-matrix", lastModified: "2026-07-23", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/resources/commissioning", lastModified: "2026-07-24", changeFrequency: "monthly" as const, priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: new Date(page.lastModified),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const insightPages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/insights/${article.slug}`),
    lastModified: new Date(article.modifiedAt),
    changeFrequency: "yearly",
    priority: 0.75,
  }));

  return [...pages, ...insightPages];
}
