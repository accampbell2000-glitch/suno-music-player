import type { Metadata } from "next";
import Link from "next/link";
import { CrevioForm } from "@/components/forms/crevio-form";

// Form provisioned in Crevio ("Calculator Requests") — email required, idea
// required, optional area select. Requests land as leads with the idea text.
const FORM_ID = "form_vKmMapEAr3PNcYwj9RWX346P";

export const metadata: Metadata = {
	title: "Request a calculator | CalcForged",
	description: "Tell us the calculation you keep doing and we'll build the calculator. Free, and you get both cheat sheets while you wait.",
};

export default function CalculatorRequestPage() {
	return (
		<main className="cf-page">
			<div className="cf-shell">
				<div className="cf-page-intro">
					<p className="cf-kicker">Calculator requests</p>
					<h1>What should we <em>build next?</em></h1>
					<p>
						Tell us the calculation you keep doing in your head — the one you
						always end up searching for. If it helps more than one person,
						we&apos;ll build it free and put it on the site. You get the email
						when it ships.
					</p>
				</div>
				<div className="cf-request-grid">
					<CrevioForm
						formId={FORM_ID}
						heading="Describe the math"
						description="What do you need to figure out, and what do you know when you start? The more detail, the better the calculator."
						submitLabel="Send my request"
						successSlot={
							<div className="cf-request-reward">
								<p className="cf-kicker">While you wait</p>
								<p>Both printable cheat sheets are yours — no waiting:</p>
								<div className="cf-request-reward-links">
									<Link className="cf-button-dark" href="/downloads/catering-cheat-sheet.pdf" download>
										Catering cheat sheet
									</Link>
									<Link className="cf-button-dark" href="/downloads/home-improvement-cheat-sheet.pdf" download>
										Home improvement cheat sheet
									</Link>
								</div>
							</div>
						}
					/>
					<aside className="cf-request-aside">
						<p className="cf-kicker">Built so far</p>
						<p className="cf-request-count">26</p>
						<p>
							Calculators live today across food and events, home
							improvement, construction, finance, health, travel, education,
							and everyday life.
						</p>
						<p className="cf-request-promise">
							We read every request. The ones that help the most people get
							built first — usually within a couple of weeks.
						</p>
					</aside>
				</div>
			</div>
		</main>
	);
}
