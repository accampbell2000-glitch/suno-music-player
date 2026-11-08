import { describe, expect, test } from "bun:test";
import {
	compileFunctionExpression,
	sampleFunctionGraph,
} from "../lib/function-graph";
import { calculateSalesTax } from "../lib/sales-tax";

describe("function graph expression evaluator", () => {
	test("evaluates arithmetic, constants, functions, and degree angles", () => {
		expect(compileFunctionExpression("x^2 + 2*x + 1")(2)).toBe(9);
		expect(compileFunctionExpression("sin(pi/2)")(0)).toBe(1);
		expect(compileFunctionExpression("sin(90)", "degrees")(0)).toBe(1);
		expect(
			compileFunctionExpression("sqrt(abs(-9)) + log(100) + ln(e)")(0),
		).toBe(6);
		expect(compileFunctionExpression("-x^2")(3)).toBe(-9);
	});

	test("rejects invalid or unsupported expressions without evaluating code", () => {
		expect(() => compileFunctionExpression("sin(")).toThrow();
		expect(() => compileFunctionExpression("x + window.location")).toThrow();
		expect(() => compileFunctionExpression("2x")).toThrow(
			"operator between values",
		);
		expect(compileFunctionExpression("1/(x-x)")(2)).toBeNaN();
	});

	test("leaves a visible break at a division discontinuity and skips non-finite samples", () => {
		const plot = sampleFunctionGraph(
			compileFunctionExpression("1/(x-0.013)"),
			-2,
			2,
			801,
		);
		expect(plot.segments.length).toBeGreaterThanOrEqual(2);
		for (const segment of plot.segments) {
			for (const point of segment) {
				expect(Number.isFinite(point.x)).toBe(true);
				expect(Number.isFinite(point.y)).toBe(true);
			}
		}
		for (let index = 1; index < plot.segments.length; index++) {
			const previous = plot.segments[index - 1]?.at(-1);
			const next = plot.segments[index]?.[0];
			if (previous && next)
				expect(Math.abs(next.x - previous.x)).toBeGreaterThan(0);
		}
	});
});

describe("business sales tax calculations", () => {
	test("adds the entered rate to the pre-tax amount and rounds to cents", () => {
		expect(calculateSalesTax("100", "10", "add")).toEqual({
			preTaxAmount: 100,
			taxAmount: 10,
			total: 110,
			validation: "",
		});
		expect(calculateSalesTax("19.99", "7.25", "add")).toMatchObject({
			preTaxAmount: 19.99,
			taxAmount: 1.45,
			total: 21.44,
		});
	});

	test("extracts the tax portion from a tax-inclusive total", () => {
		expect(calculateSalesTax("110", "10", "extract")).toEqual({
			preTaxAmount: 100,
			taxAmount: 10,
			total: 110,
			validation: "",
		});
		expect(calculateSalesTax("21.44", "7.25", "extract")).toMatchObject({
			preTaxAmount: 19.99,
			taxAmount: 1.45,
			total: 21.44,
		});
	});

	test("requires non-negative finite input and a supported mode", () => {
		expect(calculateSalesTax("100", "", "add").validation).toBe(
			"Enter the rate you already have to see the tax breakdown.",
		);
		expect(calculateSalesTax("", "", "add").validation).toContain("Enter");
		expect(calculateSalesTax(-1, 5, "add").validation).toContain("Enter");
		expect(
			calculateSalesTax(10, Number.POSITIVE_INFINITY, "extract").validation,
		).toContain("Enter");
		expect(calculateSalesTax(10, 5, "multiply").validation).toContain("Choose");
	});
});
