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
	"catering-food-quantity": [
		{ name: "Insulated food carriers", blurb: "Transport and hold hot food for hours between kitchen and event.", query: "insulated food carrier catering" },
		{ name: "Chafing dish buffet set", blurb: "Full-size pans over sternos keep the buffet at serving temperature.", query: "chafing dish buffet set stainless" },
		{ name: "Serving trays & utensils", blurb: "The difference between a buffet and a table of containers.", query: "serving trays utensils buffet set" },
	],
	"taco-bar": [
		{ name: "Tortilla warmer", blurb: "Keeps a stack of tortillas soft through the whole line.", query: "tortilla warmer 12 inch" },
		{ name: "Slow cooker", blurb: "Holds taco meat at temperature and refills itself from the kitchen.", query: "slow cooker 6 quart" },
		{ name: "Topping serving bowls", blurb: "A topping bar reads better and refills faster with matching bowls.", query: "serving bowls topping bar set" },
	],
	"restaurant-food-cost": [
		{ name: "Digital portion scale", blurb: "Costing starts with weighing — a 0.1 oz scale pays for itself in a week.", query: "digital portion scale kitchen 0.1 oz" },
		{ name: "Recipe costing template", blurb: "Blank costing sheets to run every menu item through the same math.", query: "recipe costing template workbook" },
	],
	"recipe-scaling": [
		{ name: "Digital kitchen scale", blurb: "Grams scale better than cups — and the scanner's output reads cleaner too.", query: "digital kitchen scale grams" },
		{ name: "Measuring cup & spoon set", blurb: "One matching set ends the drawer archaeology mid-recipe.", query: "measuring cups spoons set stainless" },
	],
	// Picks for calculators shipping in the current build wave — the strips go
	// live with those pages.
	"wedding-dessert-table": [
		{ name: "Cupcake carrier & stands", blurb: "Transports and displays a dessert table without a bakery bill.", query: "cupcake carrier dessert stand" },
		{ name: "Mini dessert cups", blurb: "Mini portions look intentional in matching cups, not improvised.", query: "mini dessert cups spoons set" },
		{ name: "Dessert table stands", blurb: "Height turns a table of cookies into a dessert table.", query: "dessert table display stands set" },
	],
	"appetizers-per-person": [
		{ name: "Serving platters & trays", blurb: "More platters out means fewer refills mid-party.", query: "serving platters trays party set" },
		{ name: "Appetizer picks & skewers", blurb: "The small detail that makes bite-size food look catered.", query: "appetizer picks skewers cocktail" },
		{ name: "Chafing dish buffet set", blurb: "Keeps hot appetizers at temperature through a long party.", query: "chafing dish buffet set stainless" },
	],
	"yarn-yardage": [
		{ name: "Worsted weight yarn", blurb: "The workhorse weight for blankets — buy the whole project from one dye lot.", query: "worsted weight yarn 100g skein" },
		{ name: "Yarn winder & swift", blurb: "Winds skeins into pull-cakes; the only yarn upgrade worth making early.", query: "yarn ball winder swift set" },
		{ name: "Stitch markers & gauge tool", blurb: "Checking gauge before the cast-on is what makes the yardage math land.", query: "stitch markers gauge tool knitting set" },
	],
	"ac-size": [
		{ name: "Window air conditioner", blurb: "The standard fix for one room — match the BTU rating to your load.", query: "window air conditioner 12000 btu" },
		{ name: "Mini-split system", blurb: "Quieter and more efficient than a window unit for rooms you cool daily.", query: "mini split air conditioner heat pump" },
		{ name: "Smart thermostat", blurb: "Schedules and setbacks that shave the bill without sacrificing comfort.", query: "smart thermostat alexa" },
		{ name: "Caulk & weatherstripping", blurb: "Sealing leaks cuts the load itself — the cheapest BTU you will ever buy.", query: "weatherstripping door seal caulk kit" },
	],
};

// The single strongest click for each calculator, shown as a compact strip
// inside the calculator right under the results (the highest-intent moment).
export const affiliateTopPicks: Record<string, AffiliateProduct> = {
	paint: { name: "Painter's tape", blurb: "Your paint math is done — clean edges are next.", query: "painters tape multi surface" },
	flooring: { name: "Flooring installation kit", blurb: "Boxes are counted — protect the plank edges while you lay them.", query: "flooring installation kit tapping block" },
	mulch: { name: "Landscape fabric & pins", blurb: "Before the mulch goes down, the weeds lose.", query: "landscape fabric heavy duty pins" },
	concrete: { name: "Masonry trowel set", blurb: "Slab math done — finish it like it was poured, not patched.", query: "concrete finishing trowel edger set" },
	"bbq-meat": { name: "Wireless meat thermometer", blurb: "You know the raw weight — now hold the temp without lifting the lid.", query: "wireless meat thermometer bbq" },
	"wedding-food": { name: "Chafing dish set", blurb: "Portions planned — keep everything hot for the whole reception.", query: "chafing dish buffet set stainless" },
	"catering-food-quantity": { name: "Insulated food carriers", blurb: "Quantities locked — haul and hold it hot until service.", query: "insulated food carrier catering" },
	"taco-bar": { name: "Tortilla warmer", blurb: "Taco count done — keep the stack soft through the whole line.", query: "tortilla warmer 12 inch" },
	"restaurant-food-cost": { name: "Digital portion scale", blurb: "The percentage is only as good as the weighing behind it.", query: "digital portion scale kitchen 0.1 oz" },
	"catering-price-per-person": { name: "Digital portion scale", blurb: "Price per person starts with knowing exactly what a portion weighs.", query: "digital portion scale kitchen 0.1 oz" },
	"recipe-scaling": { name: "Digital kitchen scale", blurb: "Scaled amounts read cleanest when you measure in grams.", query: "digital kitchen scale grams" },
	"wedding-dessert-table": { name: "Cupcake carrier & stands", blurb: "Pieces counted — get them there intact and displayed.", query: "cupcake carrier dessert stand" },
	"appetizers-per-person": { name: "Serving platters & trays", blurb: "Pieces planned — more platters out means fewer refills.", query: "serving platters trays party set" },
	"yarn-yardage": { name: "Worsted weight yarn", blurb: "Yardage known — buy the whole project from one dye lot.", query: "worsted weight yarn 100g skein" },
	"ac-size": { name: "Window air conditioner", blurb: "Your BTU is set — pick the unit that matches it.", query: "window air conditioner 12000 btu" },
};
