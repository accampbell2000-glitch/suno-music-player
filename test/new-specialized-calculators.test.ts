import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

const cupsToGrams = calculatorsBySlug["cups-to-grams"];
const walkingSteps = calculatorsBySlug["walking-steps"];
const calorieTdee = calculatorsBySlug["calorie-tdee"];

describe("ingredient cups-to-grams calculator", () => {
  test("uses the selected ingredient's published cup weight", () => {
    const flour = cupsToGrams.calculate({ amount: 1, volumeUnit: "cup", ingredient: "all-purpose-flour" });
    const packedBrownSugar = cupsToGrams.calculate({ amount: 1, volumeUnit: "cup", ingredient: "brown-sugar-packed" });
    expect(flour.grams).toBe(120);
    expect(flour.gramsPerCup).toBe(120);
    expect(packedBrownSugar.grams).toBe(213);
    const butter = cupsToGrams.calculate({ amount: 1, volumeUnit: "cup", ingredient: "butter" });
    const honey = cupsToGrams.calculate({ amount: 1, volumeUnit: "tbsp", ingredient: "honey" });
    expect(butter.grams).toBe(226);
    expect(honey.grams).toBe(21);
    expect(honey.gramsPerCup).toBe(336);
  });

  test("converts US volume subdivisions and metric volume to cups", () => {
    expect(cupsToGrams.calculate({ amount: 0.5, volumeUnit: "cup", ingredient: "all-purpose-flour" })).toMatchObject({ grams: 60, cupEquivalent: 0.5 });
    expect(cupsToGrams.calculate({ amount: 8, volumeUnit: "floz", ingredient: "all-purpose-flour" })).toMatchObject({ grams: 120, cupEquivalent: 1 });
    expect(cupsToGrams.calculate({ amount: 240, volumeUnit: "ml", ingredient: "all-purpose-flour" })).toMatchObject({ grams: 122, cupEquivalent: 1.014 });
  });

  test("rounds to whole grams at the half-gram boundary and clamps negative volume", () => {
    expect(cupsToGrams.calculate({ amount: 0.0042, volumeUnit: "cup", ingredient: "all-purpose-flour" }).grams).toBe(1);
    expect(cupsToGrams.calculate({ amount: 0.0041, volumeUnit: "cup", ingredient: "all-purpose-flour" }).grams).toBe(0);
    expect(cupsToGrams.calculate({ amount: -1, volumeUnit: "cup", ingredient: "all-purpose-flour" }).grams).toBe(0);
  });
});

describe("walking steps calculator", () => {
  test("converts a personally entered step length to miles and kilometers", () => {
    const result = walkingSteps.calculate({ steps: 1000, stepLengthMode: "direct", stepLength: 30, stepUnit: "in" });
    expect(result.distanceMiles).toBe("0.47 mi");
    expect(result.distanceKm).toBe("0.76 km");
    expect(result.stepLengthUsed).toBe("30 in per step (76.2 cm)");
  });

  test("calculates step length from a known distance and counted steps", () => {
    const result = walkingSteps.calculate({ steps: 100, stepLengthMode: "measured", calibrationDistance: 30, calibrationUnit: "ft", calibrationSteps: 20 });
    expect(result.distanceMiles).toBe("0.03 mi");
    expect(result.distanceKm).toBe("0.05 km");
    expect(result.stepLengthUsed).toBe("18 in per step (45.7 cm)");
    expect(walkingSteps.example.result).toContain("(1.61 km)");
  });

  test("uses the sourced MET, weight conversion, and entered duration for gross calories", () => {
    const metric = walkingSteps.calculate({ steps: 1000, stepLengthMode: "direct", stepLength: 75, stepUnit: "cm", bodyWeight: 70, weightUnit: "kg", walkingMinutes: 30, walkingIntensity: "3.8" });
    const pounds = walkingSteps.calculate({ steps: 1000, stepLengthMode: "direct", stepLength: 75, stepUnit: "cm", bodyWeight: 154.3236, weightUnit: "lb", walkingMinutes: 30, walkingIntensity: "3.8" });
    expect(metric.calories).toBe("133 kcal");
    expect(pounds.calories).toBe("133 kcal");
  });

  test("handles zero steps and refuses to estimate distance without step length", () => {
    const zero = walkingSteps.calculate({ steps: 0, stepLengthMode: "direct", stepLength: 30, stepUnit: "in" });
    const missing = walkingSteps.calculate({ steps: 5000, stepLengthMode: "measured", calibrationDistance: 0, calibrationSteps: 0 });
    expect(zero.distanceMiles).toBe("0 mi");
    expect(missing.distanceMiles).toContain("Enter a positive step length");
    expect(missing.calories).toContain("Add a step length");
  });
});

describe("Mifflin-St Jeor calorie and TDEE calculator", () => {
  test("applies the male equation and moderate activity factor", () => {
    const result = calorieTdee.calculate({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm", age: 30, equationConstant: "male", activityFactor: "1.55" });
    expect(result.resting).toBe("1,649 kcal/day");
    expect(result.tdee).toBe("2,556 kcal/day");
    expect(result.activity).toBe("×1.55 (moderately active)");
  });

  test("converts US pounds and inches before applying the female equation", () => {
    const result = calorieTdee.calculate({ weight: 132.27735731, weightUnit: "lb", height: 64.96062992, heightUnit: "in", age: 25, equationConstant: "female", activityFactor: "1.2" });
    expect(result.resting).toBe("1,345 kcal/day");
    expect(result.tdee).toBe("1,614 kcal/day");
  });

  test("keeps the supported age range explicit and does not calculate outside it", () => {
    const tooYoung = calorieTdee.calculate({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm", age: 18, equationConstant: "male", activityFactor: "1.2" });
    const tooOld = calorieTdee.calculate({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm", age: 79, equationConstant: "female", activityFactor: "1.2" });
    expect(tooYoung.tdee).toContain("ages 19–78");
    expect(tooOld.resting).toContain("ages 19–78");
  });

  test("requires real inputs and an activity assumption", () => {
    const missing = calorieTdee.calculate({ weight: 0, height: 0, age: 0, equationConstant: "", activityFactor: "" });
    const noActivity = calorieTdee.calculate({ weight: 70, weightUnit: "kg", height: 175, heightUnit: "cm", age: 30, equationConstant: "male", activityFactor: "" });
    expect(missing.resting).toContain("Enter weight");
    expect(noActivity.tdee).toContain("Choose an activity assumption");
  });
});
