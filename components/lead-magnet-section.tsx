import Link from "next/link";
import { CrevioForm } from "@/components/forms/crevio-form";

// Form provisioned in Crevio ("Catering Cheat Sheet") — email required,
// optional "what are you planning?" select. Submissions land as leads in the
// Crevio dashboard.
const FORM_ID = "form_oq3dgpL5ym8qiEO3nbzKDaAE";
const PDF_PATH = "/downloads/catering-cheat-sheet.pdf";

const LEAD_MAGNET_SLUGS = new Set(["catering-food-quantity", "bbq-meat", "taco-bar", "wedding-food"]);

/**
 * LeadMagnetSection
 *
 * End-of-page email capture on the food & event calculators: pitch on the
 * left, one-field form on the right, instant PDF download on success. One
 * form per page — these pages have no other form.
 */
export function LeadMagnetSection({ slug }: { slug: string }) {
	if (!LEAD_MAGNET_SLUGS.has(slug)) return null;
	return (
		<section className="cf-leadmagnet">
			<div className="cf-leadmagnet-card">
				<div className="cf-leadmagnet-pitch">
					<p className="cf-kicker">Free printable</p>
					<h2>The catering &amp; event food cheat sheet</h2>
					<p>
						Every planning number on this page — per-person quantities, BBQ yields,
						taco-bar math, wedding budgets — on two printable pages. One email,
						yours to keep. No spam.
					</p>
				</div>
				<CrevioForm
					formId={FORM_ID}
					description="Where should we send the PDF?"
					submitLabel="Send me the PDF"
					successSlot={
						<Link className="cf-button-dark cf-leadmagnet-download" href={PDF_PATH} download>
							Download the PDF now
						</Link>
					}
				/>
			</div>
		</section>
	);
}
