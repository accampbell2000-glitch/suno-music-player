import type { Metadata } from "next";
import { ToolkitPanel } from "@/components/toolkit-panel";

export const metadata: Metadata = {
	title: "My toolkit",
	robots: { index: false },
};

export default function ToolkitPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold">My toolkit</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					The calculators you save show up here, on any device you sign in
					from. Star a calculator anywhere on the site and it pins itself.
				</p>
			</div>
			<ToolkitPanel />
		</div>
	);
}
