import type { Metadata } from "next";
import { HistoryPanel } from "@/components/history-panel";

export const metadata: Metadata = {
	title: "History",
	robots: { index: false },
};

export default function HistoryPage() {
	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-semibold">History</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Your last 20 calculations, kept automatically while you&apos;re
					signed in. Reopen one and it comes back with the numbers you used.
				</p>
			</div>
			<HistoryPanel />
		</div>
	);
}
