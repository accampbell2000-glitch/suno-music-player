// Context-fit recommendations for every calculator page.
// Amazon Associates is configured here; send every Amazon search through affiliateUrl.
// Bottom bands use three distinct alternatives to the in-calculator pick, with a clear paid-link label and site disclosure.

export const AMAZON_TAG = "calcforged-20";

type AffiliateProduct = { name: string; blurb: string; query: string };

const amazonUrl = (query: string) =>
	`https://www.amazon.com/s?k=${encodeURIComponent(query)}${AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ""}`;

export function affiliateUrl(query: string): string {
	return amazonUrl(query);
}

export const affiliateDisclosure: string = AMAZON_TAG
	? "As an Amazon Associate I earn from qualifying purchases."
	: "These are product recommendations. Any affiliate relationship is disclosed beside the link.";

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
	"christmas-lights": [
		{ name: "LED mini string lights", blurb: "Low draw means one outlet carries the whole tree, and cool bulbs stay safe on dry branches.", query: "led christmas string lights 100 count mini" },
		{ name: "C9 LED roofline strands", blurb: "Big classic bulbs built for gutters and eaves, at a fraction of the incandescent wattage.", query: "c9 led christmas lights strand outdoor" },
		{ name: "Light clips", blurb: "One clip per foot on the roofline keeps every run straight without nails or staples.", query: "christmas light clips gutters shingles" },
		{ name: "Outdoor light timer", blurb: "Set it once in November and the display turns itself on and off all season.", query: "outdoor christmas light timer photocell" },
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
	"battery-runtime": [
		{ name: "Battery monitor", blurb: "A monitor gives you a live reading; this estimate can't measure your battery's actual condition.", query: "12V battery monitor voltage meter car" },
		{ name: "Digital multimeter", blurb: "Check voltage and current against the accessory's real draw rather than a label guess.", query: "automotive digital multimeter" },
		{ name: "Smart battery charger", blurb: "Keep a vehicle battery charged with a charger matched to its chemistry and capacity.", query: "smart automotive battery charger 12V" },
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
	"fuel-mileage": [
		{ name: "Fuel mileage logbook", blurb: "Record fill-ups and odometer readings alongside your fuel-economy estimate.", query: "vehicle fuel mileage log book" },
	],
	"gig-driver-mileage-tracker": [
		{ name: "Vehicle mileage logbook", blurb: "Keep a paper backup of trip dates, odometer readings, and work miles.", query: "business vehicle mileage logbook" },
	],
};

// A compact partner pick shown inside selected calculators, under the results.
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
	"christmas-lights": { name: "Popular Christmas light strings", blurb: "Browse popular mini and C7/C9 strands for trees and rooflines. Compare bulb type, strand length, and indoor/outdoor rating.", query: "Christmas light strings 100 count mini C7 C9 warm white outdoor" },
	"party-ice": { name: "Insulated cooler", blurb: "Bags counted — a good cooler is what keeps them frozen through the party.", query: "insulated cooler wheeled large" },
	"balloon-quantity": { name: "Balloon pump", blurb: "Counts done — a pump fills garlands and arches fast, no helium needed.", query: "balloon pump electric handheld" },
	"tire-size": { name: "Tread depth gauge", blurb: "Size picked — check the tread before you commit to a set.", query: "tire tread depth gauge" },
	"towing-capacity": { name: "Tongue weight scale", blurb: "Capacity known — verify the tongue weight actually sits at 10–15%.", query: "trailer tongue weight scale" },
	"train-scale-converter": { name: "Scale rule", blurb: "Dimensions converted — a scale rule reads them straight off the layout.", query: "model railroad scale rule" },
	"miniature-scale-converter": { name: "Digital caliper", blurb: "Scale math done — check real figure heights in millimeters.", query: "digital caliper 6 inch" },
	"filament-cost": { name: "Filament dry box", blurb: "Cost per print known — dry filament is the cheapest way to protect it.", query: "filament dry box storage" },
	"resin-cost": { name: "Wash & cure station", blurb: "Resin cost known — a consistent cure is what makes a print finished.", query: "resin wash and cure station" },
	"charcuterie-board": { name: "Wood serving board", blurb: "Amounts planned — a big board is what makes the spread read as one.", query: "large wood charcuterie serving board" },
	"length-converter": { name: "Tape measure", blurb: "One tape, both unit systems — measure once, convert never.", query: "tape measure double sided metric" },
	"volume-converter": { name: "Measuring cup set", blurb: "Cups, ounces, and milliliters in one set — the converters' physical cousins.", query: "measuring cup set metric us" },
	"cups-to-grams": { name: "Digital kitchen scale", blurb: "Weigh ingredients instead of relying on volume when precision matters.", query: "digital kitchen scale grams" },
	area: { name: "Laser distance measure", blurb: "Measure room dimensions before entering them in the calculator.", query: "laser distance measure indoor" },
	"patio-pavers": { name: "Rubber paver mallet", blurb: "Adjust pavers while laying out a patio.", query: "rubber paver mallet" },
	mortgage: { name: "Homebuying document organizer", blurb: "Keep lender estimates, notes, and closing paperwork together.", query: "homebuying document organizer folder" },
	loan: { name: "Debt payoff planner", blurb: "Track balances and planned payments beside your loan estimate.", query: "debt payoff planner notebook" },
	"auto-loan-payoff": { name: "Car payment tracker", blurb: "Keep due dates and payoff notes with your vehicle records.", query: "car loan payment tracker notebook" },
	investment: { name: "Investment journal", blurb: "Record contributions and assumptions alongside your estimates.", query: "investment journal notebook" },
	savings: { name: "Budget planner", blurb: "Track savings goals and contributions in one place.", query: "budget planner savings goals notebook" },
	"compound-interest": { name: "Savings and investment journal", blurb: "Record starting balances and contribution assumptions for future comparisons.", query: "savings investment journal notebook" },
	bmi: { name: "Digital body-weight scale", blurb: "Use your own measured weight as a calculator input.", query: "digital body weight scale" },
	"walking-steps": { name: "Pedometer", blurb: "Count steps on a walk to compare with the estimate.", query: "pedometer step counter" },
	"calorie-tdee": { name: "Kitchen food scale", blurb: "For people who track portions, a scale measures ingredients by weight.", query: "digital kitchen food scale grams" },
	"pregnancy-due-date": { name: "Pregnancy planner", blurb: "Keep appointment dates and questions together for your care team.", query: "pregnancy planner journal appointments" },
	"currency-converter": { name: "Travel wallet", blurb: "Keep travel cards, cash, and documents organized.", query: "travel wallet passport organizer" },
	"time-zone": { name: "World time clock", blurb: "Check local times across regions while scheduling or traveling.", query: "world time zone clock" },
	percentage: { name: "Pocket calculator", blurb: "A handheld calculator for quick checks away from a browser.", query: "pocket calculator percent key" },
	"weight-converter": { name: "Digital luggage scale", blurb: "Check a bag's weight before heading to the airport.", query: "digital luggage scale" },
	tip: { name: "Server book", blurb: "Keep order notes, checks, and tip records in one pocket organizer.", query: "server book waiter pad" },
	age: { name: "Birthday calendar", blurb: "Keep birthdays and family milestones visible through the year.", query: "birthday calendar perpetual" },
	date: { name: "Daily planner", blurb: "Keep due dates, appointments, and date notes together.", query: "daily planner calendar notebook" },
	time: { name: "Digital stopwatch", blurb: "Track an elapsed interval alongside time calculations.", query: "digital stopwatch timer" },
	gpa: { name: "Academic planner", blurb: "Track assignment dates and term grades alongside GPA calculations.", query: "academic planner student semester" },
	"square-root-cube-root": { name: "Scientific calculator", blurb: "A handheld option for checking roots and other math.", query: "scientific calculator square root cube root" },
	"sandwich-quantity": { name: "Sandwich serving trays", blurb: "Organize prepared sandwiches for serving or pickup.", query: "sandwich serving trays catering" },
	"christmas-tree-water": { name: "Christmas tree watering funnel", blurb: "Refill a tree stand with a watering funnel made for holiday trees.", query: "christmas tree watering funnel" },
};

// Bottom-of-page options complement any in-calculator PartnerPick.
const affiliateBottomAlternatives: Record<string, AffiliateProduct[]> = {
	"catering-food-quantity": [
		{ name: "Buffet serving utensil set", blurb: "Add serving spoons and tongs for a self-service line.", query: "buffet serving utensil set" },
	],
	"taco-bar": [
		{ name: "Taco serving tongs", blurb: "Keep tortillas and toppings easy to reach on the serving line.", query: "taco serving tongs set" },
	],
	"restaurant-food-cost": [
		{ name: "Portion-control scoop set", blurb: "Use consistent scoop sizes when portioning menu items.", query: "restaurant portion control scoop set" },
		{ name: "Food storage labels", blurb: "Label prepared ingredients and containers in the kitchen.", query: "food storage labels kitchen" },
	],
	"recipe-scaling": [
		{ name: "Large mixing bowl set", blurb: "Give scaled recipes room to mix in batches.", query: "large mixing bowl set stainless steel" },
		{ name: "Baking conversion chart", blurb: "Keep common kitchen measurements visible while adjusting a recipe.", query: "baking measurement conversion chart magnet" },
	],
	"cups-to-grams": [
		{ name: "Dry measuring cup set", blurb: "Measure dry ingredients by volume for comparison with gram weights.", query: "dry measuring cup set stainless" },
		{ name: "Stainless measuring spoons", blurb: "Measure smaller recipe amounts across common spoon sizes.", query: "stainless steel measuring spoons set" },
		{ name: "Baking conversion chart", blurb: "Keep common volume and weight conversions handy in the kitchen.", query: "baking measurement conversion chart magnet" },
	],
	area: [
		{ name: "Tape measure", blurb: "Measure room and project dimensions before entering them here.", query: "metric imperial tape measure" },
		{ name: "Measuring wheel", blurb: "Measure longer outdoor distances for area estimates.", query: "measuring wheel distance" },
		{ name: "Grid paper pad", blurb: "Sketch a room or project footprint to keep dimensions organized.", query: "engineering graph paper pad" },
	],
	"patio-pavers": [
		{ name: "Paver edging", blurb: "Use edging to define the outside line of a paver layout.", query: "landscape paver edging spikes" },
		{ name: "Polymeric jointing sand", blurb: "A jointing material for filling gaps between patio pavers.", query: "polymeric jointing sand pavers" },
		{ name: "Paver spacers", blurb: "Keep consistent joints while laying out a paver surface.", query: "patio paver spacers" },
	],
	mortgage: [
		{ name: "Financial calculator", blurb: "Compare payment and interest scenarios alongside this estimate.", query: "financial calculator mortgage" },
		{ name: "Home budget planner", blurb: "Organize expected housing costs and monthly household expenses.", query: "home budget planner monthly expenses" },
		{ name: "Mortgage amortization workbook", blurb: "Record loan balance and payment scenarios for comparison.", query: "mortgage amortization workbook" },
	],
	loan: [
		{ name: "Financial calculator", blurb: "Run payment and interest calculations away from a browser.", query: "financial calculator loan amortization" },
		{ name: "Debt payoff worksheet", blurb: "Track balances and planned payments across loans.", query: "debt payoff worksheet planner" },
		{ name: "Bill-tracking budget binder", blurb: "Keep monthly bills, due dates, and budget notes together.", query: "budget binder bill tracker" },
	],
	"auto-loan-payoff": [
		{ name: "Vehicle expense logbook", blurb: "Keep vehicle costs and maintenance notes in one record.", query: "vehicle expense logbook car maintenance" },
		{ name: "Auto loan amortization calculator", blurb: "Compare a handheld payment calculation with this payoff estimate.", query: "auto loan amortization calculator" },
		{ name: "Vehicle document organizer", blurb: "Store registration, insurance, and loan paperwork together.", query: "vehicle document organizer folder" },
	],
	investment: [
		{ name: "Portfolio tracker journal", blurb: "Record balances, contributions, and assumptions for later review.", query: "investment portfolio tracker journal" },
		{ name: "Financial calculator", blurb: "Check contribution and return scenarios with a handheld tool.", query: "financial calculator investment" },
		{ name: "Asset allocation workbook", blurb: "Organize portfolio notes and allocation assumptions.", query: "asset allocation workbook investing" },
	],
	savings: [
		{ name: "Savings challenge binder", blurb: "Track deposits toward a savings goal with a paper ledger.", query: "savings challenge binder envelopes" },
		{ name: "Cash envelope wallet", blurb: "Separate cash categories with a portable envelope organizer.", query: "cash envelope wallet budget" },
		{ name: "Savings goal tracker", blurb: "Record target amounts and contributions over time.", query: "savings goal tracker notebook" },
	],
	"compound-interest": [
		{ name: "Compound interest workbook", blurb: "Work through contribution and compounding scenarios on paper.", query: "compound interest workbook savings" },
		{ name: "Financial calculator", blurb: "Check interest and contribution calculations with a handheld tool.", query: "financial calculator compounding interest" },
		{ name: "Savings goal chart", blurb: "Track deposits and milestones alongside the estimate.", query: "savings goal tracker chart" },
	],
	bmi: [
		{ name: "Height measuring tape", blurb: "Measure height for the calculator's height input.", query: "height measuring tape wall adult" },
		{ name: "Body measurement journal", blurb: "Keep personal measurement notes together if you choose to track them.", query: "body measurement journal notebook" },
		{ name: "Body measuring tape", blurb: "A flexible tape for recording body measurements.", query: "body measuring tape measurements" },
	],
	"walking-steps": [
		{ name: "Walking shoes", blurb: "Footwear for walking routes and everyday step-count goals.", query: "walking shoes adults" },
		{ name: "Reflective walking vest", blurb: "Add visibility for walks near traffic or in low light.", query: "reflective vest walking running" },
		{ name: "Walking waist pack", blurb: "Carry a phone and small essentials while walking.", query: "walking waist pack phone" },
	],
	"calorie-tdee": [
		{ name: "Meal prep containers", blurb: "Portion meals into containers for weekday storage.", query: "meal prep containers set" },
		{ name: "Portion-control plates", blurb: "Use marked sections to organize meal portions at serving time.", query: "portion control plate" },
		{ name: "Food journal", blurb: "Keep meal notes alongside personal estimates if you track them.", query: "food journal meal tracker notebook" },
	],
	"pregnancy-due-date": [
		{ name: "Pregnancy journal", blurb: "Keep questions, appointment notes, and personal milestones together.", query: "pregnancy journal appointment notes" },
		{ name: "Prenatal appointment notebook", blurb: "Organize questions and notes for prenatal appointments.", query: "prenatal appointment notebook pregnancy" },
		{ name: "Birth plan organizer", blurb: "Write down preferences and discussion points for your care team.", query: "birth plan organizer notebook" },
	],
	"currency-converter": [
		{ name: "Passport organizer", blurb: "Keep travel documents and cards together on a trip.", query: "travel passport organizer wallet" },
		{ name: "Travel money belt", blurb: "Carry travel documents and cash close to you while traveling.", query: "travel money belt passport" },
		{ name: "Pocket currency conversion guide", blurb: "Keep a printed conversion reference handy when traveling.", query: "currency conversion pocket guide travel" },
	],
	"time-zone": [
		{ name: "Dual time-zone clock", blurb: "Display two local times for scheduling across regions.", query: "dual time zone clock" },
		{ name: "Travel alarm clock", blurb: "Keep a small clock available when working or traveling away from home.", query: "travel alarm clock digital" },
		{ name: "World time desk clock", blurb: "Check several local times while planning calls across regions.", query: "world time desk clock multiple time zones" },
	],
	percentage: [
		{ name: "Scientific calculator", blurb: "A handheld option for percentage and other math checks.", query: "scientific calculator percent function" },
		{ name: "Financial calculator", blurb: "Use a dedicated handheld tool for financial percentage calculations.", query: "financial calculator percentage" },
		{ name: "Math reference cards", blurb: "Keep common formulas and percentage rules nearby for study.", query: "math formula reference cards percentage" },
	],
	"weight-converter": [
		{ name: "Shipping scale", blurb: "Weigh parcels before preparing them for mailing.", query: "digital shipping scale postal" },
		{ name: "Kitchen scale", blurb: "Measure ingredients by weight in the kitchen.", query: "digital kitchen scale grams ounces" },
		{ name: "Bathroom scale", blurb: "Measure body weight when you need a physical reading.", query: "digital bathroom scale" },
	],
	"length-converter": [
		{ name: "Metric ruler", blurb: "Measure small items directly in metric units.", query: "metric ruler centimeters inches" },
		{ name: "Digital caliper", blurb: "Measure small widths and diameters in metric or inch units.", query: "digital caliper metric inch" },
		{ name: "Measuring wheel", blurb: "Measure longer distances across a floor or outdoor space.", query: "measuring wheel distance" },
	],
	"volume-converter": [
		{ name: "Liquid measuring cup", blurb: "Measure liquid ingredients in common kitchen units.", query: "glass liquid measuring cup ounces milliliters" },
		{ name: "Measuring spoon set", blurb: "Measure small liquid and dry ingredients by volume.", query: "measuring spoons set stainless" },
		{ name: "Graduated beaker set", blurb: "Read liquid volumes from marked containers for projects or recipes.", query: "graduated measuring beaker set" },
	],
	tip: [
		{ name: "Server wallet", blurb: "Keep checks and small work essentials organized during a shift.", query: "waiter server wallet check presenter" },
		{ name: "Waitstaff calculator", blurb: "Use a handheld calculator for tip and bill arithmetic.", query: "pocket calculator tip percentage" },
		{ name: "Server apron", blurb: "Carry pens and small service supplies during a shift.", query: "waiter server apron pockets" },
	],
	age: [
		{ name: "Perpetual calendar", blurb: "Track birthdays and recurring dates without replacing the calendar each year.", query: "perpetual birthday calendar" },
		{ name: "Family wall calendar", blurb: "Keep birthdays and family events visible at home.", query: "family wall calendar birthdays" },
		{ name: "Birthday reminder book", blurb: "Write down birthdays and milestone dates in one place.", query: "birthday reminder book address book" },
	],
	date: [
		{ name: "Desk calendar", blurb: "Keep dates and short reminders visible while working.", query: "desk calendar monthly" },
		{ name: "Monthly planner pad", blurb: "Lay out deadlines and appointments by month.", query: "monthly planner pad dates" },
		{ name: "Perpetual date stamp", blurb: "Mark dates on paperwork without writing them by hand.", query: "perpetual date stamp" },
	],
	time: [
		{ name: "Kitchen timer", blurb: "Track a timed interval while you work or prepare food.", query: "digital kitchen timer" },
		{ name: "Wall clock", blurb: "Keep the current time visible in a workspace.", query: "wall clock easy read" },
		{ name: "Time log notebook", blurb: "Record start times, end times, and elapsed work periods.", query: "time log notebook work hours" },
	],
	gpa: [
		{ name: "Grade tracker notebook", blurb: "Record course grades and assignment results through a term.", query: "student grade tracker notebook" },
		{ name: "Graphing calculator", blurb: "A handheld tool for coursework that uses graphing and advanced math.", query: "graphing calculator student" },
		{ name: "Semester gradebook", blurb: "Organize course names, assignment scores, and term totals.", query: "student semester gradebook planner" },
	],
	"square-root-cube-root": [
		{ name: "Math reference handbook", blurb: "Keep formulas and worked examples nearby for study.", query: "math reference handbook algebra roots" },
		{ name: "Graph paper notebook", blurb: "Sketch equations and organize math work on a grid.", query: "graph paper notebook math" },
		{ name: "Geometry tool set", blurb: "Use a ruler, compass, and protractor for math exercises.", query: "geometry set ruler compass protractor" },
	],
	"wedding-dessert-table": [
		{ name: "Cake knife and server set", blurb: "Serve cake and plated desserts at a reception.", query: "wedding cake knife and server set" },
	],
	"catering-price-per-person": [
		{ name: "Portion-control scoop set", blurb: "Use consistent scoop sizes when serving menu portions.", query: "portion control scoop set restaurant" },
		{ name: "Menu costing workbook", blurb: "Organize ingredient costs and selling prices for menu items.", query: "restaurant menu costing workbook" },
		{ name: "Food container labels", blurb: "Mark prepared ingredients and storage containers in the kitchen.", query: "food container labels kitchen" },
	],
	"appetizers-per-person": [
		{ name: "Food warming trays", blurb: "Keep prepared appetizers organized for buffet service.", query: "electric food warming tray buffet" },
	],
	"yarn-yardage": [
		{ name: "Knitting needle set", blurb: "Keep a range of needle sizes available for different projects.", query: "knitting needle set interchangeable" },
	],
	"balloon-quantity": [
		{ name: "Assorted latex balloons", blurb: "Choose colors and sizes for the planned arrangement.", query: "latex balloons assorted colors party" },
	],
	"fuel-mileage": [
		{ name: "OBD2 scanner", blurb: "Read vehicle diagnostic data alongside your mileage notes.", query: "OBD2 scanner car" },
		{ name: "Digital tire pressure gauge", blurb: "Check tire pressure and keep the reading with vehicle records.", query: "digital tire pressure gauge car" },
	],
	"gig-driver-mileage-tracker": [
		{ name: "Phone car mount", blurb: "Keep navigation visible from a mounted phone while driving.", query: "car phone mount dashboard" },
		{ name: "Insulated delivery bag", blurb: "Carry food orders in a bag made for delivery trips.", query: "insulated delivery bag food" },
	],
	"tire-size": [
		{ name: "Automotive torque wrench", blurb: "Tighten wheel fasteners to the vehicle maker's specified torque.", query: "automotive torque wrench lug nuts" },
	],
	"train-scale-converter": [
		{ name: "Model railroad turnout", blurb: "Add a switching section sized for your model track scale.", query: "model railroad turnout track" },
	],
	"miniature-scale-converter": [
		{ name: "Miniature detail brush set", blurb: "Use fine brushes for small figures and painted details.", query: "miniature detail paint brush set" },
	],
	"filament-cost": [
		{ name: "3D printer nozzle set", blurb: "Keep compatible replacement nozzles available for routine changes.", query: "3d printer brass nozzle set 0.4mm" },
	],
	"resin-cost": [
		{ name: "Silicone work mat", blurb: "Protect a work surface during resin printing cleanup.", query: "silicone mat resin 3d printing" },
	],
	"sandwich-quantity": [
		{ name: "Catering sandwich boxes", blurb: "Pack prepared sandwiches for pickup or delivery.", query: "catering sandwich boxes disposable" },
		{ name: "Sandwich cutter", blurb: "Cut prepared sandwiches into consistent portions.", query: "commercial sandwich cutter" },
		{ name: "Serving tongs", blurb: "Set out utensils for self-service sandwich platters.", query: "stainless serving tongs buffet" },
	],
	"charcuterie-board": [
		{ name: "Cheese board labels", blurb: "Mark cheese names and dietary notes on a serving spread.", query: "cheese board labels markers" },
	],
	"christmas-tree-water": [
		{ name: "Christmas tree stand", blurb: "Choose a stand with a reservoir sized for your tree.", query: "christmas tree stand water reservoir" },
		{ name: "Tree stand water level alarm", blurb: "Get a reminder when the stand's water level needs attention.", query: "christmas tree stand water level alarm" },
		{ name: "Christmas tree stand mat", blurb: "Place a protective mat under the tree stand to catch drips.", query: "christmas tree stand protective mat" },
	],
};

export function affiliateBottomPicks(slug: string): AffiliateProduct[] {
	const topQuery = affiliateTopPicks[slug]?.query;
	const picked: AffiliateProduct[] = [];
	for (const pick of [...(affiliatePicks[slug] ?? []), ...(affiliateBottomAlternatives[slug] ?? [])]) {
		if (pick.query === topQuery || picked.some((item) => item.query === pick.query)) continue;
		picked.push(pick);
		if (picked.length === 3) break;
	}
	return picked;
}
