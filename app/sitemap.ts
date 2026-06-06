import type { MetadataRoute } from "next";
import { seoCities, seoServices } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mistrihub-radar.vercel.app";
  const now = new Date();
  const staticRoutes = ["", "/workers", "/categories", "/book", "/jobs", "/login", "/signup"];
  const serviceRoutes = seoServices.map((service) => `/services/${service.slug}`);
  const cityServiceRoutes = seoServices.flatMap((service) => seoCities.map((city) => `/services/${service.slug}/${city.slug}`));

  return [...staticRoutes, ...serviceRoutes, ...cityServiceRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route.includes("services") || route.includes("workers") ? "daily" : "weekly",
    priority: route === "" ? 1 : route.includes("services") || route.includes("workers") ? 0.9 : 0.7
  }));
}
