import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

const area = calculatorsBySlug["area"];

describe("area calculator", () => {
  test("calculates a rectangle and reports three area units", () => {
    const result = area.calculate({ shape: "rectangle", length: 12, width: 10 });
    expect(result.squareFeet).toBe(120);
    expect(result.squareYards).toBe(13.33);
    expect(result.squareMeters).toBe(11.15);
  });

  test("converts meter dimensions before calculating", () => {
    const result = area.calculate({ shape: "rectangle", dimensionUnit: "m", length: 3, width: 4 });
    expect(result.squareFeet).toBe(129.17);
    expect(result.squareYards).toBe(14.35);
    expect(result.squareMeters).toBe(12);
  });

  test("calculates a square", () => {
    expect(area.calculate({ shape: "square", side: 10 }).squareFeet).toBe(100);
  });

  test("calculates a circle from its diameter", () => {
    expect(area.calculate({ shape: "circle", diameter: 10 }).squareFeet).toBe(78.54);
  });

  test("calculates a triangle", () => {
    expect(area.calculate({ shape: "triangle", base: 8, triangleHeight: 6 }).squareFeet).toBe(24);
  });

  test("calculates a trapezoid", () => {
    expect(area.calculate({ shape: "trapezoid", baseA: 8, baseB: 12, trapezoidHeight: 5 }).squareFeet).toBe(50);
  });

  test("calculates an ellipse from its full axes", () => {
    expect(area.calculate({ shape: "ellipse", majorAxis: 10, minorAxis: 6 }).squareFeet).toBe(47.12);
  });
});
