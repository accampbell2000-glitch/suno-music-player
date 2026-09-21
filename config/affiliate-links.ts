// Affiliate recommendations for the buying-intent calculators.
//
// HOW TO EARN FROM THESE LINKS
// 1. Andrew signs up for Amazon Associates (free, needs the live site URL):
//    https://affiliate-program.amazon.com — approval usually takes 1–3 days.
// 2. Put the tracking id (ends in "-20") in AMAZON_TAG below, redeploy, and
//    every link on this page earns from then on. Keep the tag ONLY here.
//
// With no tag set, links still work — they just don't earn yet. The FTC
// disclosure under the grid switches to the Amazon Associates wording once
// the tag is configured.

export const AMAZON_TAG = "calcforged-20";

type AffiliateProduct = { name: string; blurb: string; query: string };

const amazonUrl = (query: string) =>
	`https://www.amazon.com/s?k=${encodeURIComponent(query)}${AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ""}`;

export function affiliateUrl(query: string): string {
	return amazonUrl(query);
}

export const affiliateDisclosure: string = AMAZON_TAG
	? "As an Amazon Associate, CalcForged earns from qualifying purchases made through these links."
	: "These links point to products we recommend. Commission links may be added later; clicking costs you nothing either way.";

export const affiliatePicks: Record<string, AffiliateProduct[]> = {
	paint: [
		{ name: "Paint sprayer", blurb: "Faster than a roller for walls and ceilings; worth it above two rooms.", query: "paint sprayer home use" },
		{ name: "Painter's tape", blurb: "Clean edges are the difference between a repaint and a touch-up.", query: "painters tape multi surface" },
		{ name: "Drop cloths", blurb: "Canvas beats plastic for floors — no sliding, soaks spills.", query: "canvas drop cloth painting" },
		{ name: "Roller & brush set", blurb: "A full kit covers trim, walls, and cutting-in without a second store trip.", query: "paint roller brush set" },
	],
	flooring: [
		{ name: "Vinyl plank flooring", blurb: "Click-lock planks are the most forgiving first-time install.", query: "vinyl plank flooring click lock" },
		{ name: "Underlayment", blurb: "Cushions, quiets, and smooths minor subfloor unevenness.", query: "flooring underlayment roll" },
		{ name: "Installation kit", blurb: "Tapping block, pull bar, and spacers — the small tools that protect plank edges.", query: "flooring installation kit tapping block" },
		{ name: "Moisture meter", blurb: "Checks the subfloor before you cover it. Cheap insurance for any wood floor.", query: "moisture meter wood subfloor" },
	],
	mulch: [
		{ name: "Wheelbarrow", blurb: "Bulk mulch means hauling — a 6-cubic-foot tray is the sweet spot.", query: "wheelbarrow 6 cubic foot" },
		{ name: "Landscape fabric & pins", blurb: "Lay it first and the weeds lose before they start.", query: "landscape fabric heavy duty pins" },
		{ name: "Garden fork", blurb: "Turns compacted beds and spreads mulch without tearing roots.", query: "garden fork spading" },
		{ name: "Work gloves", blurb: "Cheap ones split on a single bed. Get the nitrile-coated kind.", query: "nitrile coated work gloves gardening" },
	],
	concrete: [
		{ name: "Concrete mixer", blurb: "For anything over a few bags, a mixer pays for itself in one pour.", query: "portable concrete mixer" },
		{ name: "Masonry trowel set", blurb: "Finishing, edging, and grooving tools for a slab that looks poured, not patched.", query: "concrete finishing trowel edger set" },
		{ name: "Concrete forms", blurb: "Reusable form boards and stakes keep the slab square while it cures.", query: "concrete form board stakes" },
		{ name: "Mixing tub", blurb: "The no-mixer route: a heavy tub for hand-mixing bags on the spot.", query: "concrete mixing tub heavy duty" },
	],
	"bbq-meat": [
		{ name: "Wireless meat thermometer", blurb: "The single biggest upgrade for low-and-slow cooking — no more lifting the lid to guess.", query: "wireless meat thermometer bbq" },
		{ name: "Brisket slicing knife", blurb: "A long, narrow blade slices against the grain without shredding the bark.", query: "brisket slicing knife 12 inch" },
		{ name: "Insulated food carriers", blurb: "Rest brisket in a cooler and it holds hot for hours until serving.", query: "insulated food carrier cooler bbq" },
		{ name: "Grill gloves", blurb: "Handling hot grates and a wrapped brisket with bare confidence.", query: "bbq grill gloves heat resistant" },
	],
	"wedding-food": [
		{ name: "Chafing dish set", blurb: "Keeps buffet food at serving temperature for the whole reception.", query: "chafing dish buffet set stainless" },
		{ name: "Cupcake carrier & stands", blurb: "Transports and displays a dessert table without a bakery bill.", query: "cupcake carrier dessert stand" },
		{ name: "Disposable dinnerware", blurb: "Heavier-duty plates and cutlery read as real dinnerware in photos.", query: "heavyweight disposable dinnerware wedding" },
		{ name: "Beverage dispensers", blurb: "Self-serve drinks free the bar line for the signature cocktail.", query: "beverage dispenser glass 2 gallon" },
	],
};
