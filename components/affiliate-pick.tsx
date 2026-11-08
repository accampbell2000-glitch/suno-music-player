import Image from "next/image";
import {
	affiliateTopPicks,
	affiliateUrl,
	graboAffiliate,
} from "@/config/affiliate-links";

export function AffiliatePick({ slug }: { slug: string }) {
	if (graboAffiliate.slugs.includes(slug)) {
		return (
			<div className="cf-partner-strip cf-grabo-pick">
				<p className="cf-kicker">For tile &amp; pavers</p>
				<a
					href={graboAffiliate.clickUrl}
					target="_blank"
					rel="sponsored nofollow noopener"
					aria-label="Shop GRABO portable vacuum lifters"
				>
					<Image
						src={graboAffiliate.imageUrl}
						width={970}
						height={250}
						alt={graboAffiliate.imageAlt}
						className="w-full h-auto"
						loading="lazy"
					/>
				</a>
				<small>{graboAffiliate.disclosure}</small>
			</div>
		);
	}

	const pick = affiliateTopPicks[slug];
	if (!pick) return null;

	return (
		<div className="cf-partner-strip">
			<p className="cf-kicker">Partner pick</p>
			<a
				href={affiliateUrl(pick.query)}
				target="_blank"
				rel="sponsored nofollow noopener"
			>
				<strong>{pick.name}</strong>
				<span>{pick.blurb}</span>
				<em>Paid link · Check current price ↗</em>
			</a>
			<small>As an Amazon Associate I earn from qualifying purchases.</small>
		</div>
	);
}
