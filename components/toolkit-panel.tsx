"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calculatorsBySlug } from "@/lib/calculator-definitions";

const SUGGESTED = ["recipe-scaling", "paint", "mortgage", "wedding-food", "bbq-meat", "tip"];

export function ToolkitPanel() {
	const [slugs, setSlugs] = useState<string[] | null>(null);

	useEffect(() => {
		let alive = true;
		fetch("/api/toolkit")
			.then((res) => (res.ok ? (res.json() as Promise<{ ok?: boolean; slugs?: string[] }>) : null))
			.then((data) => {
				if (alive && data?.ok) setSlugs(data.slugs ?? []);
			})
			.catch(() => alive && setSlugs([]));
		return () => {
			alive = false;
		};
	}, []);

	async function toggle(slug: string, action: "add" | "remove") {
		setSlugs((current) => {
			const list = current ?? [];
			return action === "add" ? [slug, ...list] : list.filter((item) => item !== slug);
		});
		const res = await fetch("/api/toolkit", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ slug, action }),
		});
		if (!res.ok) {
			setSlugs((current) => (action === "add" ? (current ?? []).filter((item) => item !== slug) : [slug, ...(current ?? [])]));
		}
	}

	if (slugs === null) {
		return <p className="text-sm text-muted-foreground">Loading your toolkit…</p>;
	}

	const saved = slugs.map((slug) => calculatorsBySlug[slug]).filter(Boolean);
	const suggestions = SUGGESTED.filter((slug) => !slugs.includes(slug)).map((slug) => calculatorsBySlug[slug]).filter(Boolean);

	return (
		<div className="flex flex-col gap-6">
			{saved.length > 0 ? (
				<section className="rounded-xl border border-border/60 bg-card p-6">
					<h2 className="text-sm font-medium text-muted-foreground">Saved calculators · {saved.length}</h2>
					<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{saved.map((definition) => (
							<div key={definition.slug} className="relative rounded-lg border border-border bg-background p-4">
								<button
									type="button"
									onClick={() => toggle(definition.slug, "remove")}
									className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
									aria-label={`Remove ${definition.name} from toolkit`}
								>
									Remove
								</button>
								<Link href={`/calculators/${definition.categorySlug}/${definition.slug}`} className="block pr-14">
									<span className="text-2xl" aria-hidden="true">{definition.icon}</span>
									<p className="mt-2 font-medium leading-snug">{definition.name}</p>
									<p className="mt-1 text-sm text-muted-foreground">{definition.description}</p>
								</Link>
							</div>
						))}
					</div>
				</section>
			) : (
				<section className="rounded-xl border border-dashed border-border/60 p-6 text-center">
					<h2 className="font-medium">Nothing saved yet</h2>
					<p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
						Open any calculator and press the star — it pins here. Or add a
						starter set below.
					</p>
				</section>
			)}

			{suggestions.length > 0 && (
				<section className="rounded-xl border border-border/60 bg-card p-6">
					<h2 className="text-sm font-medium text-muted-foreground">Quick add</h2>
					<div className="mt-4 flex flex-wrap gap-2">
						{suggestions.map((definition) => (
							<button
								key={definition.slug}
								type="button"
								onClick={() => toggle(definition.slug, "add")}
								className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
							>
								+ {definition.name}
							</button>
						))}
					</div>
				</section>
			)}

			<p className="text-sm text-muted-foreground">
				Names, birthday, everything optional —{" "}
				<Link href="/dashboard" className="underline">edit your profile</Link>.
			</p>
		</div>
	);
}
