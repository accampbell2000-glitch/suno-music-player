import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

const sandwich = calculatorsBySlug["sandwich-quantity"];
const autoLoan = calculatorsBySlug["auto-loan-payoff"];
const christmasTree = calculatorsBySlug["christmas-tree-water"];

describe("sandwich quantity calculator", () => {
  test("adds a buffer and converts sandwiches to platter pieces", () => {
    const result = sandwich.calculate({ guests: 30, plan: "main", cut: "2", buffer: "10" });
    expect(result.baseEquivalents).toBe(30);
    expect(result.wholeSandwiches).toBe(33);
    expect(result.servingPieces).toBe(66);
    expect(result.extraSandwiches).toBe(3);
  });

  test("uses the light-meal portion and rounds up", () => {
    const result = sandwich.calculate({ guests: 21, plan: "sides", cut: "4", buffer: "0" });
    expect(result.baseEquivalents).toBe(15.8);
    expect(result.wholeSandwiches).toBe(16);
    expect(result.servingPieces).toBe(64);
  });
});

describe("auto loan cost and payoff calculator", () => {
  test("compares scheduled payments with monthly extra principal", () => {
    const result = autoLoan.calculate({ vehiclePrice: 32000, taxAndFees: 2500, downPayment: 4000, tradeEquity: 0, apr: 6.5, termMonths: "60", extraPayment: 100 });
    expect(result.amountFinanced).toBe(30500);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.payoffMonthsWithExtra).toBeLessThan(60);
    expect(result.interestWithExtra).toBeLessThan(result.scheduledInterest as number);
    expect(result.interestSaved).toBe(898.52);
    expect(result.totalCostWithExtra).toBeLessThan(result.totalCostScheduled as number);
  });

  test("handles zero APR and negative trade-in equity", () => {
    const result = autoLoan.calculate({ vehiclePrice: 20000, taxAndFees: 1000, downPayment: 2000, tradeEquity: -3000, apr: 0, termMonths: "60", extraPayment: 0 });
    expect(result.amountFinanced).toBe(22000);
    expect(result.monthlyPayment).toBe(366.67);
    expect(result.scheduledInterest).toBe(0);
    expect(result.interestSaved).toBe(0);
    expect(result.payoffMonthsWithExtra).toBe(60);
  });
});

describe("Christmas tree water and stand calculator", () => {
  test("checks reservoir capacity, trunk fit, and ceiling clearance", () => {
    const result = christmasTree.calculate({ treeHeight: 7, ceilingHeight: 9, topperHeight: 6, clearance: 6, trunkDiameter: 3, standCapacity: 1, standMaxTrunk: 4 });
    expect(result.minimumCapacity).toBe(0.75);
    expect(result.capacityCheck).toContain("Meets the minimum");
    expect(result.trunkCheck).toContain("Fits the stand");
    expect(result.clearanceAbove).toBe(18);
    expect(result.heightCheck).toContain("Fits");
  });

  test("flags an undersized stand and a tree that is too tall", () => {
    const result = christmasTree.calculate({ treeHeight: 8, ceilingHeight: 8, topperHeight: 12, clearance: 6, trunkDiameter: 5, standCapacity: 1, standMaxTrunk: 4 });
    expect(result.capacityCheck).toContain("Short by");
    expect(result.trunkCheck).toContain("Does not fit");
    expect(result.heightCheck).toContain("Needs");
  });
});
