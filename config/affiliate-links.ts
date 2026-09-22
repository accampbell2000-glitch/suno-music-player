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
	"deck-boards": [
		{ name: "Deck screw kit", blurb: "Two fasteners per joist crossing adds up fast — buy the bucket, not the box.", query: "deck screws exterior kit" },
		{ name: "Circular saw", blurb: "Crosscutting 39 boards by hand is nobody's weekend. A sharp blade pays for itself in an afternoon.", query: "circular saw 7 1/4 inch" },
		{ name: "Joist tape", blurb: "One roll over the joists stops rot where the screws go through — the cheapest years a deck gains.", query: "butyl joist tape flashing" },
		{ name: "Speed square", blurb: "Straight gap lines, square ends, and a saw guide in one flat piece of metal.", query: "speed square carpenter" },
	],
	"deck-stain": [
		{ name: "Stain & pad applicator kit", blurb: "Pads lay stain flat and fast — no drips, no lap marks, no roller fuzz stuck in the finish.", query: "deck stain applicator pad kit" },
		{ name: "Pressure washer", blurb: "Stain over gray, dead wood is money on the ground. Wash it, let it dry two days, then stain.", query: "electric pressure washer 2000 psi" },
		{ name: "Paint sprayer", blurb: "Rails and balusters are where sprayers earn their keep — brushing forty balusters is a lost day.", query: "paint sprayer home use" },
		{ name: "Deck cleaner & brightener", blurb: "Cleans and neutralizes the wood so the first coat soaks in evenly instead of patchily.", query: "deck cleaner brightener kit" },
	],
	sod: [
		{ name: "Lawn soil & topdressing", blurb: "A screened layer under the seams is what makes new sod knit in instead of ridge up.", query: "lawn topdressing soil screened" },
		{ name: "Sod roller", blurb: "One pass with a water-filled roller presses roots into soil — the step everyone skips.", query: "sod roller water filled" },
		{ name: "Sprinkler timer", blurb: "New sod wants water three times a day on a schedule, and nobody remembers that by hand.", query: "sprinkler timer hose faucet digital" },
		{ name: "Starter fertilizer", blurb: "High-phosphorus starter feed gets roots growing down before the top grows up.", query: "starter fertilizer new sod" },
	],
	rebar: [
		{ name: "Tie wire & pliers", blurb: "A twisting tool and a spool of wire are what hold the grid square while you pour.", query: "rebar tie wire pliers set" },
		{ name: "Bar chairs & spacers", blurb: "Steel only works in the middle of the slab — chairs hold it off the ground at the right height.", query: "rebar chairs spacers concrete" },
		{ name: "Angle finder", blurb: "Sets the pitch on ramps and aprons so the grid follows the pour instead of fighting it.", query: "digital angle finder" },
		{ name: "Rebar cutter / bender", blurb: "Cuts and hooks #4 bar without the spark-show of an angle grinder.", query: "manual rebar cutter bender tool" },
	],
	"gravel-driveway": [
		{ name: "Landscape rake", blurb: "Spreads and levels gravel in passes — the one tool that turns a pile into a driveway.", query: "landscape rake 36 inch aluminum" },
		{ name: "Geotextile fabric", blurb: "Lay it before the stone goes down and soft ground stops eating your gravel every spring.", query: "geotextile fabric driveway" },
		{ name: "Hand tamper", blurb: "Compacts the edges and touch-ups where the plate compactor can't reach.", query: "hand tamper earth" },
		{ name: "Wheelbarrow", blurb: "Fourteen tons doesn't move itself — a flat-free 6-cu-ft barrow survives the job.", query: "wheelbarrow 6 cubic foot flat free" },
	],
	wallpaper: [
		{ name: "Smoothing & hanging kit", blurb: "Smooths out bubbles and air pockets as you hang — the difference between flat and foamy.", query: "wallpaper smoothing kit" },
		{ name: "Wallpaper paste", blurb: "The right paste for your paper weight, mixed fresh — old buckets fail at the seams.", query: "wallpaper paste heavy duty clay" },
		{ name: "Seam roller", blurb: "One light pass on each seam presses the edge down before the paste sets.", query: "wallpaper seam roller" },
		{ name: "Snap-off knife", blurb: "A fresh blade every couple of panels tears nothing and drags nothing.", query: "snap off utility knife blades" },
	],
	"pizza-party": [
		{ name: "Pizza cutter", blurb: "A sharp wheel turns a whole pie into clean slices without dragging the toppings.", query: "pizza cutter wheel sharp" },
		{ name: "Pizza stone or steel", blurb: "For oven and grill pizzas that beat delivery — preheat 45 minutes for a crisp crust.", query: "pizza stone for oven grill" },
		{ name: "Pizza boxes & insulated bags", blurb: "Keeps pickup and transport hot until everyone gathers around the table.", query: "pizza boxes 14 inch insulated bag" },
		{ name: "Parchment sheets", blurb: "Non-stick baking for homemade party pizzas and an easy cleanup.", query: "parchment paper sheets baking" },
	],
	"chicken-wings": [
		{ name: "Air fryer", blurb: "Crispiest wings without frying oil — cook in batches and hold warm.", query: "air fryer large capacity" },
		{ name: "Wing sauce variety pack", blurb: "Mild to extra-hot so every guest finds their heat level.", query: "buffalo wing sauce variety pack" },
		{ name: "Instant-read thermometer", blurb: "Wings are done at 165°F in the thickest piece — no guessing, no pink.", query: "instant read meat thermometer" },
		{ name: "Wire baking rack", blurb: "Oven wings crisp on all sides when the heat can reach underneath.", query: "wire cooling rack baking sheet oven safe" },
	],
	"party-ice": [
		{ name: "Insulated cooler", blurb: "A quality cooler holds ice far longer than bags dumped in a bin.", query: "insulated cooler wheeled large" },
		{ name: "Reusable ice bags", blurb: "Portion bulk ice into bags for the drink cooler and the backup stash.", query: "reusable ice bags 10 lb" },
		{ name: "Beverage dispenser", blurb: "Self-serve drinks cut cooler traffic — and cooler traffic melts ice.", query: "beverage dispenser 2 gallon" },
		{ name: "Ice scoop & tongs", blurb: "Scoops keep hands out of the ice and the drinks food-safe.", query: "ice scoop metal tongs set" },
	],
	// Picks for calculators shipping in the current build wave — the strips go
	// live with those pages.
	"balloon-quantity": [
		{ name: "Balloon pump", blurb: "A hand or electric pump fills arches and garlands in minutes — air-filled ones never float anyway.", query: "balloon pump electric handheld" },
		{ name: "Arch strip kit", blurb: "The plastic strip and glue dots that turn loose balloons into a professional arch or garland.", query: "balloon arch strip kit glue dots" },
		{ name: "Helium regulator", blurb: "A good regulator and nozzle save helium and fingers on every fill.", query: "helium tank regulator valve balloon filler" },
	],
	"tire-size": [
		{ name: "Tread depth gauge", blurb: "Before sizing up, check what you have — 4/32 in is the wear line that matters.", query: "tire tread depth gauge" },
		{ name: "Tire pressure gauge", blurb: "Diameter math only lands right at the pressure the tire was sized for.", query: "tire pressure gauge digital" },
		{ name: "Wheel chocks", blurb: "Cheap insurance for every jack and tire-swap session in the driveway.", query: "wheel chocks rubber pair" },
	],
	"towing-capacity": [
		{ name: "Tongue weight scale", blurb: "You know the 10–15% range — this is the tool that tells you where you actually sit.", query: "trailer tongue weight scale" },
		{ name: "Weight-distribution hitch", blurb: "Moves tongue weight to the front axle and levels the ride on heavier trailers.", query: "weight distributing hitch kit" },
		{ name: "Brake controller", blurb: "Required on most trailers over 3,000 lb — proportional units stop smoothest.", query: "trailer brake controller" },
		{ name: "Ball mount kit", blurb: "The right drop and ball size keep the trailer level before anything else matters.", query: "trailer ball mount kit sizes" },
	],
	"train-scale-converter": [
		{ name: "Scale rule", blurb: "A dedicated scale rule reads dimensions directly in HO, N, and O — no math mid-project.", query: "model railroad scale rule" },
		{ name: "Starter track pack", blurb: "Nickel-silver track in the gauge your scale runs — match rail size to era.", query: "model train track pack nickel silver" },
		{ name: "Knuckle couplers", blurb: "Mates rolling stock across brands — the hobby default for a reason.", query: "model train knuckle couplers" },
	],
	"miniature-scale-converter": [
		{ name: "Digital caliper", blurb: "The fastest way to check a printed or purchased figure's actual height in millimeters.", query: "digital caliper 6 inch" },
		{ name: "Miniature paint set", blurb: "Contrast and speed paints flatter heroic proportions and finish a small army fast.", query: "miniature paint set starter" },
		{ name: "Basing kit", blurb: "Flock, tufts, and texture paste that make a converted figure look finished.", query: "miniature basing kit flock tufts" },
	],
	"filament-cost": [
		{ name: "Filament dry box", blurb: "Dry filament is the cheapest failure-rate reduction you can buy.", query: "filament dry box storage" },
		{ name: "Digital caliper", blurb: "Measure filament diameter to calibrate flow — 1.75 mm varies by brand.", query: "digital caliper 6 inch" },
		{ name: "PLA filament spool", blurb: "The workhorse material — dimensionally stable and forgiving on open printers.", query: "PLA filament 1.75mm 1kg" },
	],
	"resin-cost": [
		{ name: "Wash & cure station", blurb: "Consistent wash and cure turn a sticky print into a finished one, every batch.", query: "resin wash and cure station" },
		{ name: "Nitrile gloves & IPA", blurb: "The bare minimum for safe resin handling — gloves, 90%+ IPA, and ventilation.", query: "nitrile gloves isopropyl alcohol 99%" },
		{ name: "FEP film", blurb: "A spare vat film keeps one failed print from turning into a failed weekend.", query: "FEP film resin vat" },
	],
	"charcuterie-board": [
		{ name: "Wood serving board", blurb: "A big walnut or acacia board is the difference between a snack tray and a spread.", query: "large wood charcuterie serving board" },
		{ name: "Cheese knife set", blurb: "Soft-cheese knives, fork-tipped spears, and labels keep the board moving.", query: "cheese knife set with markers" },
		{ name: "Serving bowls", blurb: "Small bowls for olives, honey, and nuts hold the loose items in place.", query: "small serving bowls set condiment" },
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
	"deck-boards": { name: "Deck screw kit", blurb: "Boards counted — two fasteners per joist crossing adds up fast.", query: "deck screws exterior kit" },
	"deck-stain": { name: "Stain & pad applicator kit", blurb: "Gallons sorted — pads lay it flat and fast without lap marks.", query: "deck stain applicator pad kit" },
	sod: { name: "Lawn soil & topdressing", blurb: "Rolls ordered — screened soil under the seams makes the sod knit in.", query: "lawn topdressing soil screened" },
	rebar: { name: "Tie wire & pliers", blurb: "Bar count done — tie wire and a twisting tool hold the grid while you pour.", query: "rebar tie wire pliers set" },
	"gravel-driveway": { name: "Landscape rake", blurb: "Yards and tons known — a landscape rake turns the pile into a driveway.", query: "landscape rake 36 inch aluminum" },
	wallpaper: { name: "Smoothing & hanging kit", blurb: "Rolls counted — smooth out the bubbles as each sheet goes up.", query: "wallpaper smoothing kit" },
	"pizza-party": { name: "Pizza cutter", blurb: "Pizzas counted — a sharp wheel keeps every slice tidy.", query: "pizza cutter wheel sharp" },
	"chicken-wings": { name: "Air fryer", blurb: "Pounds to buy sorted — an air fryer crisps them without the deep fryer.", query: "air fryer large capacity" },
	"party-ice": { name: "Insulated cooler", blurb: "Bags counted — a good cooler is what keeps them frozen through the party.", query: "insulated cooler wheeled large" },
	"balloon-quantity": { name: "Balloon pump", blurb: "Counts done — a pump fills garlands and arches fast, no helium needed.", query: "balloon pump electric handheld" },
	"tire-size": { name: "Tread depth gauge", blurb: "Size picked — check the tread before you commit to a set.", query: "tire tread depth gauge" },
	"towing-capacity": { name: "Tongue weight scale", blurb: "Capacity known — verify the tongue weight actually sits at 10–15%.", query: "trailer tongue weight scale" },
	"train-scale-converter": { name: "Scale rule", blurb: "Dimensions converted — a scale rule reads them straight off the layout.", query: "model railroad scale rule" },
	"miniature-scale-converter": { name: "Digital caliper", blurb: "Scale math done — check real figure heights in millimeters.", query: "digital caliper 6 inch" },
	"filament-cost": { name: "Filament dry box", blurb: "Cost per print known — dry filament is the cheapest way to protect it.", query: "filament dry box storage" },
	"resin-cost": { name: "Wash & cure station", blurb: "Resin cost known — a consistent cure is what makes a print finished.", query: "resin wash and cure station" },
	"charcuterie-board": { name: "Wood serving board", blurb: "Amounts planned — a big board is what makes the spread read as one.", query: "large wood charcuterie serving board" },
};
