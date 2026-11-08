import { describe, expect, test } from "bun:test";
import { calculateSalePrice } from "../lib/sale-price";

describe("sale price calculator", () => {
	test("shows the savings and discounted price", () => {
		expect(calculateSalePrice(80, 25)).toMatchObject({
			discountAmount: 20,
			salePrice: 60,
			formula: "$80.00 × 25% = $20.00 off; $80.00 - $20.00 = $60.00 sale price.",
			validation: "Before sales tax. One percentage discount is applied.",
		});
	});

	test("handles no discount and a full discount", () => {
		expect(calculateSalePrice(42.5, 0)).toMatchObject({
			discountAmount: 0,
			salePrice: 42.5,
		});
		expect(calculateSalePrice(42.5, 100)).toMatchObject({
			discountAmount: 42.5,
			salePrice: 0,
		});
	});

	test("rounds the discount to cents before finding the sale price", () => {
		expect(calculateSalePrice(19.99, 15)).toMatchObject({
			discountAmount: 3,
			salePrice: 16.99,
		});
	});

	test("rejects negative prices and discount rates outside zero to one hundred", () => {
		expect(calculateSalePrice(-1, 25).validation).toContain("original price");
		expect(calculateSalePrice(80, -1).validation).toContain("0% to 100%");
		expect(calculateSalePrice(80, 101).validation).toContain("0% to 100%");
	});
});
