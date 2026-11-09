import Image from "next/image";
import {
	affiliateTopPicks,
	affiliateUrl,
	graboAffiliate,
} from "@/config/affiliate-links";

function GraboPartnerPick({ slug }: { slug: string }) {
	return (
		<div className="cf-partner-strip cf-grabo-pick">
			<p className="cf-kicker">
				{slug === "deck-boards" ? "GRABO partner offer" : "For tile & pavers"}
			</p>
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

function AmazonPartnerPick({ slug }: { slug: string }) {
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

export function AffiliatePick({
	slug,
	hideGrabo = false,
}: {
	slug: string;
	hideGrabo?: boolean;
}) {
	const hasGrabo = graboAffiliate.slugs.includes(slug);
	const pick = affiliateTopPicks[slug];

	if (hideGrabo) return pick ? <AmazonPartnerPick slug={slug} /> : null;
	if (hasGrabo && slug !== "deck-boards") return <GraboPartnerPick slug={slug} />;
	if (!hasGrabo && !pick) return null;

	return (
		<>
			{hasGrabo && <GraboPartnerPick slug={slug} />}
			{pick && <AmazonPartnerPick slug={slug} />}
		</>
	);
}
