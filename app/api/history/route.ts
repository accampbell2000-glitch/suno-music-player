import { env } from "cloudflare:workers";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
	const session = await getSession();
	if (!session) return Response.json({ ok: false }, { status: 401 });
	const res = await env.DB.prepare(
		"SELECT calculator_slug, input_summary, inputs_json, created_at FROM user_calculations WHERE user_id = ? ORDER BY id DESC LIMIT 20"
	)
		.bind(session.userId)
		.all();
	const rows = ((res?.results ?? []) as { calculator_slug: string; input_summary: string | null; inputs_json: string | null; created_at: string }[]).map((row) => {
		let inputs: Record<string, string> | null = null;
		try {
			if (row.inputs_json) inputs = JSON.parse(row.inputs_json) as Record<string, string>;
		} catch {
			inputs = null;
		}
		return { slug: row.calculator_slug, summary: row.input_summary, inputs, at: row.created_at };
	});
	return Response.json({ ok: true, rows });
}
