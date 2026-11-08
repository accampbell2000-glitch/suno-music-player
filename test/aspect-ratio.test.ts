import { describe, expect, test } from "bun:test";
import { calculateAspectRatio } from "../lib/aspect-ratio";

describe("aspect ratio and image scaling", () => {
	test("reduces pixel dimensions to a simplified ratio", () => {
		expect(calculateAspectRatio(1920, 1080, "ratio")).toEqual({
			aspectRatio: "16:9",
			decimalRatio: "1.7778:1",
			outputWidth: "",
			outputHeight: "",
			scalePercent: "",
			validation: "",
		});
	});

	test("scales to a target width and keeps the original ratio", () => {
		expect(calculateAspectRatio(1920, 1080, "resize-width", 1280)).toMatchObject({
			aspectRatio: "16:9",
			outputWidth: 1280,
			outputHeight: 720,
			scalePercent: 66.67,
			validation: "",
		});
	});

	test("scales to a target height and keeps the original ratio", () => {
		expect(calculateAspectRatio(1920, 1080, "resize-height", undefined, 720)).toMatchObject({
			aspectRatio: "16:9",
			outputWidth: 1280,
			outputHeight: 720,
			scalePercent: 66.67,
			validation: "",
		});
	});

	test("rounds a calculated pixel dimension to the nearest whole pixel", () => {
		expect(calculateAspectRatio(4, 3, "resize-width", 5).outputHeight).toBe(4);
	});

	test("rejects invalid source and target dimensions without inventing results", () => {
		expect(calculateAspectRatio(0, 1080, "ratio").validation).toContain("source dimensions");
		expect(calculateAspectRatio(100.5, 80, "ratio").validation).toContain("whole-pixel");
		expect(calculateAspectRatio(100, 80, "resize-width", 0).validation).toContain("target width");
		expect(calculateAspectRatio(1, 2, "resize-width", 1_000_000).validation).toContain("exceeds");
		expect(calculateAspectRatio(100, 1, "resize-width", 1).validation).toContain("below 1 pixel");
	});
});
