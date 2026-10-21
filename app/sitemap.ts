import type { MetadataRoute } from "next";
import { articles } from "./insights/articles";
import { lessons } from "./learn/it-for-av/lessons";
import { absoluteUrl } from "./lib/site";

const staticPages = [
  { path: "/", lastModified: "2026-07-24", changeFrequency: "monthly" as const, priority: 1 },
  { path: "/contact", lastModified: "2026-07-21", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/insights", lastModified: "2026-09-16", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/learn/it-for-av/guides/snmp-lab", lastModified: "2026-10-21", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/learn/it-for-av", lastModified: "2026-10-21", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/resources", lastModified: "2026-07-24", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/resources/speaker-lab", lastModified: "2026-10-16", changeFrequency: "monthly" as const, priority: 0.85 },
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

  const lessonPages: MetadataRoute.Sitemap = lessons.map((lesson) => ({
    url: absoluteUrl(`/learn/it-for-av/${lesson.slug}`),
    lastModified: new Date(lesson.publishedAt),
    changeFrequency: "monthly",
    priority: 0.78,
  }));

  return [...pages, ...insightPages, ...lessonPages];
}
