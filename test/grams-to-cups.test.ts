import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

const gramsToCups = calculatorsBySlug["grams-to-cups"];
const cupsToGrams = calculatorsBySlug["cups-to-grams"];

const addedIngredientWeights = [
	{ id: "almond-butter", grams: 68, cups: 0.25 },
	{ id: "baking-powder", grams: 4, cups: 1 / 48 },
	{ id: "baking-soda", grams: 3, cups: 1 / 96 },
	{ id: "banana-mashed", grams: 227, cups: 1 },
	{ id: "breadcrumbs-dried", grams: 28, cups: 0.25 },
	{ id: "breadcrumbs-fresh", grams: 21, cups: 0.25 },
	{ id: "brown-rice-flour", grams: 128, cups: 1 },
	{ id: "buckwheat-flour", grams: 120, cups: 1 },
	{ id: "cake-flour", grams: 120, cups: 1 },
	{ id: "chickpea-flour", grams: 85, cups: 1 },
	{ id: "chia-seeds", grams: 37, cups: 0.25 },
	{ id: "coconut-sweetened-shredded", grams: 85, cups: 1 },
	{ id: "coconut-unsweetened-shredded", grams: 53, cups: 1 },
	{ id: "coconut-oil", grams: 113, cups: 0.5 },
	{ id: "coconut-sugar", grams: 77, cups: 0.5 },
	{ id: "cranberries-dried", grams: 57, cups: 0.5 },
	{ id: "cream-heavy-light-half-and-half", grams: 227, cups: 1 },
	{ id: "oat-flour", grams: 92, cups: 1 },
	{ id: "pumpkin-puree", grams: 227, cups: 1 },
	{ id: "semolina-flour", grams: 163, cups: 1 },
	{ id: "sweetened-condensed-milk", grams: 78, cups: 0.25 },
	{ id: "tahini", grams: 128, cups: 0.5 },
];

describe("ingredient grams-to-cups calculator", () => {
	test("converts the chart weight for a cup of all-purpose flour", () => {
		expect(
			gramsToCups.calculate({ amount: 120, ingredient: "all-purpose-flour" }),
		).toMatchObject({ volumeText: "1 US cup", gramsPerCup: 120 });
	});

	test("uses the selected ingredient's reference weight", () => {
		expect(
			gramsToCups.calculate({ amount: 213, ingredient: "brown-sugar-packed" }),
		).toMatchObject({ volumeText: "1 US cup", gramsPerCup: 213 });
		expect(
			gramsToCups.calculate({ amount: 226, ingredient: "butter" }),
		).toMatchObject({ volumeText: "1 US cup", gramsPerCup: 226 });
	});

	test("converts smaller ingredient amounts and rounds to three decimal places", () => {
		expect(
			gramsToCups.calculate({ amount: 42, ingredient: "honey" }),
		).toMatchObject({ volumeText: "0.125 US cups", gramsPerCup: 336 });
	});

	test("uses all new chart entries in both conversion directions", () => {
		for (const ingredient of addedIngredientWeights) {
			const cupsResult = cupsToGrams.calculate({
				amount: ingredient.cups,
				volumeUnit: "cup",
				ingredient: ingredient.id,
			});
			expect(cupsResult.grams).toBe(ingredient.grams);

			const roundedCups = Math.round(ingredient.cups * 1000) / 1000;
			const expectedVolume =
				roundedCups === 1 ? "1 US cup" : `${roundedCups} US cups`;
			expect(
				gramsToCups.calculate({
					amount: ingredient.grams,
					ingredient: ingredient.id,
				}).volumeText,
			).toBe(expectedVolume);
		}
	});

	test("returns zero volume for zero or negative input", () => {
		expect(
			gramsToCups.calculate({ amount: 0, ingredient: "all-purpose-flour" })
				.volumeText,
		).toBe("0 US cups");
		expect(
			gramsToCups.calculate({ amount: -10, ingredient: "all-purpose-flour" })
				.volumeText,
		).toBe("0 US cups");
	});
});
