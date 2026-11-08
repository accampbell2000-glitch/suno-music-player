export function JsonLd({ data }: { data: Record<string, unknown> }) {
	const safeJson = JSON.stringify(data).replace(/</g, "\\u003c");
	// biome-ignore-start lint/security/noDangerouslySetInnerHtml: JSON-LD is stringified and '<' is escaped before being embedded in a script.
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: safeJson }}
		/>
	);
	// biome-ignore-end lint/security/noDangerouslySetInnerHtml: JSON-LD is stringified and '<' is escaped before being embedded in a script.
}
