import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { GigDriverMileageGate } from "@/components/gig-driver-mileage-gate";
import {
  GIG_MILEAGE_WINDOW_MS,
  type GigMileageRecord,
  calculateHoursWorked,
  calculateShiftEconomics,
  gpsErrorMessage,
  gpsSegmentMiles,
  isGigMileageRecordInWindow,
  parseGigMileageRecord,
  validateOdometerReadings,
  validateShiftInputs,
  validateTripTimes,
} from "@/lib/gig-driver-mileage";

describe("gig driver mileage gate", () => {
  it("shows the exact free-account promise and both actions, returning to the tracker", () => {
    const trackerUrl = "https://calcforged.com/calculators/business/gig-driver-mileage-tracker";
    const html = renderToStaticMarkup(<GigDriverMileageGate createAccountHref={`/authorize?return_to=${encodeURIComponent(trackerUrl)}`} logInHref={`/authorize?return_to=${encodeURIComponent(trackerUrl)}`} />);
    expect(html).toContain("Track your gig miles for free.");
    expect(html).toContain("Create a free account to keep the last 7 days of mileage records. No paid plan required.");
    expect(html).toContain(">Create free account</a>");
    expect(html).toContain(">Log in</a>");
    expect(html.match(/return_to/g)?.length).toBe(2);
  });
});

describe("gig mileage record validation", () => {
  it("accepts positive manual odometer mileage and rejects equal, reversed, and out-of-range readings", () => {
    expect(validateOdometerReadings(42000, 42031.7)).toEqual({ value: 31.7, error: null });
    expect(validateOdometerReadings(42000, 42000).error).toContain("must be higher");
    expect(validateOdometerReadings(42001, 42000).error).toContain("must be higher");
    expect(validateOdometerReadings("", 42000).error).toContain("Enter both");
    expect(validateOdometerReadings(-1, 42000).error).toContain("starting odometer");
  });

  it("derives worked hours from start and finish times", () => {
    expect(calculateHoursWorked("2026-10-12T08:00:00.000Z", "2026-10-12T12:30:00.000Z")).toBe(4.5);
    expect(calculateHoursWorked("2026-10-12T08:00:00.000Z", "2026-10-12T08:15:00.000Z")).toBe(0.25);
    expect(calculateHoursWorked("2026-10-12T12:30:00.000Z", "2026-10-12T08:00:00.000Z")).toBeNull();
  });

  it("validates earnings and an optional complete fuel basis with the derived duration", () => {
    expect(validateShiftInputs(120, 4.5, 28, 3.55).value).toEqual({ grossEarnings: 120, hoursWorked: 4.5, fuelMpg: 28, fuelPricePerGallon: 3.55 });
    expect(validateShiftInputs("", 4.5, 28, 3.55).error).toContain("total earnings");
    expect(validateShiftInputs(120, 0, 28, 3.55).error).toContain("shift start and finish");
    expect(validateShiftInputs(120, 4.5, 28, "").error).toContain("both MPG and price");
    expect(validateShiftInputs(120, 4.5, "", "").value).toEqual({ grossEarnings: 120, hoursWorked: 4.5, fuelMpg: null, fuelPricePerGallon: null });
  });

  it("calculates fuel cost per mile and hourly earnings after fuel from entered values", () => {
    expect(calculateShiftEconomics({ miles: 56, grossEarnings: 120, hoursWorked: 4.5, fuelMpg: 28, fuelPricePerGallon: 3.55 })).toEqual({
      fuelCostPerMile: 3.55 / 28,
      fuelCost: 7.1,
      afterFuel: 112.9,
      afterFuelPerHour: 112.9 / 4.5,
    });
    expect(calculateShiftEconomics({ miles: 56, grossEarnings: 120, hoursWorked: 0, fuelMpg: 28, fuelPricePerGallon: 3.55 })).toBeNull();
  });

  it("limits trip dates to a valid seven-day window", () => {
    const now = Date.parse("2026-10-12T12:00:00.000Z");
    expect(validateTripTimes("2026-10-12T10:00:00.000Z", "2026-10-12T11:00:00.000Z", now).value?.endedAt).toBe("2026-10-12T11:00:00.000Z");
    expect(validateTripTimes("2026-10-04T11:59:00.000Z", "2026-10-04T12:01:00.000Z", now).error).toContain("last seven days");
    expect(validateTripTimes("2026-10-12T11:00:00.000Z", "2026-10-12T10:00:00.000Z", now).error).toContain("after the start time");
    expect(validateTripTimes("2026-10-12T11:00:00.000Z", "2026-10-12T12:01:01.000Z", now).error).toContain("future");
  });

  it("prunes only records outside the rolling window and parses only this record type", () => {
    const now = Date.parse("2026-10-12T12:00:00.000Z");
    const recent: GigMileageRecord = { recordType: "gig-mileage-trip", miles: 12, startedAt: "2026-10-12T10:00:00.000Z", endedAt: "2026-10-12T11:00:00.000Z", inputMethod: "manual_odometer", grossEarnings: 48, hoursWorked: 1, fuelMpg: 28, fuelPricePerGallon: 3.55 };
    const old: GigMileageRecord = { ...recent, endedAt: new Date(now - GIG_MILEAGE_WINDOW_MS - 1000).toISOString() };
    expect(isGigMileageRecordInWindow(recent, now)).toBe(true);
    expect(isGigMileageRecordInWindow(old, now)).toBe(false);
    expect(parseGigMileageRecord(JSON.stringify(recent))?.miles).toBe(12);
    const legacy = parseGigMileageRecord(JSON.stringify({ recordType: "gig-mileage-trip", miles: 12, startedAt: recent.startedAt, endedAt: recent.endedAt, inputMethod: recent.inputMethod }));
    expect(legacy?.grossEarnings).toBeNull();
    expect(legacy?.hoursWorked).toBe(1);
    expect(parseGigMileageRecord(JSON.stringify({ ...recent, recordType: "fuel-fillup" }))).toBeNull();
  });

  it("provides clear permission-denied and GPS-unavailable fallbacks", () => {
    expect(gpsErrorMessage(1)).toContain("permission was denied");
    expect(gpsErrorMessage(2)).toContain("GPS is unavailable");
    expect(gpsErrorMessage(3)).toContain("did not return a location");
  });

  it("computes an in-memory GPS segment without needing to persist coordinates", () => {
    const oneDegreeAtEquator = gpsSegmentMiles({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 });
    expect(oneDegreeAtEquator).toBeGreaterThan(69);
    expect(oneDegreeAtEquator).toBeLessThan(70);
  });
});
