import type { Metadata } from "next";
import { getAppUrl } from "@/lib/site-url";
import "./app.css";

// Keep lazy: getAppUrl() reads a request-time env binding, so a module-level
// `export const metadata` would throw at worker startup and fail the deploy.
export async function generateMetadata(): Promise<Metadata> {
	const siteUrl = getAppUrl();
	return {
		metadataBase: new URL(siteUrl),
		// Render the site-wide opengraph-image as a full-width card on X.
		// Per-route pages can override this (e.g. a text-only post → "summary").
		twitter: { card: "summary_large_image" },
	};
}

// Minimal root: html/body + global concerns only. Route groups own their chrome
// — (marketing) renders Header/Footer, dashboard renders the members shell.
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="google-site-verification" content="rRPekh3qANNXS8C6xYH_RkgCgTFQSI6ez_DHPX23b5I" />
				<meta name="google-site-verification" content="2sKVkWBNqHc5JcNEd27TlKnH2aHwwGoIxFkUh9FT9Zo" />
			</head>
			<body>{children}</body>
		</html>
	);
}
