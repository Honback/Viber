import type { MetadataRoute } from "next";

import { db } from "@/db";
import { getAllPosts } from "@/lib/blog/posts";
import { getAdminProjectsData } from "@/lib/services/read-models";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  const [projects, allTags] = await Promise.all([
    getAdminProjectsData(),
    db.query.tags.findMany({ columns: { slug: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/policy/content`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/policy/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => ["published", "limited", "archived"].includes(project.status))
    .map((project) => ({
      url: `${baseUrl}/p/${project.slug}`,
      lastModified: project.latestActivityAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const tagRoutes: MetadataRoute.Sitemap = allTags.map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const blogPosts = getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticRoutes, ...projectRoutes, ...tagRoutes, ...blogRoutes];
}
