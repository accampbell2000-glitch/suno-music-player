"use client";

import { useEffect, useState } from "react";

interface ProfileValues {
	username: string;
	firstName: string;
	lastName: string;
	birthday: string;
}

const EMPTY: ProfileValues = { username: "", firstName: "", lastName: "", birthday: "" };

export function ProfilePanel({ email, displayName }: { email: string | null; displayName: string | null }) {
	const [values, setValues] = useState<ProfileValues>(EMPTY);
	const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let alive = true;
		fetch("/api/profile")
			.then((res) => (res.ok ? (res.json() as Promise<{ profile?: Partial<ProfileValues> | null }>) : null))
			.then((data) => {
				if (!alive || !data?.profile) return;
				const profile = (data as { profile: Partial<ProfileValues> }).profile;
				setValues({
					username: profile.username ?? "",
					firstName: profile.firstName ?? "",
					lastName: profile.lastName ?? "",
					birthday: profile.birthday ?? "",
				});
			})
			.catch(() => undefined);
		return () => {
			alive = false;
		};
	}, []);

	async function save(event: React.FormEvent) {
		event.preventDefault();
		setStatus("saving");
		setError(null);
		const res = await fetch("/api/profile", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(values),
		});
		if (res.ok) {
			setStatus("saved");
		} else {
			const body = (await res.json().catch(() => null)) as { error?: string } | null;
			setError(body?.error ?? "Could not save. Try again.");
			setStatus("error");
		}
	}

	const field = (key: keyof ProfileValues) => ({
		value: values[key],
		onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
			setValues((current) => ({ ...current, [key]: event.target.value })),
	});

	return (
		<section className="rounded-xl border border-border/60 bg-card p-6">
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h2 className="text-lg font-semibold tracking-tight">Your profile</h2>
				<p className="text-sm text-muted-foreground">{email ?? displayName ?? "Signed in"}</p>
			</div>
			<p className="mt-1 text-sm text-muted-foreground">
				All optional — it makes the calculators feel more like yours, and it is
				never required to use the site.
			</p>
			<form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2">
				<label className="grid gap-1.5 text-sm">
					<span>Username</span>
					<input {...field("username")} className="h-10 rounded-md border border-border bg-background px-3" placeholder="how should we greet you?" autoComplete="off" />
				</label>
				<label className="grid gap-1.5 text-sm">
					<span>Birthday</span>
					<input {...field("birthday")} type="date" className="h-10 rounded-md border border-border bg-background px-3" />
				</label>
				<label className="grid gap-1.5 text-sm">
					<span>First name</span>
					<input {...field("firstName")} className="h-10 rounded-md border border-border bg-background px-3" autoComplete="given-name" />
				</label>
				<label className="grid gap-1.5 text-sm">
					<span>Last name</span>
					<input {...field("lastName")} className="h-10 rounded-md border border-border bg-background px-3" autoComplete="family-name" />
				</label>
				<div className="sm:col-span-2 flex items-center gap-3">
					<button type="submit" disabled={status === "saving"} className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60">
						{status === "saving" ? "Saving…" : "Save profile"}
					</button>
					{status === "saved" && <p className="text-sm text-emerald-600">Saved.</p>}
					{status === "error" && <p className="text-sm text-destructive">{error}</p>}
				</div>
			</form>
		</section>
	);
}
