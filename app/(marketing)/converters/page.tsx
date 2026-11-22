import type { Metadata } from "next";
import Link from "next/link";
import { getAppUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "All Converters | CalcForged",
		description:
			"Browse free CalcForged converters that run in your browser. Image converters, currency, length, weight, volume and more.",
		alternates: { canonical: new URL("/converters", getAppUrl()).toString() },
	};
}

const imageConverters = [
	{
		slug: "webp-to-jpg",
		name: "WebP to JPG Converter",
		description:
			"Convert WebP to JPG and JPG to WebP instantly in your browser. Private, free, no sign-up.",
		icon: "🖼️",
		href: "/converters/webp-to-jpg",
	},
];

const unitConverters = [
	{
		name: "Currency Converter",
		description: "USD to EUR, GBP, JPY, CAD and more with live exchange rates.",
		icon: "$",
		href: "/calculators/travel/currency-converter",
	},
	{
		name: "Length Converter",
		description: "Miles to kilometers, feet and inches to meters and centimeters.",
		icon: "↔",
		href: "/calculators/everyday-life/length-converter",
	},
	{
		name: "Weight Converter",
		description: "Pounds to kilograms, ounces to grams, stone and tons.",
		icon: "⚖",
		href: "/calculators/everyday-life/weight-converter",
	},
	{
		name: "Volume Converter",
		description: "Cups, fluid ounces, quarts and gallons to liters and milliliters.",
		icon: "💧",
		href: "/calculators/everyday-life/volume-converter",
	},
	{
		name: "Cups to Grams",
		description: "Convert cups to grams for baking, with ingredient guidance.",
		icon: "🥄",
		href: "/calculators/food-catering/cups-to-grams",
	},
	{
		name: "Grams to Cups",
		description: "Convert grams to cups for baking, the reverse direction.",
		icon: "🥄",
		href: "/calculators/food-catering/grams-to-cups",
	},
	{
		name: "Time Zone Converter",
		description: "Convert across time zones: EST, PST, UTC, CET and more.",
		icon: "🕐",
		href: "/calculators/travel/time-zone",
	},
	{
		name: "Pixels to REM",
		description: "Convert CSS pixels to rem and back for web design.",
		icon: "px",
		href: "/calculators/business/px-to-rem",
	},
	{
		name: "Model Train Scale Converter",
		description: "Convert between model train scales like HO, N and O.",
		icon: "🚂",
		href: "/calculators/hobbies/train-scale-converter",
	},
	{
		name: "Miniature Scale Converter",
		description: "Convert real-world heights to 1:50, 1:56, 1:64 and 1:100 scales.",
		icon: "◆",
		href: "/calculators/hobbies/miniature-scale-converter",
	},
];

export default function ConvertersIndex() {
	return (
		<section className="cf-page">
			<div className="cf-shell">
				<div className="cf-page-intro">
					<p className="cf-kicker">Free converters</p>
					<h1>All converters</h1>
					<p>
						Convert images, currency, units and more without signing up.
						Image converters run in your browser; unit converters use
						your existing CalcForged calculators.
					</p>
				</div>
				<section className="cf-index-group" id="image-converters">
					<div className="cf-index-heading">
						<div>
							<p className="cf-kicker">Image converters</p>
							<h2>Image & file format converters</h2>
						</div>
						<span>{imageConverters.length} live</span>
					</div>
					<div className="cf-tools-grid">
						{imageConverters.map((c) => (
							<Link key={c.slug} href={c.href} className="cf-tool-card">
								<div className="cf-tool-icon" aria-hidden="true">
									{c.icon}
								</div>
								<div>
									<p className="cf-card-category">Image converters</p>
									<h3>{c.name}</h3>
									<p>{c.description}</p>
								</div>
								<span className="cf-card-arrow" aria-hidden="true">
									↗
								</span>
							</Link>
						))}
					</div>
					<div className="cf-coming">
						<span>+ </span>More converters are coming: PNG to JPG, HEIC to JPG,
						and more.
					</div>
				</section>
				<section className="cf-index-group" id="unit-converters">
					<div className="cf-index-heading">
						<div>
							<p className="cf-kicker">Unit converters</p>
							<h2>Currency, units & scales</h2>
						</div>
						<span>{unitConverters.length} live</span>
					</div>
					<div className="cf-tools-grid">
						{unitConverters.map((c) => (
							<Link key={c.href} href={c.href} className="cf-tool-card">
								<div className="cf-tool-icon" aria-hidden="true">
									{c.icon}
								</div>
								<div>
									<p className="cf-card-category">Unit converters</p>
									<h3>{c.name}</h3>
									<p>{c.description}</p>
								</div>
								<span className="cf-card-arrow" aria-hidden="true">
									↗
								</span>
							</Link>
						))}
					</div>
				</section>
			</div>
		</section>
	);
}
