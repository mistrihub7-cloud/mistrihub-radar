import type { MetadataRoute } from "next";
import { categories } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mistrihub-radar.vercel.app";
  const now = new Date();
  const staticRoutes = ["", "/workers", "/categories", "/book", "/jobs", "/login", "/signup"];
  const categoryRoutes = categories.map((category) => `/workers?service=${encodeURIComponent(category.name)}`);

  return [...staticRoutes, ...categoryRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route.includes("workers") ? "daily" : "weekly",
    priority: route === "" ? 1 : route.includes("workers") ? 0.9 : 0.7
  }));
}
