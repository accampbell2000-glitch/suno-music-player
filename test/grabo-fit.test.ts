import { describe, expect, test } from "bun:test";
import { getGraboAffiliateClickUrl } from "../config/affiliate-links";
import {
	calculatorsBySlug,
	type CalculatorValues,
} from "../lib/calculator-definitions";
import { getGraboFitDecision } from "../lib/grabo-fit";
import { estimateSlabWeight } from "../lib/slab-weight-estimate";

describe("weight-band GRABO calculator placements", () => {
	test("uses HighFlow through its 242 lb rating on either calculator", () => {
		const paver = getGraboFitDecision("patio-pavers", {
			weightPerPaver: 242,
			paverSurface: "smooth",
		});
		const slab = getGraboFitDecision("stone-slabs", {
			weightPerSlab: 242,
			material: "granite",
			surfaceCondition: "smooth-clean",
		});
		for (const decision of [paver, slab]) {
			expect(decision.status).toBe("match");
			expect(decision.weightBasis).toBe("supplier-listed");
			expect(decision.modelCode).toBe("GHF-V1");
			expect(decision.ratingLb).toBe(242);
			expect(decision.sealNote).toBe("");
		}
	});

	test("uses Pro Brushless from above 242 through its 375 lb rating on either calculator", () => {
		const paver = getGraboFitDecision("patio-pavers", {
			weightPerPaver: 300,
			paverSurface: "smooth",
		});
		const slab = getGraboFitDecision("stone-slabs", {
			weightPerSlab: 375,
			material: "granite",
			surfaceCondition: "smooth-clean",
		});
		for (const decision of [paver, slab]) {
			expect(decision.status).toBe("match");
			expect(decision.modelCode).toBe("GPB-FB-FS");
			expect(decision.ratingLb).toBe(375);
			expect(decision.sealNote).toBe("");
		}
	});

	test("shows the HighFlow seal warning on textured faces in either calculator", () => {
		const paver = getGraboFitDecision("patio-pavers", {
			weightPerPaver: 180,
			paverSurface: "textured",
		});
		const slab = getGraboFitDecision("stone-slabs", {
			weightPerSlab: 180,
			material: "quartz",
			surfaceCondition: "slightly-textured",
		});
		for (const decision of [paver, slab]) {
			expect(decision.modelCode).toBe("GHF-V1");
			expect(decision.sealNote).toBe(
				"Do not lift without Smart Cut Foam Seal 400 (FS400-SC).",
			);
		}
	});

	test("shows the Pro Brushless seal warning for textured faces in either calculator", () => {
		const paver = getGraboFitDecision("patio-pavers", {
			weightPerPaver: 300,
			paverSurface: "textured",
		});
		const slab = getGraboFitDecision("stone-slabs", {
			weightPerSlab: 300,
			material: "porcelain",
			surfaceCondition: "slightly-textured",
		});
		for (const decision of [paver, slab]) {
			expect(decision.modelCode).toBe("GPB-FB-FS");
			expect(decision.sealNote).toBe(
				"Do not lift without Pro Brushless Foam Rubber Seal (GPB-FRS).",
			);
		}
	});

	test("estimates weight from dimensions using the selected material density", () => {
		const estimate = estimateSlabWeight({
			material: "granite",
			slabLengthIn: 12,
			slabWidthIn: 12,
			slabThicknessIn: 1,
		});
		expect(estimate).not.toBeNull();
		expect(estimate?.weightLb).toBeCloseTo(13.66, 2);
		expect(estimate?.densityGPerCm3).toBe(2.625);
		expect(
			estimateSlabWeight({
				material: "other",
				slabLengthIn: 12,
				slabWidthIn: 12,
				slabThicknessIn: 1,
			}),
		).toBeNull();
		expect(
			estimateSlabWeight({
				material: "granite",
				slabLengthIn: 12,
				slabWidthIn: 12,
			}),
		).toBeNull();
	});

	test("uses the dimension estimate for the slab fit check when no supplier weight is entered", () => {
		const result = calculatorsBySlug["stone-slabs"].calculate({
			material: "granite",
			slabLengthIn: 72,
			slabWidthIn: 36,
			slabThicknessIn: 1.25,
		});
		const decision = getGraboFitDecision("stone-slabs", {
			material: "granite",
			slabLengthIn: 72,
			slabWidthIn: 36,
			slabThicknessIn: 1.25,
			surfaceCondition: "slightly-textured",
		});
		expect(result.estimatedWeight).toBe(307.3);
		expect(decision.status).toBe("match");
		expect(decision.weightBasis).toBe("estimated");
		expect(decision.modelCode).toBe("GPB-FB-FS");
		expect(decision.sealNote).toBe(
			"Do not lift without Pro Brushless Foam Rubber Seal (GPB-FRS).",
		);
	});

	test("uses the supplier-listed slab weight instead of the dimension estimate", () => {
		const values = {
			material: "granite",
			slabLengthIn: 72,
			slabWidthIn: 36,
			slabThicknessIn: 1.25,
			weightPerSlab: 180,
			surfaceCondition: "smooth-clean",
		};
		const result = calculatorsBySlug["stone-slabs"].calculate(values);
		const decision = getGraboFitDecision("stone-slabs", values);
		expect(result.estimatedWeight).toBe(307.3);
		expect(result.weightPerSlab).toBe(180);
		expect(decision.status).toBe("match");
		expect(decision.weightBasis).toBe("supplier-listed");
		expect(decision.modelCode).toBe("GHF-V1");
	});

	test("uses only the tracked affiliate link for the selected model", () => {
		expect(getGraboAffiliateClickUrl("GHF-V1")).toBe(
			"https://www.jdoqocy.com/click-101888675-17343710",
		);
		expect(getGraboAffiliateClickUrl("GPB-FB-FS")).toBe(
			"https://www.tkqlhce.com/click-101888675-17343708",
		);
		expect(getGraboAffiliateClickUrl(undefined)).toBeNull();
	});

	test("shows no model above 375 lb and keeps the slab material list", () => {
		expect(
			getGraboFitDecision("patio-pavers", {
				weightPerPaver: 376,
				paverSurface: "smooth",
			}).status,
		).toBe("no-match");
		expect(
			getGraboFitDecision("stone-slabs", {
				weightPerSlab: 300,
				material: "other",
				surfaceCondition: "smooth-clean",
			}).status,
		).toBe("no-match");
	});

	test("treats an empty supplier weight as not entered for slabs", () => {
		// 36 x 24 x 1.5 in of granite estimates to about 122.9 lb.
		const decision = getGraboFitDecision("stone-slabs", {
			material: "granite",
			slabLengthIn: 36,
			slabWidthIn: 24,
			slabThicknessIn: 1.5,
			weightPerSlab: "",
			surfaceCondition: "slightly-textured",
		});
		expect(decision.status).toBe("match");
		expect(decision.weightBasis).toBe("estimated");
		expect(decision.modelCode).toBe("GHF-V1");
		expect(decision.sealNote).toBe(
			"Do not lift without Smart Cut Foam Seal 400 (FS400-SC).",
		);
	});

	test("still rejects an explicit zero or negative weight", () => {
		for (const weightPerSlab of [0, -5]) {
			const decision = getGraboFitDecision("stone-slabs", {
				material: "granite",
				slabLengthIn: 36,
				slabWidthIn: 24,
				slabThicknessIn: 1.5,
				weightPerSlab,
				surfaceCondition: "slightly-textured",
			});
			expect(decision.status).toBe("no-match");
			expect(decision.message).toContain(
				"Enter a valid supplier-listed weight greater than zero.",
			);
		}
		const paver = getGraboFitDecision("patio-pavers", {
			weightPerPaver: 0,
			paverSurface: "rough",
		});
		expect(paver.status).toBe("no-match");
		expect(paver.message).toContain(
			"Enter a valid supplier-listed weight greater than zero.",
		);
	});

	test("suppresses the model for rough or porous faces above 242 lb", () => {
		for (const weight of [242.5, 243, 375]) {
			const slab = getGraboFitDecision("stone-slabs", {
				weightPerSlab: weight,
				material: "porcelain",
				surfaceCondition: "rough-porous",
			});
			expect(slab.status).toBe("no-match");
			expect(slab.modelCode).toBeUndefined();
			expect(slab.message).toContain("No GRABO model is recommended");
		}
		for (const paverSurface of ["rough", "porous"]) {
			const paver = getGraboFitDecision("patio-pavers", {
				weightPerPaver: 243,
				paverSurface,
			});
			expect(paver.status).toBe("no-match");
			expect(paver.modelCode).toBeUndefined();
		}
		// Estimate-driven slabs above 242 lb are suppressed too.
		const estimated = getGraboFitDecision("stone-slabs", {
			material: "granite",
			slabLengthIn: 72,
			slabWidthIn: 36,
			slabThicknessIn: 1.25,
			surfaceCondition: "rough-porous",
		});
		expect(estimated.status).toBe("no-match");
		// At exactly 242 lb and on textured faces, the routing is unchanged.
		const atCap = getGraboFitDecision("stone-slabs", {
			weightPerSlab: 242,
			material: "porcelain",
			surfaceCondition: "rough-porous",
		});
		expect(atCap.status).toBe("match");
		expect(atCap.modelCode).toBe("GHF-V1");
		const textured = getGraboFitDecision("stone-slabs", {
			weightPerSlab: 300,
			material: "porcelain",
			surfaceCondition: "slightly-textured",
		});
		expect(textured.status).toBe("match");
		expect(textured.modelCode).toBe("GPB-FB-FS");
		expect(textured.sealNote).toBe(
			"Do not lift without Pro Brushless Foam Rubber Seal (GPB-FRS).",
		);
	});

	test("shows the HighFlow banner on the default pavers page", () => {
		const cases: CalculatorValues[] = [{}];
		for (const values of cases) {
			const decision = getGraboFitDecision("patio-pavers", values);
			expect(decision.status).toBe("match");
			expect(decision.modelCode).toBe("GHF-V1");
			expect(decision.ratingLb).toBe(242);
			expect(decision.sealNote).toBe("");
			expect(decision.weightBasis).toBe("default");
			expect(decision.message).toContain("No paver weight entered yet");
		}
	});

	test("uses surface dropdowns instead of seal checkboxes", () => {
		for (const slug of ["patio-pavers", "stone-slabs"]) {
			const definition = calculatorsBySlug[slug];
			expect(definition.fields.some((field) => field.type === "checkbox")).toBe(false);
		}
	});
});
