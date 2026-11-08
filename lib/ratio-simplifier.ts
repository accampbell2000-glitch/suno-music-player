export type RatioSimplification = {
	simplifiedRatio: string;
	commonFactor: string;
	formula: string;
	note: string;
};

type ParsedTerm = {
	scaledValue: bigint;
	decimalPlaces: number;
	displayValue: string;
};

function formatScaled(value: bigint, decimalPlaces: number) {
	if (decimalPlaces === 0) return value.toString();
	const scale = 10n ** BigInt(decimalPlaces);
	const whole = value / scale;
	const fraction = (value % scale)
		.toString()
		.padStart(decimalPlaces, "0")
		.replace(/0+$/, "");
	return fraction ? `${whole}.${fraction}` : whole.toString();
}

function parseTerm(value: string | number | undefined): ParsedTerm | null {
	const raw = String(value ?? "").trim();
	const match = /^(\d*)(?:\.(\d{1,6}))?$/.exec(raw);
	if (!match || (match[1] === "" && !match[2])) return null;

	const whole = BigInt(match[1] || "0");
	const fraction = match[2] ?? "";
	const decimalPlaces = fraction.length;
	const scale = 10n ** BigInt(decimalPlaces);
	const scaledValue = whole * scale + BigInt(fraction || "0");
	return {
		scaledValue,
		decimalPlaces,
		displayValue: formatScaled(scaledValue, decimalPlaces),
	};
}

function greatestCommonDivisor(first: bigint, second: bigint) {
	let left = first;
	let right = second;
	while (right !== 0n) {
		[left, right] = [right, left % right];
	}
	return left;
}

function invalid(note: string): RatioSimplification {
	return { simplifiedRatio: "", commonFactor: "", formula: "", note };
}

export function simplifyRatio(
	firstInput: string | number | undefined,
	secondInput: string | number | undefined,
): RatioSimplification {
	const first = parseTerm(firstInput);
	const second = parseTerm(secondInput);
	if (!first || !second)
		return invalid(
			"Enter non-negative whole numbers or decimals with up to 6 places.",
		);
	if (first.scaledValue === 0n && second.scaledValue === 0n)
		return invalid("Both terms cannot be 0.");

	const decimalPlaces = Math.max(first.decimalPlaces, second.decimalPlaces);
	const firstAligned =
		first.scaledValue * 10n ** BigInt(decimalPlaces - first.decimalPlaces);
	const secondAligned =
		second.scaledValue * 10n ** BigInt(decimalPlaces - second.decimalPlaces);
	const commonFactorScaled = greatestCommonDivisor(firstAligned, secondAligned);
	const firstReduced = firstAligned / commonFactorScaled;
	const secondReduced = secondAligned / commonFactorScaled;
	const commonFactor = formatScaled(commonFactorScaled, decimalPlaces);
	const simplifiedRatio = `${firstReduced}:${secondReduced}`;

	return {
		simplifiedRatio,
		commonFactor,
		formula: `${first.displayValue} ÷ ${commonFactor} : ${second.displayValue} ÷ ${commonFactor} = ${simplifiedRatio}.`,
		note: "Decimal terms are supported up to 6 places; both terms cannot be zero.",
	};
}
