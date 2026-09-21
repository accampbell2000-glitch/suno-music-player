import Link from "next/link";
import { CrevioForm } from "@/components/forms/crevio-form";

// Lead-magnet offer per calculator: which printable to pitch and which
// Crevio Form captures the email. Submissions land as leads in Crevio.
const OFFERS: Record<string, { formId: string; pdf: string; title: string; blurb: string; kicker: string }> = {
	"catering-food-quantity": {
		formId: "form_oq3dgpL5ym8qiEO3nbzKDaAE",
		pdf: "/downloads/catering-cheat-sheet.pdf",
		kicker: "Free printable",
		title: "The catering & event food cheat sheet",
		blurb: "Every planning number on this page — per-person quantities, BBQ yields, taco-bar math, wedding budgets — on two printable pages. One email, yours to keep. No spam.",
	},
	"bbq-meat": {
		formId: "form_oq3dgpL5ym8qiEO3nbzKDaAE",
		pdf: "/downloads/catering-cheat-sheet.pdf",
		kicker: "Free printable",
		title: "The catering & event food cheat sheet",
		blurb: "Yields, per-guest servings, and the buy-by-yield formula — plus the taco bar and wedding numbers — on two printable pages. One email, yours to keep. No spam.",
	},
	"taco-bar": {
		formId: "form_oq3dgpL5ym8qiEO3nbzKDaAE",
		pdf: "/downloads/catering-cheat-sheet.pdf",
		kicker: "Free printable",
		title: "The catering & event food cheat sheet",
		blurb: "The taco-bar math, per-person quantities, BBQ yields, and wedding budgets on two printable pages. One email, yours to keep. No spam.",
	},
	"wedding-food": {
		formId: "form_oq3dgpL5ym8qiEO3nbzKDaAE",
		pdf: "/downloads/catering-cheat-sheet.pdf",
		kicker: "Free printable",
		title: "The catering & event food cheat sheet",
		blurb: "Per-guest budget ranges, dessert planning, and every food quantity rule on two printable pages. One email, yours to keep. No spam.",
	},
	paint: {
		formId: "form_4ALOQ1GlnJEwfDP79YJgBDbp",
		pdf: "/downloads/home-improvement-cheat-sheet.pdf",
		kicker: "Free printable",
		title: "The home improvement math cheat sheet",
		blurb: "Paint, flooring, concrete, and mulch formulas with worked examples you can check in the store aisle. Two printable pages. One email, yours to keep. No spam.",
	},
	flooring: {
		formId: "form_4ALOQ1GlnJEwfDP79YJgBDbp",
		pdf: "/downloads/home-improvement-cheat-sheet.pdf",
		kicker: "Free printable",
		title: "The home improvement math cheat sheet",
		blurb: "Waste allowances, box math, and the rest of the paint, flooring, concrete, and mulch formulas on two printable pages. One email, yours to keep. No spam.",
	},
	mulch: {
		formId: "form_4ALOQ1GlnJEwfDP79YJgBDbp",
		pdf: "/downloads/home-improvement-cheat-sheet.pdf",
		kicker: "Free printable",
		title: "The home improvement math cheat sheet",
		blurb: "The area × depth formula, bulk-vs-bagged crossover, and the paint, flooring, and concrete rules on two printable pages. One email, yours to keep. No spam.",
	},
	concrete: {
		formId: "form_4ALOQ1GlnJEwfDP79YJgBDbp",
		pdf: "/downloads/home-improvement-cheat-sheet.pdf",
		kicker: "Free printable",
		title: "The home improvement math cheat sheet",
		blurb: "Yards, bags, and waste — plus the paint, flooring, and mulch formulas — on two printable pages. One email, yours to keep. No spam.",
	},
};

/**
 * LeadMagnetSection
 *
 * End-of-page email capture on the buying-intent calculators: pitch on the
 * left, one-field form on the right, instant PDF download on success. One
 * form per page — these pages have no other form.
 */
export function LeadMagnetSection({ slug }: { slug: string }) {
	const offer = OFFERS[slug];
	if (!offer) return null;
	return (
		<section className="cf-leadmagnet">
			<div className="cf-leadmagnet-card">
				<div className="cf-leadmagnet-pitch">
					<p className="cf-kicker">{offer.kicker}</p>
					<h2>{offer.title}</h2>
					<p>{offer.blurb}</p>
				</div>
				<CrevioForm
					formId={offer.formId}
					description="Where should we send the PDF?"
					submitLabel="Send me the PDF"
					successSlot={
						<Link className="cf-button-dark cf-leadmagnet-download" href={offer.pdf} download>
							Download the PDF now
						</Link>
					}
				/>
			</div>
		</section>
	);
}
