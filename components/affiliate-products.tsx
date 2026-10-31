import { affiliateBottomPicks, affiliateUrl, affiliateDisclosure } from "@/config/affiliate-links";

/**
 * AffiliateProducts
 *
 * Bottom band with exactly three Amazon options, distinct from any in-calculator pick.
 * The tracking id and disclosure live in config/affiliate-links.ts. Every link
 * is labeled as paid.
 */
export function AffiliateProducts({ slug }: { slug: string }) {
	const picks = affiliateBottomPicks(slug);
	if (picks.length !== 3) return null;
	return (
		<section className="cf-affiliate">
			<div className="cf-section-heading">
				<div>
					<p className="cf-kicker">More from Amazon</p>
					<h2>More options for this calculator</h2>
				</div>
			</div>
			<div className="cf-affiliate-grid">
				{picks.map((pick) => (
					<a key={pick.name} className="cf-affiliate-card" href={affiliateUrl(pick.query)} target="_blank" rel="sponsored nofollow noopener">
						<h3>{pick.name} <span className="cf-affiliate-paid">(paid link)</span></h3>
						<p>{pick.blurb}</p>
						<span className="cf-card-arrow" aria-hidden="true">↗</span>
					</a>
				))}
			</div>
			<p className="cf-affiliate-disclosure">{affiliateDisclosure}</p>
		</section>
	);
}
