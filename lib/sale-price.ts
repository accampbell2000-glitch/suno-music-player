export type SalePriceCalculation = {
	salePrice: number | string;
	discountAmount: number | string;
	formula: string;
	validation: string;
};

function readNumber(value: string | number | undefined, fallback: number) {
	if (value === undefined || value === "") return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function roundToCents(value: number) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

function usd(value: number) {
	return `$${value.toFixed(2)}`;
}

function invalidResult(validation: string): SalePriceCalculation {
	return { salePrice: "", discountAmount: "", formula: "", validation };
}

export function calculateSalePrice(
	priceInput: string | number | undefined,
	discountInput: string | number | undefined,
): SalePriceCalculation {
	const originalPrice = readNumber(priceInput, 80);
	const discountPercent = readNumber(discountInput, 25);
	if (originalPrice === null || originalPrice < 0)
		return invalidResult("Enter an original price of $0 or more.");
	if (
		discountPercent === null ||
		discountPercent < 0 ||
		discountPercent > 100
	)
		return invalidResult("Enter a discount from 0% to 100%.");

	const discountAmount = roundToCents(
		(originalPrice * discountPercent) / 100,
	);
	const salePrice = roundToCents(originalPrice - discountAmount);
	const formula = `${usd(originalPrice)} × ${discountPercent}% = ${usd(discountAmount)} off; ${usd(originalPrice)} - ${usd(discountAmount)} = ${usd(salePrice)} sale price.`;

	return {
		salePrice,
		discountAmount,
		formula,
		validation: "Before sales tax. One percentage discount is applied.",
	};
}
