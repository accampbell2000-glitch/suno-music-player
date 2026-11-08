import { describe, expect, test } from "bun:test";
import { simplifyRatio } from "../lib/ratio-simplifier";

describe("ratio simplifier", () => {
	test("reduces whole-number ratios and shows the common factor", () => {
		expect(simplifyRatio(12, 18)).toEqual({
			simplifiedRatio: "2:3",
			commonFactor: "6",
			formula: "12 ÷ 6 : 18 ÷ 6 = 2:3.",
			note: "Decimal terms are supported up to 6 places; both terms cannot be zero.",
		});
	});

	test("simplifies decimal ratios exactly", () => {
		expect(simplifyRatio("1.5", "2.5")).toMatchObject({
			simplifiedRatio: "3:5",
			commonFactor: "0.5",
			formula: "1.5 ÷ 0.5 : 2.5 ÷ 0.5 = 3:5.",
		});
		expect(simplifyRatio("1.5", "2.25").simplifiedRatio).toBe("2:3");
	});

	test("reduces ratios when one term is zero", () => {
		expect(simplifyRatio(0, 5).simplifiedRatio).toBe("0:1");
		expect(simplifyRatio(5, 0).simplifiedRatio).toBe("1:0");
	});

	test("handles matching terms and decimals up to six places", () => {
		expect(simplifyRatio("0.000001", "0.000002").simplifiedRatio).toBe("1:2");
		expect(simplifyRatio("1.25", "1.25").simplifiedRatio).toBe("1:1");
	});

	test("rejects two zeros, negative terms, and more than six decimal places", () => {
		expect(simplifyRatio(0, 0).note).toBe("Both terms cannot be 0.");
		expect(simplifyRatio(-1, 2).note).toContain("non-negative");
		expect(simplifyRatio("1.0000001", 2).note).toContain("up to 6 places");
		expect(simplifyRatio("", 2).note).toContain("up to 6 places");
	});
});
