import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

const pavers = calculatorsBySlug["patio-pavers"];

describe("patio paver calculator", () => {
  test("calculates a rectangular patio and applies the editable allowance", () => {
    const result = pavers.calculate({ measureBy: "rectangle", length: 12, width: 10, paverLength: 12, paverWidth: 12, allowance: 10 });
    expect(result.area).toBe(120);
    expect(result.coverage).toBe(1);
    expect(result.pavers).toBe(120);
    expect(result.order).toBe(132);
    expect(result.extra).toBe(12);
  });

  test("uses a known area for non-rectangular layouts", () => {
    const result = pavers.calculate({ measureBy: "area", knownArea: 150, paverLength: 12, paverWidth: 24, allowance: 0 });
    expect(result.area).toBe(150);
    expect(result.coverage).toBe(2);
    expect(result.pavers).toBe(75);
    expect(result.order).toBe(75);
    expect(result.extra).toBe(0);
  });

  test("rounds a partial paver up to a whole piece", () => {
    const result = pavers.calculate({ measureBy: "area", knownArea: 10.1, paverLength: 12, paverWidth: 12, allowance: 0 });
    expect(result.pavers).toBe(11);
    expect(result.order).toBe(11);
  });
});
