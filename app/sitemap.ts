import type { MetadataRoute } from "next";
import {
	calculatorDefinitions,
	categories,
} from "@/lib/calculator-definitions";
import { getLegalPages } from "@/lib/data";
import { getAppUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = getAppUrl();
	const legalPageList = await getLegalPages().catch(() => null);
	const routes: MetadataRoute.Sitemap = [
		{ url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
		{ url: `${siteUrl}/calculators`, changeFrequency: "daily", priority: 0.9 },
		{
			url: `${siteUrl}/calculator-requests`,
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{ url: `${siteUrl}/install`, changeFrequency: "yearly", priority: 0.4 },
		...categories.map((category) => ({
			url: `${siteUrl}/calculators/${category.slug}`,
			changeFrequency: "weekly" as const,
			priority: 0.7,
		})),
		...calculatorDefinitions.map((definition) => ({
			url: `${siteUrl}/calculators/${definition.categorySlug}/${definition.slug}`,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
		...(legalPageList?.data ?? []).map((policy) => ({
			url: `${siteUrl}/legal/${policy.slug}`,
			changeFrequency: "yearly" as const,
			priority: 0.3,
		})),
	];
	return routes;
}
