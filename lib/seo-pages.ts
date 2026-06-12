import { categories } from "./data";
import { cleanCategoryName } from "./category-display";

export const seoCities = [
  { name: "Ranchi", state: "Jharkhand", slug: "ranchi" },
  { name: "Patna", state: "Bihar", slug: "patna" },
  { name: "Lalganj", state: "Bihar", slug: "lalganj" },
  { name: "Hajipur", state: "Bihar", slug: "hajipur" },
  { name: "Muzaffarpur", state: "Bihar", slug: "muzaffarpur" },
  { name: "Gaya", state: "Bihar", slug: "gaya" },
  { name: "Darbhanga", state: "Bihar", slug: "darbhanga" },
  { name: "Bhagalpur", state: "Bihar", slug: "bhagalpur" },
  { name: "Jamshedpur", state: "Jharkhand", slug: "jamshedpur" },
  { name: "Dhanbad", state: "Jharkhand", slug: "dhanbad" },
  { name: "Bokaro", state: "Jharkhand", slug: "bokaro" },
  { name: "Hazaribagh", state: "Jharkhand", slug: "hazaribagh" }
];

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const seoServices = categories.map((category) => ({
  ...category,
  slug: slugify(category.name)
}));

export function serviceBySlug(slug: string) {
  return seoServices.find((service) => service.slug === slug);
}

export function cityBySlug(slug: string) {
  return seoCities.find((city) => city.slug === slug);
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://mistrihub-radar.vercel.app";
}

export function serviceSearchTitle(serviceName: string) {
  const lower = serviceName.toLowerCase();
  if (lower.includes("labour") || lower.includes("support")) return "Support assistant";
  if (lower.includes("ac")) return "AC repair";
  if (lower.includes("ro")) return "RO service";
  return cleanCategoryName(serviceName);
}
