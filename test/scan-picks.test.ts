import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

describe("car idle runtime calculator", () => {
	const calc = calculatorsBySlug["car-idle-runtime"];

	test("divides fuel on board by the engine-class idle rate", () => {
		const result = calc.calculate({
			tankSizeGal: 14,
			fuelPercent: 100,
			engineType: "v6",
			cabinDraw: "off",
			gasPrice: 3.3,
		});
		// 14 gal at 0.3 gal/hr = 46.67 hours; $0.99 an hour; 5 nights of 8-hour heat.
		expect(result.idleHours).toBe(46.7);
		expect(result.costPerHour).toBe(0.99);
		expect(result.heatNights).toBe(5);
		expect(result.fuelLeftCost).toBe(46.2);
	});

	test("adds the AC/heat bump and scales fuel by percentage", () => {
		const result = calc.calculate({
			tankSizeGal: 10,
			fuelPercent: 50,
			engineType: "v8",
			cabinDraw: "on",
			gasPrice: 4,
		});
		// 5 gal at 0.5 + 0.1 = 0.6 gal/hr = 8.33 hours.
		expect(result.idleHours).toBe(8.3);
		expect(result.costPerHour).toBe(2.4);
		expect(result.heatNights).toBe(1);
	});

	test("returns zero hours when the tank is empty", () => {
		const result = calc.calculate({
			tankSizeGal: 14,
			fuelPercent: 0,
			engineType: "diesel",
			cabinDraw: "off",
			gasPrice: 3.5,
		});
		expect(result.idleHours).toBe(0);
		expect(result.heatNights).toBe(0);
		expect(result.fuelLeftCost).toBe(0);
	});
});

describe("chicken coop bedding calculator", () => {
	const calc = calculatorsBySlug["chicken-coop-bedding"];

	test("converts floor area and depth into packs and yearly cost", () => {
		const result = calc.calculate({
			coopLengthFt: 8,
			coopWidthFt: 6,
			depthIn: 5,
			baleExpandedCuFt: 8,
			balePrice: 18,
			bagExpandedCuFt: 6,
			bagPrice: 10,
			fillsPerYear: 2,
		});
		// 8 x 6 ft at 5 in = 20 cu ft. 3 bales, 4 bags. $108 vs $80 a year.
		expect(result.beddingCuFt).toBe(20);
		expect(result.balesNeeded).toBe(3);
		expect(result.bagsNeeded).toBe(4);
		expect(result.baleYearCost).toBe(108);
		expect(result.bagYearCost).toBe(80);
		expect(result.cheaperOption).toBe("Pet-store bags");
	});

	test("rounds packs up and picks bales when they win", () => {
		const result = calc.calculate({
			coopLengthFt: 10,
			coopWidthFt: 8,
			depthIn: 6,
			baleExpandedCuFt: 8,
			balePrice: 12,
			bagExpandedCuFt: 6,
			bagPrice: 10,
			fillsPerYear: 2,
		});
		// 40 cu ft: 5 bales at $12 vs 7 bags at $10 -> $120 vs $140 a year.
		expect(result.balesNeeded).toBe(5);
		expect(result.bagsNeeded).toBe(7);
		expect(result.cheaperOption).toBe("Compressed farm bales");
	});

	test("zeros out with no floor area and asks for fills for the yearly comparison", () => {
		const result = calc.calculate({
			coopLengthFt: 0,
			coopWidthFt: 6,
			depthIn: 5,
			baleExpandedCuFt: 8,
			balePrice: 18,
			bagExpandedCuFt: 6,
			bagPrice: 10,
			fillsPerYear: 0,
		});
		expect(result.beddingCuFt).toBe(0);
		expect(result.balesNeeded).toBe(0);
		expect(result.bagsNeeded).toBe(0);
		expect(result.cheaperOption).toContain("Enter fresh fills per year");
	});
});
