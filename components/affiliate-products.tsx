import { affiliatePicks, affiliateUrl, affiliateDisclosure } from "@/config/affiliate-links";

/**
 * AffiliateProducts
 *
 * "Gear for the job" band shown on buying-intent calculator pages. Each card
 * links to an Amazon search for the product; the tracking tag (and earnings)
 * live in config/affiliate-links.ts. Links are rel="sponsored" + nofollow,
 * and the disclosure keeps the page FTC-compliant whether or not the
 * Associates tag is configured yet.
 */
export function AffiliateProducts({ slug }: { slug: string }) {
	const picks = affiliatePicks[slug];
	if (!picks?.length) return null;
	return (
		<section className="cf-affiliate">
			<div className="cf-section-heading">
				<div>
					<p className="cf-kicker">Gear for the job</p>
					<h2>Tools &amp; materials people actually buy</h2>
				</div>
			</div>
			<div className="cf-affiliate-grid">
				{picks.map((pick) => (
					<a key={pick.name} className="cf-affiliate-card" href={affiliateUrl(pick.query)} target="_blank" rel="sponsored nofollow noopener">
						<h3>{pick.name}</h3>
						<p>{pick.blurb}</p>
						<span className="cf-card-arrow" aria-hidden="true">↗</span>
					</a>
				))}
			</div>
			<p className="cf-affiliate-disclosure">{affiliateDisclosure}</p>
		</section>
	);
}
