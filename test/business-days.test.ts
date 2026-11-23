import { describe, expect, test } from "bun:test";
import {
	calculateBusinessDays,
	calculateBusinessDaysFrom,
} from "../lib/business-days";

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

	test("adds business days across weekends", () => {
		expect(calculateBusinessDaysFrom("2026-03-06", "add", "10")).toMatchObject({
			businessDays: 10,
			calendarDays: 14,
			weekendDays: 4,
			resultDate: "2026-03-20",
			weekday: "Friday",
			validation: "",
		});
	});

	test("Friday plus one business day lands on Monday", () => {
		expect(calculateBusinessDaysFrom("2026-11-20", "add", "1")).toMatchObject({
			resultDate: "2026-11-23",
			weekday: "Monday",
			calendarDays: 3,
			weekendDays: 2,
		});
	});

	test("subtract walks backward over the weekend", () => {
		expect(calculateBusinessDaysFrom("2026-11-20", "subtract", "5")).toMatchObject({
			resultDate: "2026-11-13",
			weekday: "Friday",
			businessDays: 5,
			calendarDays: 7,
			weekendDays: 2,
		});
	});

	test("zero business days returns the start date", () => {
		expect(calculateBusinessDaysFrom("2026-11-20", "add", "0")).toMatchObject({
			resultDate: "2026-11-20",
			businessDays: 0,
			calendarDays: 0,
			weekendDays: 0,
		});
	});

	test("rejects invalid inputs in add mode", () => {
		expect(calculateBusinessDaysFrom("", "add", "10").validation).toContain("YYYY-MM-DD");
		expect(calculateBusinessDaysFrom("2026-03-06", "add", "not-a-number").validation).toContain("whole number");
		expect(calculateBusinessDaysFrom("2026-03-06", "add", "250001").validation).toContain("whole number");
	});
});
