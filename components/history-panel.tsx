"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calculatorsBySlug } from "@/lib/calculator-definitions";

interface HistoryRow {
	slug: string;
	summary: string | null;
	inputs: Record<string, string> | null;
	at: string;
}

export function HistoryPanel() {
	const [rows, setRows] = useState<HistoryRow[] | null>(null);

	useEffect(() => {
		let alive = true;
		fetch("/api/history")
			.then((res) => (res.ok ? (res.json() as Promise<{ ok?: boolean; rows?: HistoryRow[] }>) : null))
			.then((data) => {
				if (alive && data?.ok) setRows(data.rows ?? []);
			})
			.catch(() => {
				if (alive) setRows([]);
			});
		return () => {
			alive = false;
		};
	}, []);

	if (rows === null) return <p className="text-sm text-muted-foreground">Loading your history…</p>;

	if (rows.length === 0) {
		return (
			<section className="rounded-xl border border-dashed border-border/60 p-6 text-center">
				<h2 className="font-medium">Nothing here yet</h2>
				<p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
					Run any calculator while signed in and it lands here automatically —
					numbers included, ready to reopen.
				</p>
			</section>
		);
	}

	const reopenUrl = (row: HistoryRow): string | null => {
		const definition = calculatorsBySlug[row.slug];
		if (!definition) return null;
		const params = new URLSearchParams();
		if (row.inputs) {
			Object.entries(row.inputs).forEach(([key, value]) => {
				if (value !== "" && value !== null && value !== undefined) params.set(key, String(value));
			});
		}
		const query = params.toString();
		return `/calculators/${definition.categorySlug}/${definition.slug}${query ? `?${query}` : ""}`;
	};

	const describe = (row: HistoryRow): string => {
		const definition = calculatorsBySlug[row.slug];
		if (!definition) return "";
		if (!row.inputs) return row.summary ?? "";
		return definition.fields
			.filter((field) => field.type !== "ingredient-list" && row.inputs?.[field.key] !== undefined)
			.map((field) => {
				const raw = String(row.inputs?.[field.key]);
				const option = field.options?.find((candidate) => candidate.value === raw);
				return `${field.label}: ${option ? option.label : raw}`;
			})
			.join(" · ");
	};

	return (
		<section className="rounded-xl border border-border/60 bg-card p-6">
			<h2 className="text-sm font-medium text-muted-foreground">Latest 20 · saved automatically</h2>
			<ol className="mt-4 divide-y divide-border">
				{rows.map((row, index) => {
					const definition = calculatorsBySlug[row.slug];
					const url = reopenUrl(row);
					return (
						<li key={`${row.slug}-${row.at}-${index}`} className="flex items-center justify-between gap-4 py-3">
							<div className="min-w-0">
								<p className="text-sm font-medium">
									<span className="mr-2" aria-hidden="true">{definition?.icon}</span>
									{definition?.name ?? row.slug}
								</p>
								<p className="mt-0.5 truncate text-sm text-muted-foreground">{describe(row)}</p>
								<p className="mt-0.5 text-xs text-muted-foreground">
									{new Date(row.at.includes("T") ? row.at : `${row.at.replace(" ", "T")}Z`).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
								</p>
							</div>
							{url && (
								<Link href={url} className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
									Reopen
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</section>
	);
}
