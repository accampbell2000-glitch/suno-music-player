import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

const dateCalculator = calculatorsBySlug.date;
const timeCalculator = calculatorsBySlug.time;

describe("date calculator", () => {
  test("counts elapsed days across leap day", () => {
    const result = dateCalculator.calculate({ mode: "between", startDate: "2024-02-28", endDate: "2024-03-01" });
    expect(result.answer).toBe("2 calendar days apart");
    expect(result.breakdown).toBe("0 weeks and 2 days");
    expect(result.weekday).toBe("Wednesday to Friday");
  });

  test("clamps month addition to the last day of a shorter month", () => {
    const result = dateCalculator.calculate({ mode: "adjust", startDate: "2026-01-31", direction: "add", amount: 1, unit: "months" });
    expect(result.answer).toBe("February 28, 2026");
    expect(result.breakdown).toBe("1 month added from January 31, 2026");
    expect(result.weekday).toBe("Saturday");
  });

  test("subtracts calendar weeks across a year boundary", () => {
    const result = dateCalculator.calculate({ mode: "adjust", startDate: "2026-01-01", direction: "subtract", amount: 1, unit: "weeks" });
    expect(result.answer).toBe("December 25, 2025");
  });

  test("rejects impossible calendar dates", () => {
    const result = dateCalculator.calculate({ mode: "between", startDate: "2026-02-30", endDate: "2026-03-01" });
    expect(result.answer).toBe("Enter a valid starting date like 2026-10-11");
  });
});

describe("time calculator", () => {
  test("handles overnight work and subtracts an unpaid break", () => {
    const result = timeCalculator.calculate({ mode: "duration", startTime: "22:30", endTime: "06:15", breakMinutes: 30 });
    expect(result.answer).toBe("7 hours and 15 minutes");
    expect(result.decimalHours).toBe("7.25 hours");
    expect(result.dayShift).toBe("Ends the next day");
  });

  test("adds time across midnight", () => {
    const result = timeCalculator.calculate({ mode: "adjust", startTime: "23:00", operation: "add", hours: 2, minutes: 30 });
    expect(result.answer).toBe("1:30 AM");
    expect(result.dayShift).toBe("Next day");
  });

  test("subtracts time into the prior day", () => {
    const result = timeCalculator.calculate({ mode: "adjust", startTime: "00:30", operation: "subtract", hours: 1, minutes: 0 });
    expect(result.answer).toBe("11:30 PM");
    expect(result.dayShift).toBe("Previous day");
  });

  test("rejects a break longer than the shift", () => {
    const result = timeCalculator.calculate({ mode: "duration", startTime: "09:00", endTime: "10:00", breakMinutes: 61 });
    expect(result.answer).toBe("The break cannot exceed the time between the two times");
  });
});
