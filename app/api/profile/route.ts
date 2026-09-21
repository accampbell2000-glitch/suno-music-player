import { env } from "cloudflare:workers";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type ProfileRow = {
	user_id: string;
	username: string | null;
	first_name: string | null;
	last_name: string | null;
	birthday: string | null;
};

const clean = (value: unknown, max: number): string | null => {
	const text = typeof value === "string" ? value.trim().slice(0, max) : "";
	return text.length ? text : null;
};

export async function GET() {
	const session = await getSession();
	if (!session) return Response.json({ ok: false }, { status: 401 });
	const row = (await env.DB.prepare(
		"SELECT user_id, username, first_name, last_name, birthday FROM user_profiles WHERE user_id = ?"
	)
		.bind(session.userId)
		.first()) as ProfileRow | null;
	return Response.json({ ok: true, profile: row ? { username: row.username, firstName: row.first_name, lastName: row.last_name, birthday: row.birthday } : null });
}

export async function POST(request: Request) {
	const session = await getSession();
	if (!session) return Response.json({ ok: false }, { status: 401 });
	try {
		const payload = (await request.json()) as Record<string, unknown>;
		const birthday = clean(payload.birthday, 10);
		if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
			return Response.json({ ok: false, error: "Birthday must be a valid date." }, { status: 400 });
		}
		await env.DB.prepare(
			`INSERT INTO user_profiles (user_id, username, first_name, last_name, birthday, updated_at)
			 VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
			 ON CONFLICT(user_id) DO UPDATE SET
			   username = excluded.username,
			   first_name = excluded.first_name,
			   last_name = excluded.last_name,
			   birthday = excluded.birthday,
			   updated_at = CURRENT_TIMESTAMP`
		)
			.bind(
				session.userId,
				clean(payload.username, 40),
				clean(payload.firstName, 60),
				clean(payload.lastName, 60),
				birthday
			)
			.run();
		return Response.json({ ok: true });
	} catch (error) {
		console.error("profile save failed", error);
		return Response.json({ ok: false, error: "Could not save your profile. Try again." }, { status: 500 });
	}
}
