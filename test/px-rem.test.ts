import { describe, expect, test } from "bun:test";
import { calculatePxRem } from "../lib/px-rem";

describe("pixels and REM converter", () => {
	test("converts pixels to REM using a 16px root size", () => {
		expect(calculatePxRem("px-to-rem", 24, 16)).toEqual({
			cssValue: "1.5rem",
			formula: "24px ÷ 16px = 1.5rem.",
			note: "REM output is rounded to 4 decimal places.",
		});
	});

	test("converts REM to pixels using a 16px root size", () => {
		expect(calculatePxRem("rem-to-px", 1.5, 16)).toEqual({
			cssValue: "24px",
			formula: "1.5rem × 16px = 24px.",
			note: "Pixel output is rounded to 2 decimal places.",
		});
	});

	test("uses a custom root font size in both directions", () => {
		expect(calculatePxRem("px-to-rem", 15, 10).cssValue).toBe("1.5rem");
		expect(calculatePxRem("rem-to-px", 1.5, 10).cssValue).toBe("15px");
	});

	test("rounds REM to four decimals and pixels to two decimals", () => {
		expect(calculatePxRem("px-to-rem", 1, 14).cssValue).toBe("0.0714rem");
		expect(calculatePxRem("rem-to-px", 0.1, 16).cssValue).toBe("1.6px");
	});

	test("supports zero and negative CSS lengths while rejecting invalid root sizes", () => {
		expect(calculatePxRem("px-to-rem", 0, 16).cssValue).toBe("0rem");
		expect(calculatePxRem("px-to-rem", -8, 16).cssValue).toBe("-0.5rem");
		expect(calculatePxRem("px-to-rem", 24, 0).note).toContain("greater than 0px");
	});
});
