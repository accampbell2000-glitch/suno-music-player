export type AspectRatioCalculation = {
	aspectRatio: string;
	decimalRatio: string;
	outputWidth: string | number;
	outputHeight: string | number;
	scalePercent: string | number;
	validation: string;
};

type DimensionInput = string | number | undefined;

const MAX_PIXEL_DIMENSION = 1_000_000;

function readDimension(value: DimensionInput): number | null {
	const number =
		typeof value === "number"
			? value
			: typeof value === "string" && value.trim() !== ""
				? Number(value)
				: Number.NaN;
	return Number.isSafeInteger(number) && number >= 1 && number <= MAX_PIXEL_DIMENSION
		? number
		: null;
}

function greatestCommonDivisor(left: number, right: number): number {
	while (right !== 0) {
		const remainder = left % right;
		left = right;
		right = remainder;
	}
	return left;
}

function emptyOutput(
	validation: string,
	aspectRatio = "",
	decimalRatio = "",
): AspectRatioCalculation {
	return { aspectRatio, decimalRatio, outputWidth: "", outputHeight: "", scalePercent: "", validation };
}

export function calculateAspectRatio(
	sourceWidthInput: DimensionInput,
	sourceHeightInput: DimensionInput,
	mode: string,
	targetWidthInput?: DimensionInput,
	targetHeightInput?: DimensionInput,
): AspectRatioCalculation {
	if (mode !== "ratio" && mode !== "resize-width" && mode !== "resize-height")
		return emptyOutput("Choose a calculation mode.");

	const sourceWidth = readDimension(sourceWidthInput);
	const sourceHeight = readDimension(sourceHeightInput);
	if (sourceWidth === null || sourceHeight === null)
		return emptyOutput("Enter whole-pixel source dimensions from 1 to 1,000,000.");

	const divisor = greatestCommonDivisor(sourceWidth, sourceHeight);
	const aspectRatio = `${sourceWidth / divisor}:${sourceHeight / divisor}`;
	const decimal = Number((sourceWidth / sourceHeight).toPrecision(5)).toString();
	const decimalRatio = `${decimal}:1`;
	const base = emptyOutput("", aspectRatio, decimalRatio);
	if (mode === "ratio") return base;

	const isWidthMode = mode === "resize-width";
	const targetDimension = readDimension(isWidthMode ? targetWidthInput : targetHeightInput);
	if (targetDimension === null)
		return {
			...base,
			validation: `Enter a whole-pixel target ${isWidthMode ? "width" : "height"} from 1 to 1,000,000.`,
		};

	const scale = isWidthMode ? targetDimension / sourceWidth : targetDimension / sourceHeight;
	const outputWidth = isWidthMode ? targetDimension : Math.round(sourceWidth * scale);
	const outputHeight = isWidthMode ? Math.round(sourceHeight * scale) : targetDimension;
	const calculatedDimension = isWidthMode ? outputHeight : outputWidth;
	if (calculatedDimension < 1)
		return {
			...base,
			validation: "The calculated side rounds below 1 pixel. Use a larger target dimension.",
		};
	if (calculatedDimension > MAX_PIXEL_DIMENSION)
		return {
			...base,
			validation: "The scaled dimension exceeds 1,000,000 pixels. Use a smaller target dimension.",
		};

	return {
		...base,
		outputWidth,
		outputHeight,
		scalePercent: Number((scale * 100).toFixed(2)),
	};
}
