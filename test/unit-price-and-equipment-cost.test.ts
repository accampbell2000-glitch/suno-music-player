import { describe, expect, test } from "bun:test";
import { calculatorsBySlug } from "../lib/calculator-definitions";

const unitPrice = calculatorsBySlug["unit-price-comparison"];
const equipmentCost = calculatorsBySlug["equipment-operating-cost-per-hour"];

describe("unit price comparison calculator", () => {
  test("normalizes grocery package weights to price per ounce and selects the lower unrounded price", () => {
    const result = unitPrice.calculate({ productA: "Small", priceA: 2.49, sizeA: 16, unitA: "oz", productB: "Large", priceB: 3.5, sizeB: 24, unitB: "oz" });
    expect(result.unitPriceA).toBe("$0.1556 / oz");
    expect(result.unitPriceB).toBe("$0.1458 / oz");
    expect(result.lowerPrice).toBe("Large");
    expect(result.difference).toBe("$0.0098 / oz");
    expect(result.workings).toContain("$2.49 ÷ 16.0000 oz = $0.1556/oz");
  });

  test("uses exact weight, volume, and count unit conversions", () => {
    const weight = unitPrice.calculate({ priceA: 5, sizeA: 453.59237, unitA: "g", priceB: 5, sizeB: 1, unitB: "lb" });
    expect(weight.unitPriceA).toBe("$0.3125 / oz");
    expect(weight.lowerPrice).toBe("Tie - same unit price");

    const volume = unitPrice.calculate({ priceA: 2, sizeA: 1, unitA: "cup", priceB: 2, sizeB: 8, unitB: "fl-oz" });
    expect(volume.unitPriceA).toBe("$0.2500 / US fl oz");
    expect(volume.unitPriceB).toBe("$0.2500 / US fl oz");
    expect(volume.lowerPrice).toBe("Tie - same unit price");

    const metricVolume = unitPrice.calculate({ priceA: 1, sizeA: 1, unitA: "l", priceB: 1, sizeB: 1000, unitB: "ml" });
    expect(metricVolume.lowerPrice).toBe("Tie - same unit price");

    const count = unitPrice.calculate({ priceA: 3, sizeA: 12, unitA: "each", priceB: 1, sizeB: 4, unitB: "each" });
    expect(count.unitPriceA).toBe("$0.2500 / item");
    expect(count.unitPriceB).toBe("$0.2500 / item");
    expect(count.lowerPrice).toBe("Tie - same unit price");
    expect(unitPrice.faqs[1]?.answer).toContain("convert to ounces");
  });

  test("rejects zero, negative, invalid, and incompatible package inputs", () => {
    expect(unitPrice.calculate({ priceA: 0, sizeA: 1, unitA: "lb", priceB: 1, sizeB: 1, unitB: "lb" }).validation).toContain("greater than $0");
    expect(unitPrice.calculate({ priceA: 1, sizeA: 0, unitA: "lb", priceB: 1, sizeB: 1, unitB: "lb" }).validation).toContain("greater than 0");
    expect(unitPrice.calculate({ priceA: -1, sizeA: 1, unitA: "lb", priceB: 1, sizeB: 1, unitB: "lb" }).validation).toContain("greater than $0");
    expect(unitPrice.calculate({ priceA: 1, sizeA: -1, unitA: "lb", priceB: 1, sizeB: 1, unitB: "lb" }).validation).toContain("greater than 0");
    expect(unitPrice.calculate({ priceA: "invalid", sizeA: 1, unitA: "lb", priceB: 1, sizeB: 1, unitB: "lb" }).validation).toContain("valid price");
    expect(unitPrice.calculate({ priceA: 1, sizeA: 1, unitA: "oz", priceB: 1, sizeB: 1, unitB: "fl-oz" }).validation).toContain("Cannot compare weight with volume");
    expect(unitPrice.calculate({ priceA: 1, sizeA: 1, unitA: "each", priceB: 1, sizeB: 1, unitB: "lb" }).validation).toContain("same dimension");
  });
});

describe("equipment operating cost per hour calculator", () => {
  test("sums depreciation, fuel, maintenance, overhead, and labor, then calculates billing margin", () => {
    const result = equipmentCost.calculate({ purchaseCost: 25000, resaleValue: 5000, lifetimeHours: 5000, fuelUse: 2, fuelPrice: 3.5, maintenanceCost: 5, annualOverhead: 1200, annualHours: 600, operatorLabor: 25, billingRate: 65 });
    expect(result.depreciationPerHour).toBe(4);
    expect(result.fuelPerHour).toBe(7);
    expect(result.maintenancePerHour).toBe(5);
    expect(result.overheadPerHour).toBe(2);
    expect(result.operatorLaborPerHour).toBe(25);
    expect(result.totalPerHour).toBe(43);
    expect(result.grossDollarsPerHour).toBe(22);
    expect(result.marginPercent).toBe(33.85);
    expect(result.workings).toContain("$25,000.00 - $5,000.00");
    expect(result.workings).toContain("$22.00 ÷ $65.00 × 100 = 33.85% margin");
  });

  test("treats omitted optional costs as zero and avoids dividing by zero", () => {
    const result = equipmentCost.calculate({ purchaseCost: 10000, resaleValue: 0, lifetimeHours: 1000, fuelUse: 0, fuelPrice: 0, maintenanceCost: 0 });
    expect(result.depreciationPerHour).toBe(10);
    expect(result.fuelPerHour).toBe(0);
    expect(result.overheadPerHour).toBe(0);
    expect(result.operatorLaborPerHour).toBe(0);
    expect(result.totalPerHour).toBe(10);
    expect(result.grossDollarsPerHour).toBe("");
    expect(result.marginPercent).toBe("");
    expect(result.workings).toContain("Annual fixed overhead: $0.00/hr (not included).");
  });

  test("validates zero hours, negative costs, invalid inputs, and overhead with no annual hours", () => {
    expect(equipmentCost.calculate({ purchaseCost: 10000, resaleValue: 0, lifetimeHours: 0, fuelUse: 0, fuelPrice: 0, maintenanceCost: 0 }).validation).toContain("Lifetime operating hours must be greater than 0");
    expect(equipmentCost.calculate({ purchaseCost: 0, resaleValue: 0, lifetimeHours: 1000, fuelUse: 0, fuelPrice: 0, maintenanceCost: 0 }).validation).toContain("Purchase or replacement cost must be greater than $0");
    expect(equipmentCost.calculate({ purchaseCost: 10000, resaleValue: 10001, lifetimeHours: 1000, fuelUse: 0, fuelPrice: 0, maintenanceCost: 0 }).validation).toContain("Resale value must be");
    expect(equipmentCost.calculate({ purchaseCost: 10000, resaleValue: 0, lifetimeHours: 1000, fuelUse: -1, fuelPrice: 3.5, maintenanceCost: 0 }).validation).toContain("cannot be negative");
    expect(equipmentCost.calculate({ purchaseCost: 10000, resaleValue: 0, lifetimeHours: 1000, fuelUse: 0, fuelPrice: "invalid", maintenanceCost: 0 }).validation).toContain("valid numbers");
    expect(equipmentCost.calculate({ purchaseCost: 10000, resaleValue: 0, lifetimeHours: 1000, fuelUse: 0, fuelPrice: 0, maintenanceCost: 0, annualOverhead: 1200, annualHours: 0 }).validation).toContain("annual operating hours above 0");
    expect(equipmentCost.calculate({ purchaseCost: 10000, resaleValue: 0, lifetimeHours: 1000, fuelUse: 0, fuelPrice: 0, maintenanceCost: 0, billingRate: -1 }).validation).toContain("cannot be negative");
  });
});
