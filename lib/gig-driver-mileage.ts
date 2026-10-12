export const GIG_MILEAGE_CALCULATOR_SLUG = "gig-driver-mileage-tracker";
export const GIG_MILEAGE_RECORD_TYPE = "gig-mileage-trip";
export const GIG_MILEAGE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type GigMileageInputMethod = "manual_odometer" | "foreground_gps";

export type GigMileageRecord = {
  recordType: typeof GIG_MILEAGE_RECORD_TYPE;
  miles: number;
  startedAt: string;
  endedAt: string;
  inputMethod: GigMileageInputMethod;
  grossEarnings: number | null;
  hoursWorked: number | null;
  fuelMpg: number | null;
  fuelPricePerGallon: number | null;
};

export type ValidationResult<T> = { value: T; error: null } | { value: null; error: string };
export type GigShiftInputs = { grossEarnings: number; hoursWorked: number; fuelMpg: number | null; fuelPricePerGallon: number | null };
export type GigShiftEconomics = { fuelCostPerMile: number; fuelCost: number; afterFuel: number; afterFuelPerHour: number };

const hasValue = (value: unknown) => !(value === null || value === undefined || (typeof value === "string" && value.trim() === ""));
const optionalNumber = (value: unknown): number | null => !hasValue(value) ? null : Number(value);
const roundTo = (value: number, places: number) => Math.round(value * 10 ** places) / 10 ** places;

export function validateOdometerReadings(startValue: unknown, endValue: unknown): ValidationResult<number> {
  if (!hasValue(startValue) || !hasValue(endValue)) {
    return { value: null, error: "Enter both starting and ending odometer readings." };
  }
  const start = Number(startValue);
  const end = Number(endValue);
  if (!Number.isFinite(start) || start < 0 || start > 1_000_000) {
    return { value: null, error: "Enter a starting odometer reading between 0 and 1,000,000 miles." };
  }
  if (!Number.isFinite(end) || end < 0 || end > 1_000_000) {
    return { value: null, error: "Enter an ending odometer reading between 0 and 1,000,000 miles." };
  }
  if (end <= start) {
    return { value: null, error: "The ending odometer reading must be higher than the starting reading." };
  }
  const miles = Math.round((end - start) * 10) / 10;
  if (miles <= 0) return { value: null, error: "The odometer readings must show at least 0.1 mile traveled." };
  return { value: miles, error: null };
}

export type GigShiftBasis = { grossEarnings: number; fuelMpg: number | null; fuelPricePerGallon: number | null };

export function validateShiftBasis(grossValue: unknown, mpgValue: unknown, priceValue: unknown): ValidationResult<GigShiftBasis> {
  if (!hasValue(grossValue)) return { value: null, error: "Enter total earnings for this shift." };
  const grossEarnings = Number(grossValue);
  if (!Number.isFinite(grossEarnings) || grossEarnings < 0 || grossEarnings > 1_000_000) {
    return { value: null, error: "Enter total earnings from $0 to $1,000,000." };
  }
  const fuelMpg = optionalNumber(mpgValue);
  const fuelPricePerGallon = optionalNumber(priceValue);
  if ((fuelMpg === null) !== (fuelPricePerGallon === null)) {
    return { value: null, error: "Enter both MPG and price per gallon, or leave both blank." };
  }
  if (fuelMpg !== null && (!Number.isFinite(fuelMpg) || fuelMpg <= 0 || fuelMpg > 500)) {
    return { value: null, error: "Enter fuel efficiency above 0 and no more than 500 MPG." };
  }
  if (fuelPricePerGallon !== null && (!Number.isFinite(fuelPricePerGallon) || fuelPricePerGallon <= 0 || fuelPricePerGallon > 100)) {
    return { value: null, error: "Enter a pump price above $0 and no more than $100 per gallon." };
  }
  return { value: { grossEarnings: roundTo(grossEarnings, 2), fuelMpg: fuelMpg === null ? null : roundTo(fuelMpg, 2), fuelPricePerGallon: fuelPricePerGallon === null ? null : roundTo(fuelPricePerGallon, 4) }, error: null };
}

export function validateShiftInputs(grossValue: unknown, hoursValue: unknown, mpgValue: unknown, priceValue: unknown): ValidationResult<GigShiftInputs> {
  const basis = validateShiftBasis(grossValue, mpgValue, priceValue);
  if (!basis.value) return { value: null, error: basis.error };
  if (!hasValue(hoursValue)) return { value: null, error: "Enter the shift start and finish times." };
  const hoursWorked = Number(hoursValue);
  if (!Number.isFinite(hoursWorked) || hoursWorked <= 0 || hoursWorked > 24) {
    return { value: null, error: "Set valid shift start and finish times no more than 24 hours apart." };
  }
  return { value: { ...basis.value, hoursWorked: roundTo(hoursWorked, 4) }, error: null };
}

export function calculateHoursWorked(startedAt: unknown, endedAt: unknown): number | null {
  if (typeof startedAt !== "string" || typeof endedAt !== "string") return null;
  const startMs = Date.parse(startedAt);
  const endMs = Date.parse(endedAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return null;
  const hoursWorked = roundTo((endMs - startMs) / 3_600_000, 4);
  return hoursWorked > 0 ? hoursWorked : null;
}

export function calculateShiftEconomics(input: { miles: number; grossEarnings: number; hoursWorked: number; fuelMpg: number; fuelPricePerGallon: number }): GigShiftEconomics | null {
  const { miles, grossEarnings, hoursWorked, fuelMpg, fuelPricePerGallon } = input;
  if (![miles, grossEarnings, hoursWorked, fuelMpg, fuelPricePerGallon].every(Number.isFinite) || miles <= 0 || grossEarnings < 0 || hoursWorked <= 0 || fuelMpg <= 0 || fuelPricePerGallon <= 0) return null;
  const fuelCostPerMile = fuelPricePerGallon / fuelMpg;
  const fuelCost = roundTo(miles * fuelCostPerMile, 2);
  const afterFuel = roundTo(grossEarnings - fuelCost, 2);
  return { fuelCostPerMile, fuelCost, afterFuel, afterFuelPerHour: afterFuel / hoursWorked };
}

export function validateTripTimes(startedAt: unknown, endedAt: unknown, now = Date.now()): ValidationResult<{ startedAt: string; endedAt: string }> {
  if (typeof startedAt !== "string" || typeof endedAt !== "string") {
    return { value: null, error: "Enter both the trip start and end times." };
  }
  const startMs = Date.parse(startedAt);
  const endMs = Date.parse(endedAt);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return { value: null, error: "Enter valid trip start and end times." };
  }
  if (endMs <= startMs) return { value: null, error: "The trip end time must be after the start time." };
  if (startMs < now - GIG_MILEAGE_WINDOW_MS) {
    return { value: null, error: "Trips must start within the last seven days." };
  }
  if (endMs > now + 60_000) return { value: null, error: "The trip end time cannot be in the future." };
  return { value: { startedAt: new Date(startMs).toISOString(), endedAt: new Date(endMs).toISOString() }, error: null };
}

export function parseGigMileageRecord(value: string | null): GigMileageRecord | null {
  try {
    const parsed = JSON.parse(value ?? "{}") as Record<string, unknown>;
    const miles = Number(parsed.miles);
    const startedAt = typeof parsed.startedAt === "string" ? parsed.startedAt : "";
    const endedAt = typeof parsed.endedAt === "string" ? parsed.endedAt : "";
    const inputMethod = parsed.inputMethod;
    if (parsed.recordType !== GIG_MILEAGE_RECORD_TYPE) return null;
    if (!Number.isFinite(miles) || miles <= 0 || miles > 2000) return null;
    if (!Number.isFinite(Date.parse(startedAt)) || !Number.isFinite(Date.parse(endedAt))) return null;
    if (Date.parse(endedAt) <= Date.parse(startedAt)) return null;
    if (inputMethod !== "manual_odometer" && inputMethod !== "foreground_gps") return null;

    const grossEarnings = optionalNumber(parsed.grossEarnings);
    const storedHoursWorked = optionalNumber(parsed.hoursWorked);
    const fuelMpg = optionalNumber(parsed.fuelMpg);
    const fuelPricePerGallon = optionalNumber(parsed.fuelPricePerGallon);
    if (grossEarnings !== null && (!Number.isFinite(grossEarnings) || grossEarnings < 0 || grossEarnings > 1_000_000)) return null;
    if (storedHoursWorked !== null && (!Number.isFinite(storedHoursWorked) || storedHoursWorked <= 0 || storedHoursWorked > 24)) return null;
    if ((fuelMpg === null) !== (fuelPricePerGallon === null)) return null;
    if (fuelMpg !== null && (!Number.isFinite(fuelMpg) || fuelMpg <= 0 || fuelMpg > 500)) return null;
    if (fuelPricePerGallon !== null && (!Number.isFinite(fuelPricePerGallon) || fuelPricePerGallon <= 0 || fuelPricePerGallon > 100)) return null;
    const calculatedHoursWorked = storedHoursWorked ?? calculateHoursWorked(startedAt, endedAt);
    const hoursWorked = calculatedHoursWorked !== null && calculatedHoursWorked <= 24 ? calculatedHoursWorked : null;

    return {
      recordType: GIG_MILEAGE_RECORD_TYPE,
      miles,
      startedAt: new Date(startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      inputMethod,
      grossEarnings,
      hoursWorked,
      fuelMpg,
      fuelPricePerGallon,
    };
  } catch {
    return null;
  }
}

export function isGigMileageRecordInWindow(record: GigMileageRecord, now = Date.now()): boolean {
  const endedAt = Date.parse(record.endedAt);
  return endedAt >= now - GIG_MILEAGE_WINDOW_MS && endedAt <= now + 60_000;
}

export function gpsErrorMessage(code: number): string {
  if (code === 1) return "Location permission was denied. Use the manual odometer readings below instead.";
  if (code === 2) return "GPS is unavailable right now. Use the manual odometer readings below instead.";
  if (code === 3) return "GPS did not return a location in time. Try again while parked, or use the manual odometer readings below.";
  return "GPS could not get your location. Use the manual odometer readings below instead.";
}

export function gpsSegmentMiles(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const dLat = lat2 - lat1;
  const dLon = radians(b.longitude - a.longitude);
  const haversine = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 3958.7613 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
