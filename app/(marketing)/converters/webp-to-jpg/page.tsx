import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { WebpToJpgConverter } from "@/components/webp-to-jpg-converter";
import { getAppUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "WebP to JPG Converter - Free, Private, Instant | CalcForged",
		description:
			"Convert WebP to JPG and JPG to WebP in your browser. Free, private, no sign-up, no watermark. Files never leave your device.",
		alternates: {
			canonical: new URL("/converters/webp-to-jpg", getAppUrl()).toString(),
		},
	};
}

const faqs = [
	{
		question: "Is the WebP to JPG converter free?",
		answer:
			"Yes. It is free, with no sign-up, no usage limit, and no watermark. Conversion happens in your browser, so there is no server cost to pass on. It works both ways: WebP to JPG and JPG to WebP.",
	},
	{
		question: "Are my images uploaded anywhere?",
		answer:
			"No. The converter runs entirely in your browser using Canvas. Your images never leave your device and nothing is stored.",
	},
	{
		question: "Can I convert multiple files at once?",
		answer:
			"Yes. Choose several files or drop WebP and JPG files together. Each file flips to the other format and downloads separately. Up to 25 MB per file.",
	},
	{
		question: "What should I set the output quality to?",
		answer:
			"92 is a good default for photos and keeps file size reasonable. Use 100 for maximum quality, or lower it to 80 for smaller files when you are emailing or uploading. It applies to both WebP and JPG output.",
	},
	{
		question: "Will transparency be lost?",
		answer:
			"JPG does not support transparency, so transparent areas become white. If you need transparency, keep the WebP or convert to PNG instead.",
	},
	{
		question: "Why convert WebP to JPG?",
		answer:
			"Some apps, forms, printers, and older software still require JPG. Converting to JPG keeps your original size unless you lower the quality slider.",
	},
];

export default function WebpToJpgPage() {
	const faqJsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: { "@type": "Answer", text: faq.answer },
		})),
	};
	const appJsonLd = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: "WebP to JPG Converter",
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Any",
		description:
			"Free WebP to JPG converter that runs in your browser. Private, instant, no sign-up.",
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	};
	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://calcforged.com/",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Converters",
				item: "https://calcforged.com/converters",
			},
			{
				"@type": "ListItem",
				position: 3,
				name: "WebP to JPG Converter",
				item: "https://calcforged.com/converters/webp-to-jpg",
			},
		],
	};
	return (
		<article className="cf-calculator-page">
			<JsonLd data={faqJsonLd} />
			<JsonLd data={appJsonLd} />
			<JsonLd data={breadcrumbJsonLd} />
			<div className="cf-shell">
				<div className="cf-breadcrumbs">
					<Link href="/">Home</Link>
					<span>/</span>
					<Link href="/converters">Converters</Link>
					<span>/</span>
					<span>WebP to JPG Converter</span>
				</div>
				<div className="cf-calculator-intro">
					<p className="cf-kicker">Image converters</p>
					<h1>WebP to JPG converter</h1>
					<p>
						Convert WebP to JPG and JPG to WebP in seconds, right in your browser. No
						uploads, no sign-up, no watermark. Your images stay on your device
						the whole time.
					</p>
				</div>
				<WebpToJpgConverter />
				<div className="cf-content-grid">
					<div>
						<section className="cf-copy-section">
							<p className="cf-kicker">How it works</p>
							<h2>How the conversion works</h2>
							<ol>
								<li>
									<span>01</span>
									<p>
										Your browser decodes the image locally. No file is sent to
										a server. WebP becomes JPG, JPG becomes WebP.
									</p>
								</li>
								<li>
									<span>02</span>
									<p>
										The image is drawn onto a canvas. WebP to JPG gets a white
										background, since JPG has no transparency.
									</p>
								</li>
								<li>
									<span>03</span>
									<p>
										The canvas encodes the other format at the quality you choose, and you
										download it directly.
									</p>
								</li>
							</ol>
						</section>
						<section className="cf-copy-section cf-example">
							<p className="cf-kicker">Try it out</p>
							<h2>Convert multiple files</h2>
							<div className="cf-example-box">
								<p>
									<strong>Drop</strong> .webp and .jpg files together. Each one converts to the other format, one by one.
								</p>
								<p>
									<strong>Download</strong> Each file is ready to save with its original name and the new ending.
								</p>
							</div>
						</section>
					</div>
					<aside className="cf-faq">
						<p className="cf-kicker">Questions, answered</p>
						<h2>FAQ</h2>
						{faqs.map((faq) => (
							<details key={faq.question}>
								<summary>{faq.question}</summary>
								<p>{faq.answer}</p>
							</details>
						))}
					</aside>
				</div>
				<section className="cf-related">
					<div className="cf-section-heading">
						<div>
							<p className="cf-kicker">Keep going</p>
							<h2>More converters</h2>
						</div>
					</div>
					<div className="cf-tools-grid">
						<Link href="/converters" className="cf-tool-card">
							<div className="cf-tool-icon" aria-hidden="true">
								⇄
							</div>
							<div>
								<p className="cf-card-category">Converters</p>
								<h3>All converters</h3>
								<p>Browse every free CalcForged converter.</p>
							</div>
							<span className="cf-card-arrow" aria-hidden="true">
								↗
							</span>
						</Link>
						<Link href="/calculators" className="cf-tool-card">
							<div className="cf-tool-icon" aria-hidden="true">
								+
							</div>
							<div>
								<p className="cf-card-category">Calculators</p>
								<h3>All calculators</h3>
								<p>Practical calculators. Straight answers.</p>
							</div>
							<span className="cf-card-arrow" aria-hidden="true">
								↗
							</span>
						</Link>
					</div>
				</section>
			</div>
		</article>
	);
}
