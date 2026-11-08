export type PxRemMode = "px-to-rem" | "rem-to-px";

export type PxRemCalculation = {
	cssValue: string;
	formula: string;
	note: string;
};

function readNumber(value: string | number | undefined, fallback: number) {
	if (value === undefined || value === "") return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function roundTo(value: number, digits: number) {
	const factor = 10 ** digits;
	return (
		Math.sign(value) *
		(Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor)
	);
}

function compact(value: number, digits: number) {
	return String(Number(value.toFixed(digits)));
}

function invalid(note: string): PxRemCalculation {
	return { cssValue: "", formula: "", note };
}

export function calculatePxRem(
	mode: PxRemMode,
	valueInput: string | number | undefined,
	rootFontSizeInput: string | number | undefined,
): PxRemCalculation {
	const inputFallback = mode === "px-to-rem" ? 24 : 1.5;
	const value = readNumber(valueInput, inputFallback);
	const rootFontSize = readNumber(rootFontSizeInput, 16);
	if (value === null) return invalid("Enter a valid number to convert.");
	if (rootFontSize === null || rootFontSize <= 0)
		return invalid("Enter a root font size greater than 0px.");

	const convertedRaw =
		mode === "px-to-rem" ? value / rootFontSize : value * rootFontSize;
	if (!Number.isFinite(convertedRaw))
		return invalid("The values are outside the supported range.");

	const digits = mode === "px-to-rem" ? 4 : 2;
	const converted = roundTo(convertedRaw, digits);
	const inputText = compact(value, 4);
	const rootText = compact(rootFontSize, 4);
	const outputText = compact(converted, digits);
	const unit = mode === "px-to-rem" ? "rem" : "px";
	const cssValue = `${outputText}${unit}`;
	const formula =
		mode === "px-to-rem"
			? `${inputText}px ÷ ${rootText}px = ${cssValue}.`
			: `${inputText}rem × ${rootText}px = ${cssValue}.`;

	return {
		cssValue,
		formula,
		note:
			mode === "px-to-rem"
				? "REM output is rounded to 4 decimal places."
				: "Pixel output is rounded to 2 decimal places.",
	};
}
