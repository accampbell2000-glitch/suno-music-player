import { env } from "cloudflare:workers";
import { getSession } from "@/lib/session";
import { calculatorsBySlug } from "@/lib/calculator-definitions";

export const dynamic = "force-dynamic";

export async function GET() {
	const session = await getSession();
	if (!session) return Response.json({ ok: false }, { status: 401 });
	const res = await env.DB.prepare(
		"SELECT calculator_slug FROM user_toolkits WHERE user_id = ? ORDER BY created_at DESC"
	)
		.bind(session.userId)
		.all();
	const slugs = ((res?.results ?? []) as { calculator_slug: string }[])
		.map((row) => row.calculator_slug)
		.filter((slug) => Boolean(calculatorsBySlug[slug]));
	return Response.json({ ok: true, slugs });
}

export async function POST(request: Request) {
	const session = await getSession();
	if (!session) return Response.json({ ok: false }, { status: 401 });
	try {
		const payload = (await request.json()) as { slug?: unknown; action?: unknown };
		const slug = typeof payload.slug === "string" ? payload.slug.slice(0, 80) : "";
		const action = payload.action === "remove" ? "remove" : "add";
		if (!calculatorsBySlug[slug]) {
			return Response.json({ ok: false, error: "Unknown calculator." }, { status: 400 });
		}
		if (action === "remove") {
			await env.DB.prepare("DELETE FROM user_toolkits WHERE user_id = ? AND calculator_slug = ?")
				.bind(session.userId, slug)
				.run();
		} else {
			await env.DB.prepare(
				"INSERT OR IGNORE INTO user_toolkits (user_id, calculator_slug) VALUES (?, ?)"
			)
				.bind(session.userId, slug)
				.run();
		}
		return Response.json({ ok: true, action, slug });
	} catch (error) {
		console.error("toolkit save failed", error);
		return Response.json({ ok: false, error: "Could not update your toolkit. Try again." }, { status: 500 });
	}
}
