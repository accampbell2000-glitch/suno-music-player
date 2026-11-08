import { describe, expect, test } from "bun:test";
import { calculateBusinessDays } from "../lib/business-days";

describe("business days calculator", () => {
	test("counts weekdays and weekends across a full week", () => {
		expect(calculateBusinessDays("2026-03-02", "2026-03-09")).toMatchObject({
			businessDays: 5,
			calendarDays: 7,
			weekendDays: 2,
			validation: "",
		});
	});

	test("counts the Monday after a Friday and excludes the Saturday and Sunday", () => {
		expect(calculateBusinessDays("2026-11-06", "2026-11-09")).toMatchObject({
			businessDays: 1,
			calendarDays: 3,
			weekendDays: 2,
			validation: "",
		});
	});

	test("returns the same absolute count when dates are reversed", () => {
		expect(calculateBusinessDays("2026-11-09", "2026-11-06")).toMatchObject({
			businessDays: 1,
			calendarDays: 3,
			weekendDays: 2,
			validation: "",
		});
	});

	test("returns zero for the same date and counts leap day correctly", () => {
		expect(calculateBusinessDays("2026-11-09", "2026-11-09").businessDays).toBe(0);
		expect(calculateBusinessDays("2024-02-28", "2024-03-01")).toMatchObject({
			businessDays: 2,
			calendarDays: 2,
			weekendDays: 0,
			validation: "",
		});
	});

	test("rejects missing and impossible dates", () => {
		expect(calculateBusinessDays("", "2026-11-09").validation).toContain("Enter both dates");
		expect(calculateBusinessDays("2026-02-29", "2026-03-02").validation).toContain("YYYY-MM-DD");
	});
});
