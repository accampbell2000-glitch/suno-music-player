import { env } from "cloudflare:workers";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const CALCULATOR_SLUG = "fuel-mileage";
const RECORD_TYPE = "fuel-fillup";
const FUEL_TYPES = ["regular", "midgrade", "premium", "diesel", "e85", "other"] as const;
type FuelType = typeof FUEL_TYPES[number];

type StoredFuelRecord = {
  recordType: typeof RECORD_TYPE;
  odometerMiles: number;
  gallons: number;
  totalPaid: number;
  fullTank: boolean;
  stationName: string | null;
  fuelType: FuelType | null;
};

type FuelEntry = StoredFuelRecord & {
  id: number;
  createdAt: string;
  intervalMpg: number | null;
  intervalMiles: number | null;
};

function parseRecord(value: string | null): StoredFuelRecord | null {
  try {
    const parsed = JSON.parse(value ?? "{}") as Record<string, unknown>;
    const odometerMiles = Number(parsed.odometerMiles);
    const gallons = Number(parsed.gallons);
    const totalPaid = Number(parsed.totalPaid);
    if (parsed.recordType !== RECORD_TYPE || typeof parsed.fullTank !== "boolean") return null;
    if (!Number.isFinite(odometerMiles) || !Number.isFinite(gallons) || !Number.isFinite(totalPaid)) return null;
    const stationName = typeof parsed.stationName === "string" ? parsed.stationName.trim().slice(0, 80) || null : null;
    const fuelType = typeof parsed.fuelType === "string" && FUEL_TYPES.includes(parsed.fuelType as FuelType) ? parsed.fuelType as FuelType : null;
    return { recordType: RECORD_TYPE, odometerMiles, gallons, totalPaid, fullTank: parsed.fullTank, stationName, fuelType };
  } catch {
    return null;
  }
}

function validateFuelRecord(payload: Record<string, unknown>): { record: StoredFuelRecord | null; error: string | null } {
  const odometerMiles = Number(payload.odometerMiles);
  const gallons = Number(payload.gallons);
  const totalPaid = Number(payload.totalPaid);
  const fullTank = payload.fullTank;
  if (!Number.isFinite(odometerMiles) || odometerMiles <= 0 || odometerMiles > 1000000) {
    return { record: null, error: "Enter an odometer reading between 1 and 1,000,000 miles." };
  }
  if (!Number.isFinite(gallons) || gallons <= 0 || gallons > 500) {
    return { record: null, error: "Enter gallons added between 0 and 500." };
  }
  if (!Number.isFinite(totalPaid) || totalPaid <= 0 || totalPaid > 5000) {
    return { record: null, error: "Enter a total pump cost above $0 and below $5,000." };
  }
  if (typeof fullTank !== "boolean") return { record: null, error: "Choose whether the tank is full." };
  if (payload.stationName !== undefined && payload.stationName !== null && typeof payload.stationName !== "string") {
    return { record: null, error: "Enter a station name or leave it blank." };
  }
  const rawFuelType = payload.fuelType;
  if (rawFuelType !== undefined && rawFuelType !== null && rawFuelType !== "" && (typeof rawFuelType !== "string" || !FUEL_TYPES.includes(rawFuelType as FuelType))) {
    return { record: null, error: "Choose a listed fuel type or leave it unspecified." };
  }
  const stationName = typeof payload.stationName === "string" ? payload.stationName.trim().slice(0, 80) || null : null;
  const fuelType = typeof rawFuelType === "string" && rawFuelType !== "" ? rawFuelType as FuelType : null;
  return { record: { recordType: RECORD_TYPE, odometerMiles, gallons, totalPaid, fullTank, stationName, fuelType }, error: null };
}

function recordSummary(record: StoredFuelRecord) {
  const parts = [
    `${record.odometerMiles.toLocaleString("en-US")} mi`,
    `${record.gallons.toFixed(2)} gal`,
    `$${record.totalPaid.toFixed(2)}`,
    record.fullTank ? "full tank" : "partial fill",
    record.stationName,
    record.fuelType,
  ].filter(Boolean);
  return parts.join(" | ").slice(0, 500);
}

async function loadFuelHistory(userId: string) {
  const result = await env.DB.prepare(
    "SELECT id, inputs_json, created_at FROM user_calculations WHERE user_id = ? AND calculator_slug = ? ORDER BY id ASC"
  ).bind(userId, CALCULATOR_SLUG).all();
  const rows = (result.results ?? []) as { id: number; inputs_json: string | null; created_at: string }[];
  const records = rows.map((row) => {
    const record = parseRecord(row.inputs_json);
    return record ? { ...record, id: row.id, createdAt: row.created_at, intervalMpg: null as number | null, intervalMiles: null as number | null } : null;
  }).filter((row): row is FuelEntry => row !== null);

  let anchor: number | null = null;
  let gallonsSinceFull = 0;
  let totalIntervalMiles = 0;
  let totalIntervalGallons = 0;
  let lastFullMpg: number | null = null;

  for (const entry of records) {
    if (anchor === null) {
      if (entry.fullTank) anchor = entry.odometerMiles;
      continue;
    }
    gallonsSinceFull += entry.gallons;
    if (!entry.fullTank) continue;
    const distance = entry.odometerMiles - anchor;
    if (distance > 0 && gallonsSinceFull > 0) {
      entry.intervalMiles = distance;
      entry.intervalMpg = distance / gallonsSinceFull;
      totalIntervalMiles += distance;
      totalIntervalGallons += gallonsSinceFull;
      lastFullMpg = entry.intervalMpg;
    }
    anchor = entry.odometerMiles;
    gallonsSinceFull = 0;
  }

  const recent = records.slice(-5).reverse();
  const totalSpentLastFive = recent.reduce((total, entry) => total + entry.totalPaid, 0);
  const latest = records.at(-1) ?? null;
  return {
    ok: true,
    entries: recent,
    hasFullTankBaseline: records.some((entry) => entry.fullTank),
    latestOdometer: latest?.odometerMiles ?? null,
    lastFullMpg,
    averageMpg: totalIntervalGallons > 0 ? totalIntervalMiles / totalIntervalGallons : null,
    totalSpentLastFive,
    latestEntryMpg: latest?.intervalMpg ?? null,
    latestEntryMiles: latest?.intervalMiles ?? null,
  };
}

async function deleteFuelRecords(userId: string, ids?: number[]) {
  const result = await env.DB.prepare(
    "SELECT id, inputs_json FROM user_calculations WHERE user_id = ? AND calculator_slug = ?"
  ).bind(userId, CALCULATOR_SLUG).all();
  const rows = (result.results ?? []) as { id: number; inputs_json: string | null }[];
  const fuelIds = rows
    .filter((row) => parseRecord(row.inputs_json) !== null)
    .map((row) => row.id)
    .filter((id) => ids === undefined || ids.includes(id));
  if (!fuelIds.length) return 0;
  for (let index = 0; index < fuelIds.length; index += 50) {
    const batch = fuelIds.slice(index, index + 50).map((id) => env.DB.prepare(
      "DELETE FROM user_calculations WHERE id = ? AND user_id = ? AND calculator_slug = ?"
    ).bind(id, userId, CALCULATOR_SLUG));
    await env.DB.batch(batch);
  }
  return fuelIds.length;
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });
  try {
    return Response.json(await loadFuelHistory(session.userId));
  } catch (error) {
    console.error("fuel history load failed", error);
    return Response.json({ ok: false, error: "Could not load your fuel log." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ ok: false, error: "Enter a valid fill-up record." }, { status: 400 });
    }
    const validated = validateFuelRecord(body as Record<string, unknown>);
    if (!validated.record) return Response.json({ ok: false, error: validated.error }, { status: 400 });
    const record = validated.record;

    const latestResult = await env.DB.prepare(
      "SELECT inputs_json FROM user_calculations WHERE user_id = ? AND calculator_slug = ? ORDER BY id DESC LIMIT 1"
    ).bind(session.userId, CALCULATOR_SLUG).first<{ inputs_json: string | null }>();
    const previous = parseRecord(latestResult?.inputs_json ?? null);
    if (previous && record.odometerMiles <= previous.odometerMiles) {
      return Response.json({ ok: false, error: `Use an odometer reading higher than your last saved reading (${previous.odometerMiles.toLocaleString("en-US")} mi).` }, { status: 400 });
    }

    await env.DB.prepare(
      "INSERT INTO user_calculations (user_id, calculator_slug, input_summary, inputs_json) VALUES (?, ?, ?, ?)"
    ).bind(session.userId, CALCULATOR_SLUG, recordSummary(record), JSON.stringify(record)).run();

    return Response.json(await loadFuelHistory(session.userId));
  } catch (error) {
    console.error("fuel history save failed", error);
    return Response.json({ ok: false, error: "Could not save this fill-up. Try again." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ ok: false, error: "Enter a valid fuel entry." }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    const id = Number(payload.id);
    if (!Number.isSafeInteger(id) || id <= 0) return Response.json({ ok: false, error: "Choose a valid fuel entry." }, { status: 400 });
    const validated = validateFuelRecord(payload);
    if (!validated.record) return Response.json({ ok: false, error: validated.error }, { status: 400 });
    const record = validated.record;

    const allResult = await env.DB.prepare(
      "SELECT id, inputs_json FROM user_calculations WHERE user_id = ? AND calculator_slug = ? ORDER BY id ASC"
    ).bind(session.userId, CALCULATOR_SLUG).all();
    const rows = (allResult.results ?? []) as { id: number; inputs_json: string | null }[];
    const records = rows.map((row) => ({ id: row.id, record: parseRecord(row.inputs_json) })).filter((row): row is { id: number; record: StoredFuelRecord } => row.record !== null);
    const index = records.findIndex((row) => row.id === id);
    if (index < 0) return Response.json({ ok: false, error: "That fuel entry could not be found." }, { status: 404 });
    const previous = records[index - 1]?.record;
    const next = records[index + 1]?.record;
    if (previous && record.odometerMiles <= previous.odometerMiles) {
      return Response.json({ ok: false, error: `Use an odometer reading above the previous fill-up (${previous.odometerMiles.toLocaleString("en-US")} mi).` }, { status: 400 });
    }
    if (next && record.odometerMiles >= next.odometerMiles) {
      return Response.json({ ok: false, error: `Use an odometer reading below the next fill-up (${next.odometerMiles.toLocaleString("en-US")} mi).` }, { status: 400 });
    }

    await env.DB.prepare(
      "UPDATE user_calculations SET input_summary = ?, inputs_json = ? WHERE id = ? AND user_id = ? AND calculator_slug = ?"
    ).bind(recordSummary(record), JSON.stringify(record), id, session.userId, CALCULATOR_SLUG).run();
    return Response.json(await loadFuelHistory(session.userId));
  } catch (error) {
    console.error("fuel history edit failed", error);
    return Response.json({ ok: false, error: "Could not update this fill-up. Try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ ok: false, error: "Choose a fuel entry to remove." }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    if (payload.action === "reset") {
      await deleteFuelRecords(session.userId);
      return Response.json(await loadFuelHistory(session.userId));
    }
    if (payload.action !== "delete") {
      return Response.json({ ok: false, error: "Choose one fuel entry or reset the fuel log." }, { status: 400 });
    }
    const id = Number(payload.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return Response.json({ ok: false, error: "Choose a valid fuel entry." }, { status: 400 });
    }
    const row = await env.DB.prepare(
      "SELECT inputs_json FROM user_calculations WHERE id = ? AND user_id = ? AND calculator_slug = ?"
    ).bind(id, session.userId, CALCULATOR_SLUG).first<{ inputs_json: string | null }>();
    if (!row || !parseRecord(row.inputs_json)) {
      return Response.json({ ok: false, error: "That fuel entry could not be found." }, { status: 404 });
    }
    await deleteFuelRecords(session.userId, [id]);
    return Response.json(await loadFuelHistory(session.userId));
  } catch (error) {
    console.error("fuel history delete failed", error);
    return Response.json({ ok: false, error: "Could not update your fuel log. Try again." }, { status: 503 });
  }
}
