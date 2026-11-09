import Image from "next/image";
import {
	getGraboAffiliateClickUrl,
	graboAffiliate,
} from "@/config/affiliate-links";
import type { CalculatorValues } from "@/lib/calculator-definitions";
import { getGraboFitDecision } from "@/lib/grabo-fit";

export function GraboFitRecommendation({
	slug,
	values,
}: {
	slug: string;
	values: CalculatorValues;
}) {
	const decision = getGraboFitDecision(slug, values);
	const trackedClickUrl =
		decision.status === "match"
			? getGraboAffiliateClickUrl(decision.modelCode)
			: null;

	return (
		<section
			className={`cf-grabo-fit${decision.status === "match" ? " is-match" : ""}`}
			data-status={decision.status}
			aria-live="polite"
			aria-atomic="true"
			aria-label="GRABO product recommendation"
		>
			<div className="cf-grabo-fit-main">
				<div className="cf-grabo-fit-copy">
					<p className="cf-kicker">
						{decision.status === "match"
							? "Suggested GRABO match"
							: "GRABO fit check"}
					</p>
					{decision.status === "match" ? (
						<>
							<h4>
								{decision.modelName} <span>({decision.modelCode})</span>
							</h4>
							<p className="cf-grabo-fit-rating">
								Stated rating: <strong>{decision.ratingLb} lb</strong>
							</p>
							<p>{decision.message}</p>
							{decision.sealNote && <p>{decision.sealNote}</p>}
							<p className="cf-grabo-fit-caution">
								This is not a guaranteed safe lift. Follow GRABO's current instructions.
							</p>
						</>
					) : (
						<p>{decision.message}</p>
					)}
				</div>
				{decision.status === "match" && trackedClickUrl && (
					<div className="cf-grabo-fit-creative">
						<a
							href={trackedClickUrl}
							target="_blank"
							rel="sponsored nofollow noopener"
							aria-label={`Visit ${decision.modelName} through the tracked affiliate link`}
						>
							<Image
								src={graboAffiliate.imageUrl}
								width={970}
								height={250}
								alt={graboAffiliate.imageAlt}
								className="w-full h-auto"
								loading="lazy"
							/>
							<span>Visit {decision.modelName} ↗</span>
						</a>
						<small>{graboAffiliate.disclosure}</small>
					</div>
				)}
			</div>
			<p className="cf-grabo-fit-source">
				The capacities and seal notes came from GRABO Partnerships. GRABO has not confirmed this weight-band routing across both calculators or every surface. Verify the model and surface against current official instructions before publication or lifting.
			</p>
		</section>
	);
}
