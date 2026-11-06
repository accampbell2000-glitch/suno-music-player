import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

const boardFeet = calculatorsBySlug["board-feet"];
const soap = calculatorsBySlug.soap;
const aquarium = calculatorsBySlug["aquarium-volume"];
const sourdough = calculatorsBySlug.sourdough;
const firewood = calculatorsBySlug.firewood;

describe("board feet calculator", () => {
	test("calculates a piece and a matching-pieces total from the 144 cubic-inch definition", () => {
		expect(
			boardFeet.calculate({
				thickness: 1.5,
				width: 5.5,
				length: 8,
				lengthUnit: "ft",
				pieces: 10,
			}),
		).toMatchObject({ perPiece: 5.5, total: 55 });
	});
	test("calculates an optional cost and handles invalid dimensions", () => {
		expect(
			boardFeet.calculate({
				thickness: 1,
				width: 12,
				length: 12,
				lengthUnit: "in",
				pieces: 1,
				pricePerBoardFoot: 8,
			}).materialCost,
		).toBe(8);
		expect(
			boardFeet.calculate({ thickness: 0, width: 12, length: 12, pieces: 1 })
				.validation,
		).toContain("greater than zero");
		expect(
			boardFeet.calculate({ thickness: 1, width: 12, length: 12, pieces: 1.5 })
				.validation,
		).toContain("whole number");
	});
});

describe("soap calculator", () => {
	test("uses the selected NaOH SAP value, superfat, and concentration", () => {
		const result = soap.calculate({
			oils: [{ ingredient: "olive", amount: "1000", unit: "g" }],
			lyeType: "naoh",
			superfat: 5,
			waterMode: "concentration",
			lyeConcentration: 33,
		});
		expect(result).toMatchObject({
			totalOils: 1000,
			lye: 128.25,
			water: 260.39,
			concentration: 33,
			lyeKind: "NaOH (sodium hydroxide)",
		});
	});
	test("uses KOH SAP values and a water-to-lye ratio", () => {
		const result = soap.calculate({
			oils: [{ ingredient: "olive", amount: "1000", unit: "g" }],
			lyeType: "koh",
			superfat: 5,
			waterMode: "ratio",
			waterToLyeRatio: 2,
		});
		expect(result).toMatchObject({
			lye: 180.5,
			water: 361,
			concentration: 33.33,
			lyeKind: "KOH (potassium hydroxide)",
		});
	});
	test("does not calculate missing or incomplete oils and rejects non-positive weights", () => {
		expect(
			soap.calculate({
				oils: [{ ingredient: "", amount: "", unit: "g" }],
				lyeType: "naoh",
				superfat: 5,
				waterMode: "concentration",
				lyeConcentration: 33,
			}).validation,
		).toContain("at least one oil");
		expect(
			soap.calculate({
				oils: [{ ingredient: "olive", amount: "", unit: "g" }],
				lyeType: "naoh",
				superfat: 5,
				waterMode: "concentration",
				lyeConcentration: 33,
			}).validation,
		).toContain("Choose an oil and enter its weight");
		expect(
			soap.calculate({
				oils: [{ ingredient: "olive", amount: "-1", unit: "g" }],
				lyeType: "naoh",
				superfat: 5,
				waterMode: "concentration",
				lyeConcentration: 33,
			}).validation,
		).toContain("positive number");
	});
});

describe("aquarium volume calculator", () => {
	test("returns US gallons and liters for a rectangular tank", () => {
		const result = aquarium.calculate({
			length: 36,
			width: 18,
			height: 18,
			dimensionUnit: "in",
		});
		expect(result.gallons).toBe(50.49);
		expect(result.liters).toBe(191.14);
	});
	test("converts centimeter dimensions equivalently and rejects empty or zero dimensions", () => {
		const metric = aquarium.calculate({
			length: 91.44,
			width: 45.72,
			height: 45.72,
			dimensionUnit: "cm",
		});
		expect(metric.gallons).toBe(50.49);
		expect(
			aquarium.calculate({
				length: 0,
				width: 45,
				height: 45,
				dimensionUnit: "cm",
			}).validation,
		).toContain("greater than zero");
		expect(
			aquarium.calculate({ width: 45, height: 45, dimensionUnit: "cm" })
				.validation,
		).toContain("inside length");
	});
});

describe("sourdough calculator", () => {
	test("counts starter flour and water in total flour and hydration", () => {
		expect(
			sourdough.calculate({
				totalFlour: 500,
				hydration: 75,
				starterPercent: 20,
				starterHydration: 100,
				saltPercent: 2,
			}),
		).toMatchObject({
			flourToAdd: 450,
			starter: 100,
			starterBreakdown: "50 g flour + 50 g water",
			waterToAdd: 325,
			salt: 10,
			doughWeight: 885,
			hydrationResult: 75,
		});
	});
	test("rejects starter water above the requested total hydration and empty flour", () => {
		expect(
			sourdough.calculate({
				totalFlour: 500,
				hydration: 5,
				starterPercent: 20,
				starterHydration: 100,
				saltPercent: 2,
			}).validation,
		).toContain("more water than this target");
		expect(
			sourdough.calculate({
				totalFlour: 0,
				hydration: 75,
				starterPercent: 20,
				starterHydration: 100,
				saltPercent: 2,
			}).validation,
		).toContain("Flour must be positive");
	});
});

describe("firewood calculator", () => {
	test("converts stack volume to cubic feet and cords, with an optional cost", () => {
		expect(
			firewood.calculate({
				length: 16,
				width: 4,
				height: 4,
				dimensionUnit: "ft",
				pricePerCord: 250,
			}),
		).toMatchObject({ cubicFeet: 256, cords: 2, cost: 500 });
	});
	test("supports inches and rejects invalid stack measurements", () => {
		expect(
			firewood.calculate({
				length: 192,
				width: 48,
				height: 48,
				dimensionUnit: "in",
			}).cubicFeet,
		).toBe(256);
		expect(
			firewood.calculate({
				length: 0,
				width: 4,
				height: 4,
				dimensionUnit: "ft",
			}).validation,
		).toContain("greater than zero");
	});
});
