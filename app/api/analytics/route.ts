import { env } from "cloudflare:workers";
import { getSession } from "@/lib/session";

const allowedEvents = new Set(["page_view", "calculation_performed", "copy_results", "print_results", "share_results"]);

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { eventType?: string; calculatorSlug?: string; inputSummary?: string; sessionHash?: string; isRepeat?: boolean; inputs?: Record<string, unknown> };
    if (!payload.eventType || !allowedEvents.has(payload.eventType)) return Response.json({ ok: false }, { status: 400 });
    await env.DB.prepare("INSERT INTO analytics_events (event_type, calculator_slug, input_summary, session_hash, is_repeat) VALUES (?, ?, ?, ?, ?)")
      .bind(payload.eventType, payload.calculatorSlug?.slice(0, 100) ?? null, payload.inputSummary?.slice(0, 500) ?? null, payload.sessionHash?.slice(0, 120) ?? null, payload.isRepeat ? 1 : 0)
      .run();
    // Signed-in visitors keep a personal history of their calculations, so the
    // member area can show the last 20 for reference. Anonymous visitors get
    // the anonymous analytics row above only.
    if (payload.eventType === "calculation_performed" && payload.calculatorSlug) {
      try {
        const session = await getSession();
        if (session) {
          const inputs = payload.inputs && typeof payload.inputs === "object" ? JSON.stringify(payload.inputs).slice(0, 1200) : null;
          await env.DB.prepare(
            "INSERT INTO user_calculations (user_id, calculator_slug, input_summary, inputs_json) VALUES (?, ?, ?, ?)"
          )
            .bind(session.userId, String(payload.calculatorSlug).slice(0, 100), payload.inputSummary?.slice(0, 500) ?? null, inputs)
            .run();
        }
      } catch (error) {
        console.error("user calculation history write failed", error);
      }
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
