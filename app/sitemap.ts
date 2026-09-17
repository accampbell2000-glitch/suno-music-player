import type { MetadataRoute } from "next";
import { calculatorDefinitions, categories } from "@/lib/calculator-definitions";
import { getAppUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getAppUrl();
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/calculators`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((category) => ({ url: `${siteUrl}/calculators/${category.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...calculatorDefinitions.map((definition) => ({ url: `${siteUrl}/calculators/${definition.categorySlug}/${definition.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
  return routes;
}
