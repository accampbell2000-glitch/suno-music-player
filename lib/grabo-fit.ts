import type { CalculatorValues } from "./calculator-definitions";
import { estimateSlabWeight } from "./slab-weight-estimate";

export type GraboFitDecision = {
	status: "prompt" | "no-match" | "match";
	message: string;
	modelName?: string;
	modelCode?: string;
	ratingLb?: number;
	sealNote?: string;
	weightBasis?: "supplier-listed" | "estimated" | "default";
};

type GraboModel = {
	modelName: string;
	modelCode: string;
	ratingLb: number;
};

const highFlow: GraboModel = {
	modelName: "GRABO HighFlow Cordless Suction Gripster",
	modelCode: "GHF-V1",
	ratingLb: 242,
};

const proBrushless: GraboModel = {
	modelName: "GRABO Pro Brushless Cordless Suction Gripster",
	modelCode: "GPB-FB-FS",
	ratingLb: 375,
};

const textValue = (values: CalculatorValues, key: string) =>
	typeof values[key] === "string" ? String(values[key]).trim() : "";

const enteredWeight = (values: CalculatorValues, key: string) => {
	const raw = values[key];
	if (raw === undefined || raw === null || raw === "") return null;
	const weight = Number(raw);
	return Number.isFinite(weight) && weight > 0 ? weight : Number.NaN;
};

const noMatch = (message: string): GraboFitDecision => ({
	status: "no-match",
	message,
});

const modelForWeight = (weight: number): GraboModel | null => {
	if (weight <= highFlow.ratingLb) return highFlow;
	if (weight <= proBrushless.ratingLb) return proBrushless;
	return null;
};

const requiredSeal = (model: GraboModel, surface: string, isPaver: boolean) => {
	if (surface === "smooth" || surface === "smooth-clean") return "";
	if (isPaver && surface === "porous" && model.modelCode === highFlow.modelCode)
		return "";
	return model.modelCode === highFlow.modelCode
		? "Do not lift without Smart Cut Foam Seal 400 (FS400-SC)."
		: "Do not lift without Pro Brushless Foam Rubber Seal (GPB-FRS).";
};

const recommendByWeight = (
	model: GraboModel,
	weight: number,
	surface: string,
	isPaver: boolean,
	weightBasis: "supplier-listed" | "estimated" | "default",
): GraboFitDecision => ({
	status: "match",
	message: `The fit check selects this model using the ${weightBasis === "estimated" ? "estimated slab weight" : "supplier-listed weight"} of ${weight.toFixed(1)} lb. Confirm actual weight and surface compatibility with GRABO's current instructions.`,
	modelName: model.modelName,
	modelCode: model.modelCode,
	ratingLb: model.ratingLb,
	sealNote: requiredSeal(model, surface, isPaver),
	weightBasis,
});

export function getGraboFitDecision(
	slug: string,
	values: CalculatorValues,
): GraboFitDecision {
	if (slug === "patio-pavers") {
		const weight = enteredWeight(values, "weightPerPaver");
		if (weight === null)
			// Keep the HighFlow banner on the page from the start; GRABO's
			// guidance names it as the pick for pavers.
			return {
				status: "match",
				message: `No paver weight entered yet; the HighFlow is GRABO's pick for pavers. Enter the supplier-listed weight per paver and its face condition to confirm.`,
				modelName: highFlow.modelName,
				modelCode: highFlow.modelCode,
				ratingLb: highFlow.ratingLb,
				sealNote: "",
				weightBasis: "default",
			};
		if (!Number.isFinite(weight))
			return noMatch("Enter a valid supplier-listed weight greater than zero.");

		const surface = textValue(values, "paverSurface");
		if (!surface || surface === "unknown")
			return noMatch(
				"Choose a listed face condition before GRABO can recommend a model.",
			);
		if (!["porous", "textured", "rough", "air-leaking", "smooth"].includes(surface))
			return noMatch(
				"Choose a listed face condition before GRABO can recommend a model.",
			);
		if (
			weight > highFlow.ratingLb &&
			(surface === "rough" || surface === "porous")
		)
			return noMatch(
				"No GRABO model is recommended for a rough or porous face above 242 lb. The Pro Brushless is listed for smooth, clean, non-porous stone. Check with GRABO and your supplier before lifting.",
			);

		const model = modelForWeight(weight);
		if (!model)
			return noMatch(
				"No GRABO model is listed above 375 lb. Check with GRABO and your supplier before lifting.",
			);
		return recommendByWeight(model, weight, surface, true, "supplier-listed");
	}

	if (slug === "stone-slabs") {
		const material = textValue(values, "material");
		if (!material)
			return noMatch("Choose a listed material before GRABO can recommend a model.");
		if (!["granite", "quartz", "porcelain", "glazed-tile"].includes(material))
			return noMatch(
				"GRABO's partner guidance lists granite, quartz, porcelain, and glazed tile. Other materials are not matched.",
			);

		const supplierWeight = enteredWeight(values, "weightPerSlab");
		if (supplierWeight !== null && !Number.isFinite(supplierWeight))
			return noMatch("Enter a valid supplier-listed weight greater than zero.");
		const estimate = supplierWeight === null ? estimateSlabWeight(values) : null;
		const weight = supplierWeight ?? estimate?.weightLb ?? null;
		if (weight === null)
			return {
				status: "prompt",
				message:
					"Enter a supplier-listed weight or choose a material and enter all three dimensions for an estimate, then choose the face condition.",
			};

		const surface = textValue(values, "surfaceCondition");
		if (!surface || surface === "unknown")
			return noMatch(
				"Choose a listed face condition before GRABO can recommend a model.",
			);
		if (!["smooth-clean", "slightly-textured", "rough-porous"].includes(surface))
			return noMatch(
				"Choose a listed face condition before GRABO can recommend a model.",
			);
		if (weight > highFlow.ratingLb && surface === "rough-porous")
			return noMatch(
				"No GRABO model is recommended for a rough or porous face above 242 lb. The Pro Brushless is listed for smooth, clean, non-porous stone. Check with GRABO and your supplier before lifting.",
			);

		const model = modelForWeight(weight);
		if (!model)
			return noMatch(
				"No GRABO model is listed above 375 lb. Check with GRABO and your supplier before lifting.",
			);
		return recommendByWeight(
			model,
			weight,
			surface,
			false,
			supplierWeight === null ? "estimated" : "supplier-listed",
		);
	}

	return noMatch("No GRABO fit check is available for this calculator.");
}
