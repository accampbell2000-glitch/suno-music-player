import type { Metadata } from "next";
import { Suspense } from "react";
import { getViewer, getSession } from "@/lib/session";
import { ProfilePanel } from "@/components/profile-panel";

export const metadata: Metadata = {
	title: "My area",
	robots: { index: false },
};

export default function DashboardPage() {
	return (
		<Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
			<Overview />
		</Suspense>
	);
}

async function Overview() {
	const session = await getSession();
	if (!session) return null; // layout already gates; belt-and-suspenders

	const viewer = await getViewer();
	const isMember = viewer?.kind === "member";

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold">
					Welcome back{viewer?.name ? `, ${viewer.name}` : ""}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Your toolkit, your last 20 calculations, and your profile all live
					here.
				</p>
			</div>

			<ProfilePanel email={viewer?.email ?? null} displayName={viewer?.name ?? null} />

			<section className="rounded-xl border border-dashed border-border/60 p-6">
				<h2 className="font-medium">My toolkit — coming soon</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Star a calculator and it pins here, so your most-used tools are one
					click from home. For now, everything is on{" "}
					<a href="/calculators" className="underline">the calculators page</a>.
				</p>
			</section>

			{!isMember && (
				<p className="text-xs text-muted-foreground">
					Signed in with a platform account ({session.userId}).
				</p>
			)}
		</div>
	);
}
