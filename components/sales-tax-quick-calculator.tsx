"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateSalesTax, type SalesTaxMode } from "@/lib/sales-tax";

const money = (value: number | null) =>
	value === null
		? "—"
		: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export function SalesTaxQuickCalculator({ idPrefix = "sales-tax-quick" }: { idPrefix?: string }) {
	const id = idPrefix;
	const [mode, setMode] = useState<SalesTaxMode>("add");
	const [amount, setAmount] = useState("100");
	const [rate, setRate] = useState("");
	const result = useMemo(() => calculateSalesTax(amount, rate, mode), [amount, rate, mode]);

	return (
		<section className="cf-tax-panel" aria-labelledby={`${id}-title`}>
			<div className="cf-graph-heading">
				<div>
					<p className="cf-quick-brandline">
						<span className="cf-quick-brandmark" aria-hidden="true">CF</span>
						<span className="cf-quick-brandname">CALCFORGED</span>
						<span className="cf-quick-model">BUSINESS</span>
					</p>
					<h3 id={`${id}-title`}>Sales tax</h3>
				</div>
				<Link href="/calculators/business/sales-tax" className="cf-tax-page-link" aria-label="Open the full sales tax calculator">Full tool ↗</Link>
			</div>
			<fieldset className="cf-tax-modes">
				<legend className="sr-only">Sales tax calculation mode</legend>
				<button type="button" aria-pressed={mode === "add"} onClick={() => setMode("add")}>Add tax</button>
				<button type="button" aria-pressed={mode === "extract"} onClick={() => setMode("extract")}>Extract tax</button>
			</fieldset>
			<div className="cf-tax-inputs">
				<label htmlFor={`${id}-amount`}>
					<span>{mode === "add" ? "Pre-tax amount" : "Tax-inclusive total"}</span>
					<div className="cf-tax-input-wrap"><span aria-hidden="true">$</span><input id={`${id}-amount`} type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
				</label>
				<label htmlFor={`${id}-rate`}>
					<span>Rate you enter</span>
					<div className="cf-tax-input-wrap"><input id={`${id}-rate`} type="number" min="0" step="0.01" placeholder="Your rate" value={rate} onChange={(event) => setRate(event.target.value)} /><span aria-hidden="true">%</span></div>
				</label>
			</div>
			{result.validation ? (
				<p className="cf-tax-validation" role="status">{result.validation}</p>
			) : (
				<div className="cf-tax-results" aria-live="polite">
					<div><span>Before tax</span><strong>{money(result.preTaxAmount)}</strong></div>
					<div><span>Tax</span><strong>{money(result.taxAmount)}</strong></div>
					<div className="is-total"><span>Total</span><strong>{money(result.total)}</strong></div>
				</div>
			)}
			<p className="cf-tax-disclaimer">Uses only the rate you enter. Check which rate and items apply; this is not tax advice.</p>
		</section>
	);
}
