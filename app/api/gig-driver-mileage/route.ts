import { env } from "cloudflare:workers";
import { getSession } from "@/lib/session";
import {
  GIG_MILEAGE_CALCULATOR_SLUG,
  GIG_MILEAGE_RECORD_TYPE,
  GIG_MILEAGE_WINDOW_MS,
  calculateHoursWorked,
  isGigMileageRecordInWindow,
  parseGigMileageRecord,
  validateOdometerReadings,
  validateShiftInputs,
  validateTripTimes,
  type GigMileageInputMethod,
  type GigMileageRecord,
} from "@/lib/gig-driver-mileage";

export const dynamic = "force-dynamic";

type SavedMileageRecord = GigMileageRecord & { id: number; createdAt: string };
type StoredRow = { id: number; inputs_json: string | null; created_at: string };

async function loadHistory(userId: string) {
  const result = await env.DB.prepare(
    "SELECT id, inputs_json, created_at FROM user_calculations WHERE user_id = ? AND calculator_slug = ? ORDER BY id DESC"
  ).bind(userId, GIG_MILEAGE_CALCULATOR_SLUG).all();
  const rows = (result.results ?? []) as StoredRow[];
  const now = Date.now();
  const records: SavedMileageRecord[] = [];
  const expiredIds: number[] = [];

  for (const row of rows) {
    const record = parseGigMileageRecord(row.inputs_json);
    if (!record) continue;
    if (!isGigMileageRecordInWindow(record, now)) {
      if (Date.parse(record.endedAt) < now - GIG_MILEAGE_WINDOW_MS) expiredIds.push(row.id);
      continue;
    }
    records.push({ ...record, id: row.id, createdAt: row.created_at });
  }

  for (const id of expiredIds) {
    await env.DB.prepare(
      "DELETE FROM user_calculations WHERE id = ? AND user_id = ? AND calculator_slug = ?"
    ).bind(id, userId, GIG_MILEAGE_CALCULATOR_SLUG).run();
  }

  return {
    ok: true,
    records,
    sevenDayMiles: records.reduce((total, record) => total + record.miles, 0),
    windowStartsAt: new Date(now - GIG_MILEAGE_WINDOW_MS).toISOString(),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });
  try {
    return Response.json(await loadHistory(session.userId));
  } catch (error) {
    console.error("gig mileage history load failed", error);
    return Response.json({ ok: false, error: "Could not load your mileage history." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ ok: false, error: "Enter a valid mileage record." }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    const timeResult = validateTripTimes(payload.startedAt, payload.endedAt);
    if (!timeResult.value) return Response.json({ ok: false, error: timeResult.error }, { status: 400 });
    const hoursWorked = calculateHoursWorked(timeResult.value.startedAt, timeResult.value.endedAt);
    if (hoursWorked === null) return Response.json({ ok: false, error: "Set a valid shift start and finish time." }, { status: 400 });
    const shiftInputs = validateShiftInputs(payload.grossEarnings, hoursWorked, payload.fuelMpg, payload.fuelPricePerGallon);
    if (!shiftInputs.value) return Response.json({ ok: false, error: shiftInputs.error }, { status: 400 });

    let miles: number;
    let inputMethod: GigMileageInputMethod;
    if (payload.inputMethod === "manual_odometer") {
      const odometerResult = validateOdometerReadings(payload.startOdometer, payload.endOdometer);
      if (odometerResult.value === null) return Response.json({ ok: false, error: odometerResult.error }, { status: 400 });
      miles = odometerResult.value;
      inputMethod = "manual_odometer";
    } else if (payload.inputMethod === "foreground_gps") {
      const rawMiles = Number(payload.miles);
      if (!Number.isFinite(rawMiles) || rawMiles <= 0 || rawMiles > 2000) {
        return Response.json({ ok: false, error: "GPS must record a mileage total above 0 and no more than 2,000 miles." }, { status: 400 });
      }
      miles = Math.round(rawMiles * 100) / 100;
      inputMethod = "foreground_gps";
    } else {
      return Response.json({ ok: false, error: "Choose manual odometer or foreground GPS tracking." }, { status: 400 });
    }

    const record: GigMileageRecord = {
      recordType: GIG_MILEAGE_RECORD_TYPE,
      miles,
      startedAt: timeResult.value.startedAt,
      endedAt: timeResult.value.endedAt,
      inputMethod,
      grossEarnings: shiftInputs.value.grossEarnings,
      hoursWorked: shiftInputs.value.hoursWorked,
      fuelMpg: shiftInputs.value.fuelMpg,
      fuelPricePerGallon: shiftInputs.value.fuelPricePerGallon,
    };
    const summary = `${inputMethod === "manual_odometer" ? "Manual odometer" : "Foreground GPS"} | ${miles.toFixed(2)} mi | $${record.grossEarnings?.toFixed(2)} gross | ${record.hoursWorked?.toFixed(2)} hr | ${record.startedAt} to ${record.endedAt}`.slice(0, 500);
    await env.DB.prepare(
      "INSERT INTO user_calculations (user_id, calculator_slug, input_summary, inputs_json) VALUES (?, ?, ?, ?)"
    ).bind(session.userId, GIG_MILEAGE_CALCULATOR_SLUG, summary, JSON.stringify(record)).run();
    return Response.json(await loadHistory(session.userId));
  } catch (error) {
    console.error("gig mileage save failed", error);
    return Response.json({ ok: false, error: "Could not save this mileage record. Try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ ok: false }, { status: 401 });

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ ok: false, error: "Choose a mileage record to remove." }, { status: 400 });
    }
    const id = Number((body as Record<string, unknown>).id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return Response.json({ ok: false, error: "Choose a valid mileage record." }, { status: 400 });
    }
    const row = await env.DB.prepare(
      "SELECT inputs_json FROM user_calculations WHERE id = ? AND user_id = ? AND calculator_slug = ?"
    ).bind(id, session.userId, GIG_MILEAGE_CALCULATOR_SLUG).first<{ inputs_json: string | null }>();
    if (!row || !parseGigMileageRecord(row.inputs_json)) {
      return Response.json({ ok: false, error: "That mileage record could not be found." }, { status: 404 });
    }
    await env.DB.prepare(
      "DELETE FROM user_calculations WHERE id = ? AND user_id = ? AND calculator_slug = ?"
    ).bind(id, session.userId, GIG_MILEAGE_CALCULATOR_SLUG).run();
    return Response.json(await loadHistory(session.userId));
  } catch (error) {
    console.error("gig mileage delete failed", error);
    return Response.json({ ok: false, error: "Could not remove this mileage record." }, { status: 503 });
  }
}
