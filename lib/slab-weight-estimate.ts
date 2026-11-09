const CUBIC_INCHES_PER_CUBIC_FOOT = 1728;
const LB_PER_CUBIC_FOOT_PER_G_PER_CM3 = 62.4279605761;

// Rough midpoint assumptions from the cited material references on the slab calculator.
export const SLAB_DENSITY_G_PER_CM3 = {
	granite: 2.625,
	quartz: 2.3,
	porcelain: 2.415,
	"glazed-tile": 2.0,
} as const;

export type SlabWeightEstimate = {
	weightLb: number;
	densityGPerCm3: number;
};

function positiveNumber(value: unknown): number | null {
	if (typeof value !== "number" && typeof value !== "string") return null;
	if (typeof value === "string" && value.trim() === "") return null;
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : null;
}

export function estimateSlabWeight(
	values: Record<string, unknown>,
): SlabWeightEstimate | null {
	const material = String(values.material ?? "") as keyof typeof SLAB_DENSITY_G_PER_CM3;
	const densityGPerCm3 = SLAB_DENSITY_G_PER_CM3[material];
	if (!densityGPerCm3) return null;

	const lengthIn = positiveNumber(values.slabLengthIn);
	const widthIn = positiveNumber(values.slabWidthIn);
	const thicknessIn = positiveNumber(values.slabThicknessIn);
	if (lengthIn === null || widthIn === null || thicknessIn === null) return null;

	const volumeCuFt =
		(lengthIn * widthIn * thicknessIn) / CUBIC_INCHES_PER_CUBIC_FOOT;
	const weightLb =
		volumeCuFt * densityGPerCm3 * LB_PER_CUBIC_FOOT_PER_G_PER_CM3;
	if (!Number.isFinite(weightLb) || weightLb <= 0) return null;

	return { weightLb, densityGPerCm3 };
}
