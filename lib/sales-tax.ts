export type SalesTaxMode = "add" | "extract";
export type SalesTaxCalculation = {
	preTaxAmount: number | null;
	taxAmount: number | null;
	total: number | null;
	validation: string;
};

type NumericInput = string | number | null | undefined;

function readNonnegative(value: NumericInput): number | null {
	if (typeof value === "string" && value.trim() === "") return null;
	if (typeof value !== "string" && typeof value !== "number") return null;
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : null;
}

function cents(value: number): number {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSalesTax(
	amountInput: NumericInput,
	rateInput: NumericInput,
	mode: SalesTaxMode | string,
): SalesTaxCalculation {
	const amount = readNonnegative(amountInput);
	const rate = readNonnegative(rateInput);
	if (mode !== "add" && mode !== "extract")
		return {
			preTaxAmount: null,
			taxAmount: null,
			total: null,
			validation: "Choose whether to add or extract tax.",
		};
	if (amount === null)
		return {
			preTaxAmount: null,
			taxAmount: null,
			total: null,
			validation: "Enter a non-negative amount.",
		};
	if (rate === null) {
		const rateIsBlank =
			rateInput === null ||
			rateInput === undefined ||
			(typeof rateInput === "string" && rateInput.trim() === "");
		return {
			preTaxAmount: null,
			taxAmount: null,
			total: null,
			validation: rateIsBlank
				? "Enter the rate you already have to see the tax breakdown."
				: "Enter a non-negative rate.",
		};
	}
	const rateFactor = rate / 100;
	if (!Number.isFinite(rateFactor))
		return {
			preTaxAmount: null,
			taxAmount: null,
			total: null,
			validation: "Use a finite amount and rate.",
		};

	if (mode === "add") {
		const preTaxAmount = cents(amount);
		const taxAmount = cents(preTaxAmount * rateFactor);
		const total = cents(preTaxAmount + taxAmount);
		if (![preTaxAmount, taxAmount, total].every(Number.isFinite))
			return {
				preTaxAmount: null,
				taxAmount: null,
				total: null,
				validation: "The result is outside the supported number range.",
			};
		return { preTaxAmount, taxAmount, total, validation: "" };
	}

	const total = cents(amount);
	const preTaxAmount = cents(total / (1 + rateFactor));
	const taxAmount = cents(total - preTaxAmount);
	if (![preTaxAmount, taxAmount, total].every(Number.isFinite))
		return {
			preTaxAmount: null,
			taxAmount: null,
			total: null,
			validation: "The result is outside the supported number range.",
		};
	return { preTaxAmount, taxAmount, total, validation: "" };
}
