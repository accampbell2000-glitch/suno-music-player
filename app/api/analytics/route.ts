import { env } from "cloudflare:workers";

const allowedEvents = new Set(["page_view", "calculation_performed", "copy_results", "print_results", "share_results"]);

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { eventType?: string; calculatorSlug?: string; inputSummary?: string; sessionHash?: string; isRepeat?: boolean };
    if (!payload.eventType || !allowedEvents.has(payload.eventType)) return Response.json({ ok: false }, { status: 400 });
    await env.DB.prepare("INSERT INTO analytics_events (event_type, calculator_slug, input_summary, session_hash, is_repeat) VALUES (?, ?, ?, ?, ?)")
      .bind(payload.eventType, payload.calculatorSlug?.slice(0, 100) ?? null, payload.inputSummary?.slice(0, 500) ?? null, payload.sessionHash?.slice(0, 120) ?? null, payload.isRepeat ? 1 : 0)
      .run();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
