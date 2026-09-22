export type Category =
  | "Food & Catering"
  | "Home Improvement"
  | "Construction"
  | "Events"
  | "Business"
  | "Hobbies"
  | "Automotive"
  | "Everyday Life"
  | "Finance"
  | "Health"
  | "Travel"
  | "Education";

export type FieldOption = { label: string; value: string };
export type FieldDefinition = {
  key: string;
  label: string;
  type: "number" | "select" | "text" | "ingredient-list";
  /** Dependent dropdown: the key of another select field whose value picks the option set from `optionsMap`. */
  optionsFor?: string;
  optionsMap?: Record<string, FieldOption[]>;
  unit?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  defaultValue?: string | number;
  options?: FieldOption[];
  help?: string;
  defaultToday?: boolean;
};

export type ResultDefinition = {
  key: string;
  label: string;
  unit?: string;
  format?: "number" | "currency" | "percent" | "text";
  estimate?: boolean;
  interpretation?: string;
};

export type CalculatorValues = Record<string, string | number | IngredientRow[]>;
export type IngredientRow = { ingredient: string; amount: string; unit: string };
export type CalculationOutput = Record<string, string | number>;

export type CalculatorDefinition = {
  slug: string;
  name: string;
  category: Category;
  categorySlug: string;
  description: string;
  icon: string;
  fields: FieldDefinition[];
  results: ResultDefinition[];
  calculate: (values: CalculatorValues) => CalculationOutput;
  photoScan?: boolean;
  howItWorks: string[];
  example: { title: string; inputs: string; result: string };
  faqs: { question: string; answer: string }[];
  seo: { title: string; description: string; h1: string; intro: string };
  related: string[];
  liveRates?: boolean;
};

const n = (values: CalculatorValues, key: string, fallback = 0) => {
  const raw = values[key];
  if (raw === undefined || raw === null || raw === "") return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
};
const option = (values: CalculatorValues, key: string, fallback: string) =>
  String(values[key] ?? fallback);
const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const ceil = (value: number) => Math.ceil(value);

const CURRENCIES: FieldOption[] = [
  { label: "US Dollar (USD)", value: "USD" }, { label: "Euro (EUR)", value: "EUR" }, { label: "British Pound (GBP)", value: "GBP" },
  { label: "Japanese Yen (JPY)", value: "JPY" }, { label: "Canadian Dollar (CAD)", value: "CAD" }, { label: "Australian Dollar (AUD)", value: "AUD" },
  { label: "Swiss Franc (CHF)", value: "CHF" }, { label: "Chinese Yuan (CNY)", value: "CNY" }, { label: "Mexican Peso (MXN)", value: "MXN" }, { label: "Indian Rupee (INR)", value: "INR" },
];
const FALLBACK_RATES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.37, AUD: 1.52, CHF: 0.88, CNY: 7.2, MXN: 17.9, INR: 83.5 };

const ZONES: FieldOption[] = [
  { label: "New York · Eastern", value: "America/New_York" }, { label: "Chicago · Central", value: "America/Chicago" },
  { label: "Denver · Mountain", value: "America/Denver" }, { label: "Phoenix · Mountain (no DST)", value: "America/Phoenix" },
  { label: "Los Angeles · Pacific", value: "America/Los_Angeles" }, { label: "Anchorage · Alaska", value: "America/Anchorage" },
  { label: "Honolulu · Hawaii", value: "Pacific/Honolulu" }, { label: "São Paulo", value: "America/Sao_Paulo" },
  { label: "London", value: "Europe/London" }, { label: "Paris", value: "Europe/Paris" }, { label: "Berlin", value: "Europe/Berlin" },
  { label: "Moscow", value: "Europe/Moscow" }, { label: "Dubai", value: "Asia/Dubai" }, { label: "Mumbai", value: "Asia/Kolkata" },
  { label: "Singapore", value: "Asia/Singapore" }, { label: "Tokyo", value: "Asia/Tokyo" }, { label: "Sydney", value: "Australia/Sydney" },
  { label: "Auckland", value: "Pacific/Auckland" }, { label: "UTC", value: "UTC" },
];

const parseYmd = (value: string) => {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
};
const addDaysUtc = (date: Date, days: number) => new Date(date.getTime() + days * 86400000);
const fmtDate = (date: Date) => date.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });

const tzOffsetMs = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second")) - date.getTime();
};
const zonedToUtc = (dateStr: string, timeStr: string, timeZone: string) => {
  const date = parseYmd(dateStr);
  if (!date) return null;
  const [h, m] = String(timeStr ?? "").trim().split(":").map(Number);
  if (!Number.isFinite(h) || h < 0 || h > 23 || (Number.isFinite(m) && (m < 0 || m > 59))) return null;
  const naive = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, Number.isFinite(m) ? m : 0);
  let guess = new Date(naive - tzOffsetMs(new Date(naive), timeZone));
  guess = new Date(naive - tzOffsetMs(guess, timeZone));
  return guess;
};
const zoneStamp = (date: Date, timeZone: string) => new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
const zoneDiffLabel = (fromZone: string, toZone: string, at: Date) => {
  const minutes = Math.round((tzOffsetMs(at, toZone) - tzOffsetMs(at, fromZone)) / 60000);
  const sign = minutes < 0 ? "−" : "+";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return `${sign}${hours} hr${mins ? ` ${mins} min` : ""}`;
};

const GPA_POINTS: Record<string, number> = { "A+": 4, A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7, "C+": 2.3, C: 2, "C-": 1.7, "D+": 1.3, D: 1, "D-": 0.7, F: 0 };

// Standard LT flotation tire sizes (height × width × rim, inches) offered by
// the major truck-tire makers. Nominal width — actual measured width runs
// ~0.1–0.3 in narrower depending on the wheel.
const FLOTATION_SIZES: { d: number; w: number; rim: number }[] = [
  { d: 30, w: 9.50, rim: 15 }, { d: 31, w: 10.50, rim: 15 }, { d: 32, w: 11.50, rim: 15 },
  { d: 33, w: 12.50, rim: 15 }, { d: 33, w: 12.50, rim: 17 }, { d: 33, w: 12.50, rim: 18 }, { d: 33, w: 12.50, rim: 20 },
  { d: 34, w: 10.50, rim: 17 }, { d: 34, w: 11.50, rim: 17 },
  { d: 35, w: 12.50, rim: 15 }, { d: 35, w: 12.50, rim: 17 }, { d: 35, w: 12.50, rim: 18 }, { d: 35, w: 12.50, rim: 20 },
  { d: 37, w: 12.50, rim: 17 }, { d: 37, w: 12.50, rim: 20 }, { d: 37, w: 13.50, rim: 20 },
];

// Towing-capacity table — SAFETY DATA. Every number below was verified on
// 2026-09-22 against the manufacturer's own towing guide or specification
// pages (manufacturer and manufacturer-quoting dealer sources). The stored
// value is the common configuration's maximum conventional towing (lb); where
// trims vary wildly the typical mid configuration is stored and the verified
// range is spelled out in the row note. Models that could not be verified from
// a manufacturer source were left out entirely — never estimated.
const TOWING_TABLE: { make: string; model: string; lb: number; note?: string }[] = [  { make: "Ford", model: "F-150", lb: 12800, note: "5.0L V8 typical; the lineup spans 8,400 (2.7L EcoBoost) to 13,500 (3.5L EcoBoost with the Max Tow axle)." },
  { make: "Ford", model: "Ranger", lb: 7500, note: "With the Trailer Tow Package; without it, 3,500." },
  { make: "Ford", model: "Maverick", lb: 4000, note: "2.0L EcoBoost with the 4K Tow Package; hybrid models are rated 2,000." },
  { make: "Ford", model: "Bronco", lb: 3500, note: "Bronco Raptor is rated 4,500." },
  { make: "Ford", model: "Expedition", lb: 9600, note: "4x2 with the Heavy-Duty Trailer Tow Package." },
  { make: "Ford", model: "Explorer", lb: 5000 },
  { make: "Ford", model: "Transit", lb: 6900, note: "3.5L EcoBoost builds; the base 3.5L V6 runs about 4,500." },
  { make: "Chevrolet", model: "Silverado 1500", lb: 11300, note: "5.3L V8 typical; spans 9,500 (2.7L TurboMax) to 13,300 (3.0L Duramax or 6.2L with Max Trailering)." },
  { make: "Chevrolet", model: "Colorado", lb: 7700 },
  { make: "Chevrolet", model: "Tahoe", lb: 8400, note: "5.3L V8 with the Max Trailering Package." },
  { make: "Chevrolet", model: "Suburban", lb: 8200, note: "5.3L V8 2WD with the Max Trailering Package." },
  { make: "Chevrolet", model: "Traverse", lb: 5000, note: "V92 trailering equipment is standard on all trims." },
  { make: "Chevrolet", model: "Express", lb: 9600, note: "2500/3500 passenger van; a 3500 cargo V8 reaches 10,000." },
  { make: "GMC", model: "Sierra 1500", lb: 11300, note: "5.3L typical; spans 8,800 to 13,300 (3.0L Duramax with Max Trailering)." },
  { make: "GMC", model: "Canyon", lb: 7700 },
  { make: "GMC", model: "Yukon", lb: 8400, note: "5.3L V8; the 6.2L is rated 8,000 and the Duramax 8,200." },
  { make: "RAM", model: "1500", lb: 11550, note: "2025–2026 properly equipped max; 2019–2024 models with the 5.7L HEMI and Max Tow reached 12,750." },
  { make: "RAM", model: "ProMaster", lb: 6910 },
  { make: "Toyota", model: "Tacoma", lb: 6500, note: "SR5/TRD PreRunner i-FORCE; hybrid trims are rated 6,000." },
  { make: "Toyota", model: "Tundra", lb: 12000 },
  { make: "Toyota", model: "Sequoia", lb: 9520 },
  { make: "Toyota", model: "4Runner", lb: 6000, note: "i-FORCE MAX hybrid; gas trims run 5,000–5,800." },
  { make: "Toyota", model: "Highlander", lb: 5000, note: "2.4L turbo gas; hybrid models are rated 3,500." },
  { make: "Toyota", model: "Sienna", lb: 3500, note: "Hybrid, all trims." },
  { make: "Honda", model: "Ridgeline", lb: 5000, note: "All trims." },
  { make: "Honda", model: "Passport", lb: 5000 },
  { make: "Honda", model: "Pilot", lb: 5000, note: "With the tow package; base trims are rated 3,500." },
  { make: "Honda", model: "Odyssey", lb: 3500 },
  { make: "Jeep", model: "Grand Cherokee", lb: 6200 },
  { make: "Jeep", model: "Wrangler", lb: 5000, note: "2-door with Max Tow; the 4xe is rated 3,500." },
  { make: "Jeep", model: "Gladiator", lb: 7700, note: "Max Tow Package with the 4.10 axle." },
  { make: "Dodge", model: "Durango", lb: 6200, note: "3.6L V6; the V8 Tow 'n Go package reaches 8,700." },
  { make: "Nissan", model: "Frontier", lb: 6960, note: "Crew Cab 4x4; the lineup spans 6,760–7,150." },
  { make: "Nissan", model: "Pathfinder", lb: 6000, note: "Rock Creek/Platinum, or SV/SL with the Premium Package; base is 3,500." },
  { make: "Nissan", model: "Armada", lb: 8500, note: "All trims." },
  { make: "Hyundai", model: "Santa Cruz", lb: 5000, note: "2.5T with HTRAC AWD; the base 2.5L is rated 3,500." },
  { make: "Hyundai", model: "Palisade", lb: 5000 },
  { make: "Hyundai", model: "Santa Fe", lb: 4500 },
  { make: "Kia", model: "Telluride", lb: 5500, note: "Tow package on higher trims; base is 5,000." },
  { make: "Kia", model: "Sorento", lb: 4500 },
  { make: "Kia", model: "Carnival", lb: 3500, note: "Top trims; base is 2,500." },
  { make: "Volkswagen", model: "Atlas", lb: 5000, note: "2.0T with the tow package." },
  { make: "Subaru", model: "Ascent", lb: 5000, note: "All trims." },
  { make: "Mazda", model: "CX-90", lb: 5000, note: "3.3L Turbo S; the standard turbo and PHEV are rated 3,500." },
];

// Dropdown sources derived from the verified table itself, so the lists can
// never drift from the data.
const TOWING_MAKES = [...new Set(TOWING_TABLE.map((row) => row.make))].sort();
const TOWING_MODEL_OPTIONS: Record<string, { label: string; value: string }[]> = Object.fromEntries(
  TOWING_MAKES.map((make) => [
    make,
    TOWING_TABLE.filter((row) => row.make === make)
      .map((row) => ({ label: row.model, value: row.model }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ])
);

const definitions: CalculatorDefinition[] = [
  {
    slug: "catering-food-quantity",
    name: "Catering Food Quantity Calculator",
    category: "Food & Catering",
    categorySlug: "food-catering",
    icon: "🍽",
    description: "Estimate how much food to plan for a catered meal without overbuying.",
    fields: [
      { key: "guests", label: "Adult guests", type: "number", unit: "people", min: 1, max: 10000, defaultValue: 50 },
      { key: "eventType", label: "Event type", type: "select", defaultValue: "dinner", options: [{ label: "Dinner", value: "dinner" }, { label: "Lunch", value: "lunch" }, { label: "Cocktail reception", value: "cocktail" }] },
      { key: "mealType", label: "Meal format", type: "select", defaultValue: "full", options: [{ label: "Full meal", value: "full" }, { label: "Light meal", value: "light" }, { label: "Heavy appetizers", value: "appetizers" }] },
    ],
    results: [
      { key: "total", label: "Total food", unit: "lb", format: "number", estimate: true, interpretation: "A planning estimate for the entire meal." },
      { key: "protein", label: "Protein", unit: "lb", format: "number", estimate: true },
      { key: "sides", label: "Sides", unit: "lb", format: "number", estimate: true },
      { key: "salads", label: "Salads", unit: "lb", format: "number", estimate: true },
      { key: "dessert", label: "Dessert", unit: "lb", format: "number", estimate: true },
      { key: "beverages", label: "Beverages", unit: "servings", format: "number", estimate: true },
    ],
    calculate: (v) => {
      const guests = n(v, "guests", 50);
      const multiplier = option(v, "mealType", "full") === "light" ? 1 : option(v, "mealType", "full") === "appetizers" ? 0.75 : 1.25;
      const total = guests * multiplier;
      return { total: round(total), protein: round(total * 0.35), sides: round(total * 0.35), salads: round(total * 0.15), dessert: round(total * 0.1), beverages: ceil(guests * 2) };
    },
    howItWorks: ["Start with roughly 1 to 1.5 pounds of food per adult for a full meal.", "This estimate uses 1.25 pounds per adult, then allocates the total across protein, sides, salads, and dessert.", "Beverages are planned at about two servings per guest; add more for long events or hot weather."],
    example: { title: "50-person dinner", inputs: "50 adults, full meal", result: "About 62.5 lb of food, including 21.9 lb protein and 21.9 lb sides." },
    faqs: [{ question: "How much food should I plan per person?", answer: "A common catering planning range is about 1 to 1.5 pounds of food per adult per meal. This calculator uses 1.25 pounds for a full meal." }, { question: "Does this include beverages?", answer: "Yes. The beverage result is shown separately at an estimate of two servings per guest." }, { question: "Should I add a buffer?", answer: "For buffet service, large appetites, or events longer than three hours, consider adding 5 to 10 percent." }, { question: "Are these exact quantities?", answer: "No. Catering quantities vary by menu, service style, guest mix, and event length, so treat the results as planning estimates." }],
    seo: { title: "Catering Food Quantity Calculator | CalcForged", description: "Estimate food, protein, sides, salads, dessert, and beverages for your next catered meal.", h1: "Catering food quantity calculator", intro: "Planning a catered meal is easier when every menu category has a number behind it. Enter your adult guest count and meal format to get a practical estimate for total food, protein, sides, salads, dessert, and beverages. The calculator follows a common catering guideline of roughly 1 to 1.5 pounds of food per adult per meal, then breaks that total into useful buying categories. Use it for a family gathering, office lunch, graduation party, or any event where you need a clear starting point before you build the menu." },
    related: ["bbq-meat", "taco-bar", "wedding-food"],
  },
  {
    slug: "bbq-meat", name: "BBQ Meat Calculator", category: "Food & Catering", categorySlug: "food-catering", icon: "🔥", description: "Work backward from servings to the raw meat weight you need to buy.",
    fields: [{ key: "guests", label: "Guests", type: "number", unit: "people", min: 1, max: 10000, defaultValue: 30 }, { key: "meat", label: "Meat selection", type: "select", defaultValue: "brisket", options: [{ label: "Brisket", value: "brisket" }, { label: "Pulled pork", value: "pork" }, { label: "Ribs", value: "ribs" }, { label: "Sausage", value: "sausage" }, { label: "Chicken", value: "chicken" }] }, { key: "serving", label: "Cooked meat per guest", type: "number", unit: "oz", min: 2, max: 24, step: 0.5, defaultValue: 6 }],
    results: [{ key: "raw", label: "Raw meat to buy", unit: "lb", format: "number", estimate: true, interpretation: "Includes the selected cooking yield." }, { key: "cooked", label: "Cooked meat", unit: "lb", format: "number" }, { key: "yield", label: "Expected yield", unit: "%", format: "percent" }],
    calculate: (v) => { const guests = n(v, "guests", 30); const cooked = guests * n(v, "serving", 6) / 16; const meat = option(v, "meat", "brisket"); const yields: Record<string, number> = { brisket: 0.5, pork: 0.575, ribs: 0.525, sausage: 0.8, chicken: 0.675 }; const y = yields[meat] ?? 0.5; return { raw: round(cooked / y), cooked: round(cooked), yield: y }; },
    howItWorks: ["Multiply guests by the cooked ounces each person will eat, then convert ounces to pounds.", "Divide cooked pounds by the typical raw-to-cooked yield for the selected meat.", "The yield accounts for trimming, moisture loss, and bones where applicable."],
    example: { title: "30 guests with brisket", inputs: "30 guests at 6 oz cooked each", result: "About 22.5 lb raw brisket at a 50% yield." },
    faqs: [{ question: "Why do I need more raw brisket than cooked meat?", answer: "Brisket loses weight from trimming and cooking. A 50% yield is a common planning estimate, so two raw pounds produces about one cooked pound." }, { question: "Are ribs calculated by edible meat?", answer: "This estimate uses a lower yield to account for bones and cooking loss. Buy extra if ribs are the only main dish." }, { question: "How much BBQ meat is one serving?", answer: "Six cooked ounces is a practical starting point for a meal with sides; use 8 ounces for meat-forward events." }, { question: "Should I add a safety margin?", answer: "Add 5 to 10 percent if guests are heavy eaters or you want leftovers." }],
    seo: { title: "BBQ Meat Calculator – How Much Meat Per Person | CalcForged", description: "Calculate raw brisket, pork, ribs, sausage, or chicken to buy for any BBQ guest count.", h1: "BBQ meat calculator", intro: "Buying BBQ meat is a yield problem: the weight you put on the smoker is not the weight that reaches the plate. Enter your guest count, choose a meat, and set the cooked serving size to estimate how many raw pounds to buy. CalcForged uses common raw-to-cooked yield ranges—about 50% for brisket, 55–60% for pork butt, 50–55% for ribs, and 65–70% for chicken—so the result is a practical starting point rather than a false promise of precision." },
    related: ["catering-food-quantity", "taco-bar", "wedding-food"],
  },
  {
    slug: "taco-bar", name: "Taco Bar Calculator", category: "Food & Catering", categorySlug: "food-catering", icon: "🌮", description: "Plan tacos, cooked meat, tortillas, toppings, and sides for a crowd.",
    fields: [{ key: "adults", label: "Adults", type: "number", unit: "people", min: 0, max: 10000, defaultValue: 25 }, { key: "children", label: "Children", type: "number", unit: "people", min: 0, max: 10000, defaultValue: 10 }, { key: "ozPerTaco", label: "Cooked meat per taco", type: "number", unit: "oz", min: 2, max: 4, step: 0.5, defaultValue: 3 }],
    results: [{ key: "tacos", label: "Tacos", unit: "tacos", format: "number", estimate: true }, { key: "meat", label: "Cooked meat", unit: "lb", format: "number", estimate: true }, { key: "tortillas", label: "Tortillas", unit: "tortillas", format: "number", estimate: true }, { key: "toppings", label: "Topping servings", unit: "servings", format: "number", estimate: true }, { key: "sides", label: "Side servings", unit: "servings", format: "number", estimate: true }],
    calculate: (v) => { const adults = n(v, "adults", 25); const children = n(v, "children", 10); const tacos = adults * 2 + children; const meat = tacos * n(v, "ozPerTaco", 3) / 16; return { tacos: ceil(tacos), meat: round(meat), tortillas: ceil(tacos * 1.2), toppings: ceil((adults + children) * 3), sides: ceil((adults + children) * 0.75) }; },
    howItWorks: ["Plan about two tacos per adult and one taco per child.", "Multiply tacos by 2 to 4 ounces of cooked meat per taco; this calculator starts at 3 ounces.", "Tortillas include a 20% cushion for breakage, and toppings are estimated at three servings per guest across the topping spread."],
    example: { title: "35-person taco bar", inputs: "25 adults, 10 children, 3 oz meat per taco", result: "60 tacos, about 11.3 lb cooked meat, and 72 tortillas." },
    faqs: [{ question: "How many tacos does each person eat?", answer: "Two tacos per adult and one per child is a common planning baseline. Increase it for a late-night or taco-only meal." }, { question: "How much meat goes in a taco?", answer: "Two to four ounces of cooked meat per taco is a useful range, depending on shell size and toppings." }, { question: "Why are extra tortillas included?", answer: "Tortillas tear and people often take a second shell. The 20% cushion is an estimate." }, { question: "Does the result include chips and salsa?", answer: "It provides a separate side-serving estimate, which you can use for chips, beans, rice, or a similar side." }],
    seo: { title: "Taco Bar Calculator – Tacos, Meat & Toppings | CalcForged", description: "Plan tacos, cooked meat, tortillas, toppings, and sides for adults and children.", h1: "Taco bar calculator", intro: "A taco bar is easy to serve but surprisingly easy to underbuy. Enter how many adults and children are coming to get a clear estimate for tacos, cooked meat, tortillas, toppings, and sides. The planning baseline is two tacos per adult and one per child, with a small tortilla cushion for breakage and seconds. Use the result as your shopping list starting point, then adjust for other mains, large appetites, or a long event." },
    related: ["catering-food-quantity", "bbq-meat", "wedding-food"],
  },
  {
    slug: "wedding-food", name: "Wedding Food Calculator", category: "Events", categorySlug: "events", icon: "💍", description: "Estimate wedding food quantities and a rough catering budget range.",
    fields: [{ key: "guests", label: "Wedding guests", type: "number", unit: "people", min: 1, max: 5000, defaultValue: 100 }, { key: "style", label: "Meal style", type: "select", defaultValue: "buffet", options: [{ label: "Plated dinner", value: "plated" }, { label: "Buffet", value: "buffet" }, { label: "Cocktail-only", value: "cocktail" }] }, { key: "drinks", label: "Drinks service", type: "select", defaultValue: "beer-wine", options: [{ label: "Non-alcoholic", value: "none" }, { label: "Beer and wine", value: "beer-wine" }, { label: "Full bar", value: "full-bar" }] }, { key: "dessert", label: "Dessert", type: "select", defaultValue: "cake", options: [{ label: "Wedding cake", value: "cake" }, { label: "Dessert table", value: "table" }, { label: "Both", value: "both" }] }],
    results: [{ key: "servings", label: "Meal servings", unit: "servings", format: "number", estimate: true }, { key: "desserts", label: "Dessert servings", unit: "servings", format: "number", estimate: true }, { key: "budgetLow", label: "Catering budget from", unit: "$", format: "currency", estimate: true }, { key: "budgetHigh", label: "Catering budget to", unit: "$", format: "currency", estimate: true }],
    calculate: (v) => { const guests = n(v, "guests", 100); const style = option(v, "style", "buffet"); const factor = style === "cocktail" ? 1.25 : 1; const perPerson = style === "plated" ? [75, 150] : style === "cocktail" ? [45, 95] : [55, 110]; const drinksFactor = option(v, "drinks", "beer-wine") === "full-bar" ? 1.25 : option(v, "drinks", "beer-wine") === "none" ? 0.85 : 1; const dessertFactor = option(v, "dessert", "cake") === "both" ? 1.25 : 1; return { servings: ceil(guests * factor), desserts: ceil(guests * dessertFactor), budgetLow: Math.round(guests * perPerson[0] * drinksFactor), budgetHigh: Math.round(guests * perPerson[1] * drinksFactor) }; },
    howItWorks: ["Meal servings are based on the guest count and service style; cocktail-only service gets a small buffer because food is the event.", "Dessert is planned at one serving per guest, with a 25% bump when serving both cake and a dessert table.", "Budget ranges are rough planning estimates and vary widely by city, menu, staffing, rentals, and bar package."],
    example: { title: "100-person buffet wedding", inputs: "Buffet, beer and wine, cake", result: "100 meal servings, 100 dessert servings, and a rough $5,500–$11,000 catering range." },
    faqs: [{ question: "How much wedding food should I order?", answer: "For a plated or buffet meal, start with one meal serving per guest and add a service-style buffer where appropriate." }, { question: "What does the budget estimate include?", answer: "It is a broad food-and-service planning range, not a quote. Ask caterers what staffing, rentals, tax, gratuity, and bar service add." }, { question: "Should I plan dessert for every guest?", answer: "Yes. One serving per guest is a good baseline, with extra if you offer a dessert table alongside cake." }, { question: "Why can wedding catering costs vary so much?", answer: "Region, menu ingredients, staffing, rentals, service format, and bar choices can all materially change the final quote." }],
    seo: { title: "Wedding Food Calculator – Quantities & Catering Budget | CalcForged", description: "Estimate wedding meal servings, dessert servings, and a rough catering budget range.", h1: "Wedding food calculator", intro: "Wedding food planning has two separate jobs: figuring out how much to serve and setting a realistic budget range before you call caterers. Enter your guest count, meal style, drinks, and dessert plan for a practical estimate. The result is intentionally labeled as a planning range because local labor, menu choices, rentals, tax, and gratuity can move a real quote far beyond a simple per-person formula." },
    related: ["catering-food-quantity", "taco-bar", "restaurant-food-cost"],
  },
  {
    slug: "restaurant-food-cost", name: "Restaurant Food Cost Calculator", category: "Business", categorySlug: "business", icon: "▦", description: "See your cost per portion, food cost percentage, and gross margin at a glance.",
    fields: [{ key: "ingredientCost", label: "Total ingredient cost", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 42 }, { key: "portions", label: "Portions produced", type: "number", unit: "portions", min: 1, defaultValue: 10 }, { key: "menuPrice", label: "Menu price per item", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 16 }],
    results: [{ key: "costPerServing", label: "Cost per serving", unit: "$", format: "currency" }, { key: "foodCostPct", label: "Food cost", unit: "%", format: "percent" }, { key: "grossMargin", label: "Gross margin per item", unit: "$", format: "currency" }, { key: "targetNote", label: "Industry reference", format: "text" }],
    calculate: (v) => { const cost = n(v, "ingredientCost", 42); const portions = n(v, "portions", 10); const price = n(v, "menuPrice", 16); const cps = cost / portions; return { costPerServing: round(cps, 2), foodCostPct: price ? round((cps / price) * 100, 1) : 0, grossMargin: round(price - cps, 2), targetNote: "Common target: 28–35%" }; },
    howItWorks: ["Divide total ingredient cost by the number of portions to get cost per serving.", "Divide cost per serving by menu price to get food cost percentage.", "Gross margin per item is menu price minus ingredient cost per serving; it does not include labor, rent, packaging, or overhead."],
    example: { title: "10-portion recipe", inputs: "$42 ingredient cost, 10 portions, $16 menu price", result: "$4.20 cost per serving, 26.3% food cost, and $11.80 gross margin." },
    faqs: [{ question: "What is a good restaurant food cost percentage?", answer: "Many operators use roughly 28% to 35% as a planning target, but the right number depends on concept, labor, rent, and pricing strategy." }, { question: "Does this include labor?", answer: "No. This tool measures ingredient cost only. Add labor and overhead separately when you calculate true profitability." }, { question: "What if my menu price changes?", answer: "Edit the menu price and the food cost percentage and gross margin update instantly." }, { question: "Can I use this for a batch recipe?", answer: "Yes. Enter the total ingredient cost for the batch and how many sellable portions it creates." }],
    seo: { title: "Restaurant Food Cost Calculator – Cost per Serving | CalcForged", description: "Calculate cost per serving, food cost percentage, and gross margin for a restaurant menu item.", h1: "Restaurant food cost calculator", intro: "Pricing a menu item starts with knowing what it costs to make. Enter the total ingredient cost for a batch, the number of portions it produces, and the menu price per item. CalcForged shows your cost per serving, food cost percentage, and gross margin per item instantly. Use it for recipe costing, menu engineering, catering packages, or a quick check before a price change. The result covers ingredients only, so keep labor, rent, packaging, and other operating costs in your broader margin model." },
    related: ["catering-food-quantity", "wedding-food", "recipe-scaling"],
  },
  {
    slug: "recipe-scaling", name: "Recipe Scaling Calculator", category: "Food & Catering", categorySlug: "food-catering", icon: "⌁", description: "Scale a recipe to a new serving count and keep ingredient amounts readable. Scan a photo of any recipe and let AI fill it in.", photoScan: true,
    fields: [{ key: "originalServings", label: "Original servings", type: "number", unit: "servings", min: 1, defaultValue: 4 }, { key: "newServings", label: "New servings", type: "number", unit: "servings", min: 1, defaultValue: 8 }, { key: "ingredients", label: "Ingredients", type: "ingredient-list", help: "Add the amount, unit, and ingredient name for each row." }],
    results: [{ key: "factor", label: "Scale factor", format: "number" }, { key: "scaled", label: "Scaled ingredients", format: "text" }, { key: "note", label: "Baking note", format: "text" }],
    calculate: (v) => { const factor = n(v, "newServings", 8) / n(v, "originalServings", 4); const rows = Array.isArray(v.ingredients) ? v.ingredients : []; const scaled = rows.map((r) => `${formatFraction(Number(r.amount) * factor)} ${r.unit} ${r.ingredient}`); return { factor: round(factor, 2), scaled: scaled.join("\n") || "Add ingredients above", note: "For baking, scale pan size and time carefully; doubling a recipe rarely means doubling bake time." }; },
    howItWorks: ["The scale factor is new servings divided by original servings.", "Each ingredient amount is multiplied by that factor, while units and ingredient names stay the same.", "Cooking time and pan size do not always scale linearly, especially for baking; use the note as a prompt to check the recipe."],
    example: { title: "4 servings to 8", inputs: "Original 4 servings, new 8 servings", result: "A 2× scale factor. A 1/2 cup ingredient becomes 1 cup." },
    faqs: [{ question: "How do I scale a recipe down?", answer: "Enter a smaller new serving count. The scale factor will be below 1 and each ingredient will shrink proportionally." }, { question: "Can I scan a photo of my recipe?", answer: "Yes. Use the scan box in the calculator to upload a photo of a recipe page, handwritten card, or screenshot. The scanner reads the ingredients and original servings, fills them in, and then you pick the new serving count as usual. Always glance over the rows it fills in — photos and handwriting vary." }, { question: "Does cooking time double?", answer: "Usually not. Watch doneness and use the recipe's pan-size guidance, especially for baking." }, { question: "Can I scale spices exactly?", answer: "Start with the calculated amount, then adjust to taste. Salt, chili, and strong spices may not scale perfectly." }, { question: "What units can I enter?", answer: "Enter any unit you already use—cups, grams, teaspoons, pounds, or another label. The tool scales the number and keeps your unit." }],
    seo: { title: "Recipe Scaling Calculator – Scale Ingredients | CalcForged", description: "Scan a photo of any recipe and AI rescales every ingredient to your new serving count, with readable fractions and baking notes.", h1: "Recipe scaling calculator", intro: "Scaling a recipe should be simple: divide the servings you want by the servings you have, then multiply each ingredient by that factor. Snap a photo of any recipe — a cookbook page, a handwritten card, a screenshot — and the scanner reads it and fills the list in for you, then you pick the new serving count. You can also add the ingredients by hand. The calculator does the arithmetic and formats common results as useful fractions so your shopping list stays readable. For baking, use the result as a starting point and remember that pan size, oven time, and leavening often need their own judgment." },
    related: ["restaurant-food-cost", "catering-food-quantity", "wedding-food"],
  },
  {
    slug: "paint", name: "Paint Calculator", category: "Home Improvement", categorySlug: "home-improvement", icon: "▰", description: "Estimate gallons of paint for a room, including doors, windows, and coats.",
    fields: [{ key: "length", label: "Room length", type: "number", unit: "ft", min: 1, step: 0.1, defaultValue: 12 }, { key: "width", label: "Room width", type: "number", unit: "ft", min: 1, step: 0.1, defaultValue: 10 }, { key: "height", label: "Wall height", type: "number", unit: "ft", min: 1, step: 0.1, defaultValue: 8 }, { key: "doors", label: "Doors", type: "number", unit: "doors", min: 0, defaultValue: 1 }, { key: "windows", label: "Windows", type: "number", unit: "windows", min: 0, defaultValue: 2 }, { key: "coats", label: "Coats", type: "number", unit: "coats", min: 1, max: 5, defaultValue: 2 }],
    results: [{ key: "area", label: "Paintable area", unit: "sq ft", format: "number" }, { key: "gallons", label: "Paint to buy", unit: "gal", format: "number", estimate: true }, { key: "sheen", label: "Practical sheen", format: "text" }],
    calculate: (v) => { const l = n(v, "length", 12), w = n(v, "width", 10), h = n(v, "height", 8); const area = (2 * (l + w) * h) - n(v, "doors", 1) * 21 - n(v, "windows", 2) * 12; const gallons = Math.max(0, area) * n(v, "coats", 2) / 375; return { area: round(Math.max(0, area)), gallons: round(gallons, 1), sheen: "Eggshell for most living spaces" }; },
    howItWorks: ["Wall area is the room perimeter multiplied by wall height.", "This estimate subtracts 21 square feet per door and 12 square feet per window.", "Paint needed is paintable area × coats ÷ 375 square feet per gallon, rounded up when buying whole gallons."],
    example: { title: "12 × 10 room", inputs: "8 ft walls, 1 door, 2 windows, 2 coats", result: "About 307 sq ft of paintable area and 1.6 gallons, so buy 2 gallons." },
    faqs: [{ question: "How much area does a gallon of paint cover?", answer: "Many interior paints cover about 350 to 400 square feet per gallon. This calculator uses 375 as a midpoint estimate." }, { question: "Should I always use two coats?", answer: "Two coats are a common starting point for a consistent finish, especially over a different color." }, { question: "What sheen should I choose?", answer: "Eggshell is a practical general-purpose choice. Use satin for higher-traffic or moisture-prone areas and flat for ceilings." }, { question: "Does this include the ceiling?", answer: "No. It calculates walls and subtracts common door and window openings. Add ceiling area separately if needed." }],
    seo: { title: "Paint Calculator – How Many Gallons Do I Need? | CalcForged", description: "Calculate paintable wall area and gallons needed for a room, with doors, windows, and coats.", h1: "Paint calculator", intro: "Buying paint is easier when you know the wall area instead of guessing by room size. Enter your room dimensions, doors, windows, and number of coats to estimate paintable square footage and gallons needed. The formula uses a common coverage range of about 350 to 400 square feet per gallon and subtracts standard openings. Use the result to plan your shopping list, then check the label on your chosen paint because coverage varies with color, surface, and application method." },
    related: ["flooring", "concrete", "mulch"],
  },
  {
    slug: "flooring", name: "Flooring Calculator", category: "Home Improvement", categorySlug: "home-improvement", icon: "▤", description: "Calculate flooring square footage, waste allowance, boxes, and material cost.",
    fields: [{ key: "length", label: "Room length", type: "number", unit: "ft", min: 1, step: 0.1, defaultValue: 12 }, { key: "width", label: "Room width", type: "number", unit: "ft", min: 1, step: 0.1, defaultValue: 10 }, { key: "waste", label: "Waste factor", type: "select", defaultValue: "10", options: [{ label: "10% — straight lay", value: "10" }, { label: "15% — diagonal or herringbone", value: "15" }] }, { key: "boxCoverage", label: "Coverage per box", type: "number", unit: "sq ft", min: 1, step: 0.1, defaultValue: 20 }, { key: "price", label: "Price per box", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 42 }],
    results: [{ key: "area", label: "Room area", unit: "sq ft", format: "number" }, { key: "orderArea", label: "Order with waste", unit: "sq ft", format: "number", estimate: true }, { key: "boxes", label: "Boxes to buy", unit: "boxes", format: "number", estimate: true }, { key: "cost", label: "Material estimate", unit: "$", format: "currency", estimate: true }],
    calculate: (v) => { const area = n(v, "length", 12) * n(v, "width", 10); const orderArea = area * (1 + n(v, "waste", 10) / 100); const boxes = ceil(orderArea / n(v, "boxCoverage", 20)); return { area: round(area), orderArea: round(orderArea), boxes, cost: round(boxes * n(v, "price", 42), 2) }; },
    howItWorks: ["Multiply length by width to get floor area.", "Add 10% waste for a standard straight installation or 15% for diagonal and herringbone layouts.", "Divide the order area by the box coverage and round up to whole boxes."],
    example: { title: "120 sq ft room", inputs: "12 × 10 ft, 10% waste, 20 sq ft per box", result: "132 sq ft to order, or 7 boxes." },
    faqs: [{ question: "How much flooring waste should I add?", answer: "10% is a common planning allowance for a straightforward layout. Use 15% for diagonal, herringbone, or rooms with many cuts." }, { question: "Why do I need whole boxes?", answer: "Flooring is sold by the box, so always round up. Keep extra planks for future repairs." }, { question: "Does this work for irregular rooms?", answer: "Break the room into rectangles, calculate each one, and add the areas together for a better estimate." }, { question: "Does cost include installation?", answer: "No. It estimates material cost from the number of boxes and the price per box." }],
    seo: { title: "Flooring Calculator – Square Footage, Boxes & Cost | CalcForged", description: "Calculate flooring area, waste, boxes needed, and material cost for a room.", h1: "Flooring calculator", intro: "Flooring orders need to account for waste, packaging, and the actual layout—not just the room's raw square footage. Enter room dimensions, choose a waste allowance, and add the coverage and price printed on your flooring box. CalcForged gives you room area, the recommended order area, whole boxes to buy, and a material cost estimate. Use 10% for a simple straight lay and 15% for diagonal or herringbone patterns." },
    related: ["paint", "concrete", "mulch"],
  },
  {
    slug: "concrete", name: "Concrete Calculator", category: "Construction", categorySlug: "construction", icon: "▥", description: "Estimate concrete volume in cubic yards, plus waste and bag equivalents.",
    fields: [{ key: "shape", label: "Project shape", type: "select", defaultValue: "slab", options: [{ label: "Rectangular slab or footing", value: "slab" }, { label: "Round column", value: "column" }] }, { key: "length", label: "Length", type: "number", unit: "ft", min: 0.1, step: 0.1, defaultValue: 12 }, { key: "width", label: "Width / diameter", type: "number", unit: "ft", min: 0.1, step: 0.1, defaultValue: 10 }, { key: "thickness", label: "Thickness / height", type: "number", unit: "in", min: 0.1, step: 0.1, defaultValue: 4 }, { key: "waste", label: "Waste allowance", type: "select", defaultValue: "10", options: [{ label: "5%", value: "5" }, { label: "10%", value: "10" }] }],
    results: [{ key: "cubicFeet", label: "Concrete volume", unit: "cu ft", format: "number" }, { key: "yards", label: "Order volume", unit: "cu yd", format: "number", estimate: true }, { key: "bags", label: "80 lb bag equivalent", unit: "bags", format: "number", estimate: true }],
    calculate: (v) => { const a = n(v, "length", 12), b = n(v, "width", 10), thicknessFt = n(v, "thickness", 4) / 12; const base = option(v, "shape", "slab") === "column" ? Math.PI * (b / 2) ** 2 * a : a * b * thicknessFt; const order = base * (1 + n(v, "waste", 10) / 100); return { cubicFeet: round(base, 2), yards: round(order / 27, 2), bags: ceil(order / 0.6) }; },
    howItWorks: ["A slab or footing uses length × width × thickness, with thickness converted from inches to feet.", "A round column uses π × radius² × height.", "Cubic feet are divided by 27 to convert to cubic yards, then a 5–10% waste allowance is added for ordering. One 80-pound bag is treated as about 0.6 cubic feet."],
    example: { title: "12 × 10 slab", inputs: "4-inch thickness and 10% waste", result: "40.00 cu ft base volume, about 1.63 cu yd to order, or 74 bags." },
    faqs: [{ question: "How many cubic feet are in a cubic yard?", answer: "One cubic yard contains 27 cubic feet." }, { question: "How much concrete waste should I plan?", answer: "Five to ten percent is a common ordering allowance for uneven subgrade, spillage, and measurement variation." }, { question: "How many 80-pound bags equal a cubic yard?", answer: "Using roughly 0.6 cubic feet per bag, one cubic yard is about 45 bags before waste. Check the product label for exact yield." }, { question: "Can I calculate a round column?", answer: "Yes. Choose Round column and enter diameter and height in feet." }],
    seo: { title: "Concrete Calculator – Cubic Yards, Bags & Waste | CalcForged", description: "Calculate concrete volume for slabs, footings, and round columns in cubic feet, yards, and bags.", h1: "Concrete calculator", intro: "Concrete is sold by volume, so the most useful estimate converts your dimensions into cubic feet and cubic yards before you order. Choose a rectangular slab or footing, or a round column, then enter your dimensions and waste allowance. The calculator uses standard geometry, converts 27 cubic feet to one cubic yard, and shows an 80-pound bag equivalent using an approximate 0.6 cubic-foot yield. Always compare the result with the yield printed on your specific mix." },
    related: ["flooring", "paint", "mulch"],
  },
  {
    slug: "mulch", name: "Mulch Calculator", category: "Home Improvement", categorySlug: "home-improvement", icon: "⌇", description: "Estimate cubic yards of mulch and compare a bulk order with bagged mulch.",
    fields: [{ key: "area", label: "Bed area", type: "number", unit: "sq ft", min: 1, step: 1, defaultValue: 250 }, { key: "depth", label: "Mulch depth", type: "number", unit: "in", min: 1, max: 12, step: 0.5, defaultValue: 3 }, { key: "bagSize", label: "Bag size", type: "number", unit: "cu ft", min: 0.1, step: 0.1, defaultValue: 2 }, { key: "bagPrice", label: "Price per bag", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 4.5 }, { key: "bulkPrice", label: "Bulk price per cu yd", type: "number", unit: "$", min: 0, step: 1, defaultValue: 45 }],
    results: [{ key: "yards", label: "Bulk mulch", unit: "cu yd", format: "number", estimate: true }, { key: "bags", label: "Bagged mulch", unit: "bags", format: "number", estimate: true }, { key: "bagCost", label: "Bagged cost", unit: "$", format: "currency", estimate: true }, { key: "bulkCost", label: "Bulk cost", unit: "$", format: "currency", estimate: true }],
    calculate: (v) => { const area = n(v, "area", 250), depth = n(v, "depth", 3); const yards = area * depth / 324; const bags = ceil(yards * 27 / n(v, "bagSize", 2)); return { yards: round(yards, 2), bags, bagCost: round(bags * n(v, "bagPrice", 4.5), 2), bulkCost: round(yards * n(v, "bulkPrice", 45), 2) }; },
    howItWorks: ["Multiply bed area in square feet by depth in inches.", "Divide by 324 to convert the result to cubic yards.", "The bag comparison converts cubic yards to cubic feet (27 cubic feet per yard), then divides by the bag size and rounds up."],
    example: { title: "250 sq ft garden bed", inputs: "3-inch depth, 2 cu ft bags", result: "2.31 cubic yards, or 32 bags before delivery considerations." },
    faqs: [{ question: "How deep should mulch be?", answer: "Two to three inches is a common recommendation for garden beds. Avoid piling mulch against tree trunks or plant stems." }, { question: "Why divide by 324?", answer: "The constant combines the inches-to-feet conversion with 27 cubic feet per cubic yard." }, { question: "Is bulk mulch cheaper?", answer: "It often can be for larger beds, but delivery fees and your local prices matter. Use the side-by-side estimate as a starting point." }, { question: "Should I use the same depth everywhere?", answer: "Not always. Use a lighter layer around shallow-rooted plants and follow local horticulture guidance." }],
    seo: { title: "Mulch Calculator – Cubic Yards, Bags & Cost | CalcForged", description: "Calculate mulch cubic yards, bags, and a bagged-versus-bulk cost estimate for garden beds.", h1: "Mulch calculator", intro: "A mulch order is easiest to plan from area and depth. Enter your garden bed's square footage, choose a depth in inches, and add local prices for bags and bulk mulch. CalcForged uses the standard formula area × depth ÷ 324 to estimate cubic yards, then shows how many bags you would need and a simple cost comparison. Two to three inches is a common bed depth, but adjust for the plants and soil conditions in your yard." },
    related: ["paint", "flooring", "concrete"],
  },
  {
    slug: "ac-size", name: "AC Size Calculator", category: "Home Improvement", categorySlug: "home-improvement", icon: "❄", description: "Work out the cooling load in BTU and the air conditioner size a room actually needs.",
    fields: [
      { key: "area", label: "Room area", type: "number", unit: "sq ft", min: 50, max: 5000, defaultValue: 300 },
      { key: "ceilingHeight", label: "Ceiling height", type: "number", unit: "ft", min: 7, max: 12, step: 0.5, defaultValue: 8 },
      { key: "sun", label: "Sun exposure", type: "select", defaultValue: "average", options: [{ label: "Heavily shaded", value: "shaded" }, { label: "Average", value: "average" }, { label: "Very sunny", value: "sunny" }] },
      { key: "insulation", label: "Insulation", type: "select", defaultValue: "average", options: [{ label: "Good", value: "good" }, { label: "Average", value: "average" }, { label: "Poor", value: "poor" }] },
      { key: "occupants", label: "People usually in the room", type: "number", unit: "people", min: 1, max: 50, defaultValue: 2 },
      { key: "isKitchen", label: "Is it a kitchen?", type: "select", defaultValue: "no", options: [{ label: "No", value: "no" }, { label: "Yes", value: "yes" }] },
      { key: "climate", label: "Climate", type: "select", defaultValue: "temperate", options: [{ label: "Temperate", value: "temperate" }, { label: "Hot", value: "hot" }, { label: "Very hot & humid", value: "extreme" }] },
    ],
    results: [
      { key: "coolingLoad", label: "Cooling load", unit: "BTU/hr", format: "number", estimate: true, interpretation: "The heat the room adds on a hot day." },
      { key: "tons", label: "Cooling load", unit: "tons", format: "number", estimate: true },
      { key: "recommendedUnit", label: "Unit to buy", format: "text" },
      { key: "guidanceNote", label: "Scope note", format: "text" },
    ],
    calculate: (v) => {
      const area = n(v, "area", 300);
      const ceilingFactor = n(v, "ceilingHeight", 8) / 8;
      const sunFactor = option(v, "sun", "average") === "sunny" ? 1.1 : option(v, "sun", "average") === "shaded" ? 0.9 : 1;
      const insulationFactor = option(v, "insulation", "average") === "poor" ? 1.15 : option(v, "insulation", "average") === "good" ? 0.9 : 1;
      const climateFactor = option(v, "climate", "temperate") === "extreme" ? 1.2 : option(v, "climate", "temperate") === "hot" ? 1.1 : 1;
      const occupants = n(v, "occupants", 2);
      const base = area * 20 * ceilingFactor * sunFactor * insulationFactor;
      const load = (base + Math.max(0, occupants - 2) * 600 + (option(v, "isKitchen", "no") === "yes" ? 4000 : 0)) * climateFactor;
      const sizes = [5000, 6000, 8000, 9000, 10000, 12000, 15000, 18000, 21000, 24000, 30000, 36000, 48000, 60000];
      const unit = sizes.find((size) => size >= load) ?? 60000;
      return { coolingLoad: Math.round(load / 100) * 100, tons: round(load / 12000, 1), recommendedUnit: `Buy a ${unit.toLocaleString("en-US")} BTU (${round(unit / 12000, 1)}-ton) unit`, guidanceNote: "Simplified heat load for one room. Whole-house systems and professional installs need a full Manual J calculation." };
    },
    howItWorks: ["Start from 20 BTU per square foot of floor space — the standard room-cooling baseline.", "Scale for ceiling height, sun, and insulation, then add 600 BTU per person beyond two and 4,000 BTU for a kitchen.", "The load converts to tons (12,000 BTU per ton) and rounds up to the next unit size you can actually buy."],
    example: { title: "Sunny kitchen, 3 people", inputs: "300 sq ft, 8 ft ceilings, very sunny, kitchen, 3 people", result: "About 11,200 BTU (0.9 tons) — buy a 12,000 BTU (1-ton) unit." },
    faqs: [{ question: "How many BTU do I need per square foot?", answer: "A common baseline is 20 BTU per square foot of floor space, adjusted for sun, ceiling height, occupants, and kitchen heat. This calculator applies those standard adjustments for you." }, { question: "What is a ton of cooling?", answer: "One ton equals 12,000 BTU per hour of cooling. Window and portable units are rated in BTU; central systems are usually rated in tons." }, { question: "Is this a Manual J load calculation?", answer: "No. It is a simplified room heat load built on standard rules of thumb — right for picking a room unit or a mini-split. A professional whole-house installation should size from a full Manual J that models every window, wall, and duct." }, { question: "Is it bad to oversize an air conditioner?", answer: "Usually yes. An oversized unit cools fast, shuts off early, and never runs long enough to pull humidity out — the room ends up cold and clammy. Size to the load, and step up one size only for unusual conditions." }],
    seo: { title: "AC Size Calculator – BTU & Heat Load | CalcForged", description: "Calculate the heat load in BTU and the right air conditioner size for any room — sun, ceiling height, occupants, insulation, and kitchen heat included.", h1: "AC size calculator", intro: "Air conditioners are sized by heat load: the number of BTU per hour the room adds on a hot day. Enter the room's area, ceiling height, sun exposure, insulation, and how many people use it, and the calculator applies the standard adjustments to the 20 BTU per square foot baseline. The result converts to tons and points at the next unit size you can actually buy — so you neither undersize a room into misery nor oversize it into a clammy, short-cycling machine." },
    related: ["paint", "flooring", "concrete"],
  },
  {
    slug: "deck-boards", name: "Deck Board Calculator", category: "Home Improvement", categorySlug: "home-improvement", icon: "▬", description: "Count deck board rows, linear feet, and whole boards to buy from deck size, board width, and gaps.",
    fields: [
      { key: "length", label: "Deck length", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 12 },
      { key: "width", label: "Deck width", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 16 },
      { key: "boardWidth", label: "Board width", type: "select", defaultValue: "5.5", options: [{ label: "5.5 in — nominal 6\"", value: "5.5" }, { label: "3.5 in — nominal 4\"", value: "3.5" }, { label: "7.25 in — nominal 8\"", value: "7.25" }] },
      { key: "gap", label: "Gap between boards", type: "number", unit: "in", min: 0, max: 1, step: 0.0625, defaultValue: 0.125 },
      { key: "stockLength", label: "Board stock length", type: "select", defaultValue: "12", options: [{ label: "8 ft", value: "8" }, { label: "12 ft", value: "12" }, { label: "16 ft", value: "16" }] },
      { key: "waste", label: "Waste allowance", type: "number", unit: "%", min: 0, max: 25, step: 1, defaultValue: 10 },
    ],
    results: [{ key: "rows", label: "Board rows", format: "number" }, { key: "linearFt", label: "Total linear ft", unit: "ft", format: "number", estimate: true }, { key: "boards", label: "Boards to buy", unit: "boards", format: "number", estimate: true }, { key: "fastenerNote", label: "Fasteners", format: "text" }],
    calculate: (v) => {
      const rows = ceil((n(v, "width", 16) * 12) / (n(v, "boardWidth", 5.5) + n(v, "gap", 0.125)));
      const linearFt = rows * n(v, "length", 12);
      const boards = ceil(linearFt * (1 + n(v, "waste", 10) / 100) / n(v, "stockLength", 12));
      return { rows, linearFt: round(linearFt), boards, fastenerNote: "Two fasteners per joist crossing; plan screws off your joist layout" };
    },
    howItWorks: ["Rows are the deck width in inches divided by board width plus gap, rounded up.", "Total linear feet is rows × deck length — set length as the direction your boards run. Waste covers crosscuts, defects, and butt joints.", "Boards to buy is linear feet with waste divided by your stock length, rounded up to whole boards."],
    example: { title: "12 × 16 deck", inputs: "6\" boards, 1/8-in gaps, 12-ft stock, 10% waste", result: "35 rows, about 420 linear ft, and 39 twelve-foot boards." },
    faqs: [{ question: "How much gap should I leave between deck boards?", answer: "Pressure-treated lumber is commonly gapped at about 1/8 inch because it shrinks as it dries. Composite manufacturers specify their own spacing — often 1/8 to 1/4 inch — so follow the label." }, { question: "Which direction do I enter as deck length?", answer: "Enter the direction your boards will run as length. The row count comes from the span the boards cross, so a 12 × 16 deck with boards running the long way is entered as length 16, width 12." }, { question: "How much waste should I add?", answer: "10% covers crosscuts and defects on a straight rectangular deck. Bump it to 15% if you are sorting boards for grain, working around curves, or making lots of angle cuts." }, { question: "Does this include stairs, fascia, or railings?", answer: "No — it plans the flat field of the deck. Add stair treads, fascia, and railing boards separately, or raise the waste allowance to cover them." }],
    seo: { title: "Deck Board Calculator – Linear Feet & Boards to Buy | CalcForged", description: "Calculate deck board rows, total linear feet, and how many boards to buy, with gap spacing and waste.", h1: "Deck board calculator", intro: "Deck board counts are a row problem, not an area problem: rows come from board width plus gap spacing across the deck, and linear feet come from rows times the run. Enter your deck dimensions, board width, gap, stock length, and a waste allowance to get rows, total linear feet, and whole boards to buy. The fastener note keeps screws honest — two per joist crossing, planned from your joist layout, not from the deck's area." },
    related: ["deck-stain", "concrete", "paint"],
  },
  {
    slug: "deck-stain", name: "Deck Stain Calculator", category: "Home Improvement", categorySlug: "home-improvement", icon: "◩", description: "Estimate stain gallons and cost for a deck, including railings and coats.",
    fields: [{ key: "length", label: "Deck length", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 12 }, { key: "width", label: "Deck width", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 16 }, { key: "railings", label: "Include railings?", type: "select", defaultValue: "no", options: [{ label: "No — deck floor only", value: "no" }, { label: "Yes — add rail area", value: "yes" }] }, { key: "coats", label: "Coats", type: "number", unit: "coats", min: 1, max: 2, step: 1, defaultValue: 2 }, { key: "coverage", label: "Coverage per gallon", type: "number", unit: "sq ft", min: 50, step: 10, defaultValue: 250 }, { key: "price", label: "Price per gallon", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 35 }],
    results: [{ key: "area", label: "Area to stain", unit: "sq ft", format: "number" }, { key: "gallons", label: "Stain to buy", unit: "gal", format: "number", estimate: true, interpretation: "Rounded up to whole gallons; the can's label wins on coverage." }, { key: "cost", label: "Material estimate", unit: "$", format: "currency", estimate: true }],
    calculate: (v) => { const l = n(v, "length", 12), w = n(v, "width", 16); const rail = option(v, "railings", "no") === "yes" ? 12 * (l + w) : 0; const area = l * w + rail; const gallons = ceil(area * n(v, "coats", 2) / n(v, "coverage", 250)); return { area: round(area), gallons, cost: round(gallons * n(v, "price", 35), 2) }; },
    howItWorks: ["Deck floor area is length × width; railings add roughly 12 square feet per foot of perimeter, counting both faces of rails and balusters.", "Gallons are area × coats ÷ coverage per gallon, rounded up to whole gallons.", "Most stains cover 150 to 300 square feet per gallon depending on product and wood condition — enter your can's coverage and let it override the default."],
    example: { title: "12 × 16 deck with railings", inputs: "2 coats, 250 sq ft per gallon", result: "About 528 sq ft to stain — 5 gallons, roughly $175 at $35 per gallon." },
    faqs: [{ question: "How much area does a gallon of deck stain cover?", answer: "Most products cover 150 to 300 square feet per gallon per coat; semi-transparent stains on weathered, porous wood land at the low end. The coverage printed on your can beats any default." }, { question: "Do railings really add that much surface?", answer: "Yes. Rails have two faces plus edges, and every baluster has two faces — on a small deck the railing can add as much paintable surface as the floor itself." }, { question: "Should I stain the underside of the deck boards?", answer: "Usually no. Coat the walking surface and the exposed edges; airflow dries the underside, and the wear you are protecting against happens on top." }, { question: "One coat or two?", answer: "Two coats are the norm on bare wood — the first soaks in, the second builds color and protection. A single maintenance coat is common on a deck that was already stained." }],
    seo: { title: "Deck Stain Calculator – Gallons & Cost | CalcForged", description: "Calculate how much deck stain you need — floor and railings, coats, gallons, and cost estimate.", h1: "Deck stain calculator", intro: "Stain runs out at the worst time — halfway through a deck, with the sun moving and half the boards wet. This calculator works from real surface area instead of deck size: the floor, both faces of the railings when you include them, and your coat count, divided by the coverage on your actual can of stain. Most products cover 150 to 300 square feet per gallon, so the label wins; the result is whole gallons to buy and what they cost." },
    related: ["deck-boards", "paint", "concrete"],
  },
  {
    slug: "sod", name: "Sod Calculator", category: "Home Improvement", categorySlug: "home-improvement", icon: "🌱", description: "Calculate sod rolls, pallets, and cost for a lawn, with delivery-day waste built in.",
    fields: [{ key: "length", label: "Lawn length", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 40 }, { key: "width", label: "Lawn width", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 30 }, { key: "waste", label: "Waste allowance", type: "number", unit: "%", min: 0, max: 20, step: 1, defaultValue: 5 }, { key: "rollSize", label: "Roll size", type: "number", unit: "sq ft", min: 1, step: 0.5, defaultValue: 10 }, { key: "palletSize", label: "Pallet size", type: "number", unit: "sq ft", min: 100, step: 25, defaultValue: 500 }, { key: "price", label: "Price per roll", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 4 }],
    results: [{ key: "orderArea", label: "Order with waste", unit: "sq ft", format: "number", estimate: true }, { key: "rolls", label: "Rolls to order", unit: "rolls", format: "number", estimate: true }, { key: "palletsNote", label: "Pallets", format: "text" }, { key: "cost", label: "Material estimate", unit: "$", format: "currency", estimate: true }],
    calculate: (v) => { const area = n(v, "length", 40) * n(v, "width", 30); const orderArea = area * (1 + n(v, "waste", 5) / 100); const rolls = ceil(orderArea / n(v, "rollSize", 10)); const pallets = ceil(orderArea / n(v, "palletSize", 500)); return { orderArea: round(orderArea), rolls, palletsNote: `About ${pallets} pallet${pallets === 1 ? "" : "s"} at ${n(v, "palletSize", 500)} sq ft — pallets run 400–600 sq ft by farm.`, cost: round(rolls * n(v, "price", 4), 2) }; },
    howItWorks: ["Order area is lawn area plus a small waste allowance — sod is perishable, so it needs less buffer than lumber or stone.", "Rolls are order area ÷ roll size, rounded up. The standard US roll is 2 × 5 ft, or 10 square feet.", "Cost is rolls × price per roll; the pallet count is shown as a note because most sod farms sell — and price — by the pallet."],
    example: { title: "40 × 30 lawn", inputs: "5% waste, 10 sq ft rolls", result: "Order 1,260 sq ft — 126 rolls, about 3 pallets, roughly $504 at $4 per roll." },
    faqs: [{ question: "How much extra sod should I order?", answer: "Five percent covers cuts around edges and garden beds on a simple rectangle; use 10% for curved borders, islands, and obstacles. Unlike most materials, don't stack a big buffer on top — sod doesn't store." }, { question: "How long can sod sit on the pallet?", answer: "Hours, not days. Rolled sod heats up fast, especially in summer, and starts to yellow within a day. Schedule delivery for the day you install and water it as soon as it's down." }, { question: "What size is a roll of sod?", answer: "The common US roll is 2 × 5 feet — 10 square feet. Farms also sell big rolls of roughly 360 square feet that are machine-installed. Pallets commonly carry 400 to 600 square feet depending on the farm and grass type." }, { question: "Which way should the rolls face?", answer: "Lay strips in rows with staggered end joints like brickwork, edges snug but never overlapping, and run the rows across a slope on hillsides so they can't creep downhill." }],
    seo: { title: "Sod Calculator – Rolls, Pallets & Cost | CalcForged", description: "Calculate sod rolls, pallets, and cost for your lawn, with a waste allowance sized for delivery day.", h1: "Sod calculator", intro: "Sod is the one landscape material with a deadline: it arrives alive and needs to be in the ground the same day. So the order has to be right the first time. Enter your lawn dimensions and this calculator returns the order area with a small waste allowance, whole rolls at the standard 10-square-foot size, a pallet count for farms that sell by the pallet, and the cost. Five percent waste covers a clean rectangle; curved beds and obstacles deserve ten." },
    related: ["mulch", "gravel-driveway", "flooring"],
  },
  {
    slug: "rebar", name: "Rebar Calculator", category: "Construction", categorySlug: "construction", icon: "#", description: "Count rebar bars, linear feet, sticks, and weight for a reinforced concrete slab.",
    fields: [{ key: "length", label: "Slab length", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 20 }, { key: "width", label: "Slab width", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 24 }, { key: "spacing", label: "Rebar spacing", type: "number", unit: "in", min: 6, max: 36, step: 1, defaultValue: 18 }, { key: "barSize", label: "Bar size", type: "select", defaultValue: "#4", options: [{ label: "#3 — 3/8 in", value: "#3" }, { label: "#4 — 1/2 in", value: "#4" }, { label: "#5 — 5/8 in", value: "#5" }] }, { key: "lap", label: "Overlap / lap allowance", type: "number", unit: "%", min: 0, max: 25, step: 1, defaultValue: 10 }, { key: "stockLength", label: "Stock bar length", type: "number", unit: "ft", min: 5, max: 60, step: 1, defaultValue: 20 }],
    results: [{ key: "barsA", label: "Bars one way", format: "number" }, { key: "barsB", label: "Bars other way", format: "number" }, { key: "linearFt", label: "Total bar length", unit: "ft", format: "number", estimate: true }, { key: "sticks", label: "Stock bars to buy", unit: "bars", format: "number", estimate: true }, { key: "weight", label: "Total weight", unit: "lb", format: "number", estimate: true }],
    calculate: (v) => { const spacing = Math.min(36, Math.max(6, n(v, "spacing", 18))); const barsA = ceil(n(v, "length", 20) * 12 / spacing) + 1; const barsB = ceil(n(v, "width", 24) * 12 / spacing) + 1; const linearFt = (barsA * n(v, "width", 24) + barsB * n(v, "length", 20)) * (1 + n(v, "lap", 10) / 100); const lbPerFt = option(v, "barSize", "#4") === "#3" ? 0.376 : option(v, "barSize", "#4") === "#5" ? 1.043 : 0.668; return { barsA, barsB, linearFt: round(linearFt), sticks: ceil(linearFt / n(v, "stockLength", 20)), weight: round(linearFt * lbPerFt, 0) }; },
    howItWorks: ["Bars in each direction are the span in inches ÷ spacing, plus one extra for the far edge, rounded up.", "Total bar length adds both directions plus a lap allowance for the overlaps where bars splice together.", "Weight uses standard bar weights — #3 is 0.376 lb/ft, #4 is 0.668, #5 is 1.043 — and sticks are total feet ÷ stock length, rounded up."],
    example: { title: "20 × 24 slab", inputs: "#4 bars at 18 in, 10% lap, 20-ft stock", result: "15 bars one way and 17 the other — about 770 linear ft, 39 sticks, roughly 514 lb." },
    faqs: [{ question: "How far apart should rebar be in a slab?", answer: "18 inches on center is a common residential spacing, with 12 to 24 inches both seen depending on load and soil. If your project has engineered plans, the plans win." }, { question: "What size rebar for a patio or driveway slab?", answer: "#4 (1/2 inch) is the standard for 4-inch residential slabs. #3 suits light-duty patios and walkways; #5 shows up in footings, thick driveways, and commercial work." }, { question: "How much should rebar overlap at splices?", answer: "A common rule is 40 bar diameters of overlap — about 20 inches for a #4 bar. The 10% planning allowance covers splices plus the short offcuts left over from cutting." }, { question: "Do I need rebar in a 4-inch slab?", answer: "For sidewalks and patios, fiber or wire mesh is often enough. Rebar earns its keep on driveways, soft or filled soil, and slabs carrying vehicles — match your local code and use." }],
    seo: { title: "Rebar Calculator – Bars, Length & Weight | CalcForged", description: "Calculate rebar count in both directions, total linear feet, 20-ft sticks to buy, and total weight for a slab.", h1: "Rebar calculator", intro: "Rebar orders are counted in sticks and weighed in pounds, but the slab only cares about spacing. Enter the slab dimensions, bar spacing, and bar size, and this calculator counts the bars in both directions, totals the linear feet with a lap allowance for splices, and converts that to 20-foot sticks and total weight using standard ASTM bar weights. #4 bars at 18 inches on center is the workhorse spec for residential slabs — adjust if your plans say otherwise." },
    related: ["concrete", "gravel-driveway", "deck-boards"],
  },
  {
    slug: "gravel-driveway", name: "Gravel Driveway Calculator", category: "Construction", categorySlug: "construction", icon: "◆", description: "Estimate gravel yards, tons, and cost for a driveway, with compaction built in.",
    fields: [{ key: "length", label: "Driveway length", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 60 }, { key: "width", label: "Driveway width", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 12 }, { key: "depth", label: "Depth", type: "number", unit: "in", min: 1, max: 24, step: 0.5, defaultValue: 4 }, { key: "waste", label: "Compaction / waste", type: "number", unit: "%", min: 0, max: 25, step: 1, defaultValue: 10 }, { key: "price", label: "Delivered price per cu yd", type: "number", unit: "$", min: 0, step: 1, defaultValue: 45 }],
    results: [{ key: "yards", label: "Gravel to order", unit: "cu yd", format: "number", estimate: true }, { key: "tons", label: "Weight", unit: "tons", format: "number", estimate: true, interpretation: "At about 1.4 tons per cubic yard." }, { key: "cost", label: "Material estimate", unit: "$", format: "currency", estimate: true }, { key: "depthNote", label: "Depth check", format: "text" }],
    calculate: (v) => { const cuFt = n(v, "length", 60) * n(v, "width", 12) * (n(v, "depth", 4) / 12); const yards = (cuFt / 27) * (1 + n(v, "waste", 10) / 100); return { yards: round(yards, 2), tons: round(yards * 1.4, 2), cost: round(yards * n(v, "price", 45), 2), depthNote: "4 in is the standard light-use depth; 6–8 in for vehicles that park daily." }; },
    howItWorks: ["Volume is length × width × depth in feet, divided by 27 for cubic yards.", "The order adds 10% for compaction and losses — gravel settles as it's spread and rolled.", "Weight uses about 1.4 tons per cubic yard of crushed stone; cost is yards × your delivered price per yard."],
    example: { title: "60 × 12 driveway", inputs: "4 in deep, 10% compaction, $45 per yard", result: "About 9.78 cu yd, 13.7 tons, roughly $440 delivered." },
    faqs: [{ question: "How deep should a gravel driveway be?", answer: "Four inches compacted suits light, occasional use. Where vehicles park daily — or the soil is soft — plan 6 to 8 inches, ideally placed and compacted in two lifts." }, { question: "How much does a cubic yard of gravel weigh?", answer: "Crushed stone runs about 1.3 to 1.5 tons per cubic yard depending on the stone and moisture — 1.4 tons is a good planning figure." }, { question: "What does delivered gravel cost?", answer: "Most areas land between $15 and $75 per cubic yard delivered; road base often runs $25 to $62. Stone size and delivery distance move the price the most, so quote locally." }, { question: "Should I put fabric under the gravel?", answer: "On soft or muddy ground, yes — a geotextile fabric layer keeps stone from punching into the soil and roughly doubles the life of the driveway. It's cheap insurance on any questionable subgrade." }],
    seo: { title: "Gravel Driveway Calculator – Yards, Tons & Cost | CalcForged", description: "Calculate cubic yards, tons, and cost for a gravel driveway, with compaction and a depth check.", h1: "Gravel driveway calculator", intro: "Gravel is ordered by the cubic yard, hauled by the ton, and paid for by the delivery — so all three numbers need to agree before the truck shows up. Enter your driveway dimensions and depth, and this calculator converts the volume to cubic yards with a 10% compaction allowance, estimates the tonnage at 1.4 tons per yard, and prices it at your local delivered rate. Four inches covers light use; daily parking wants 6 to 8 inches." },
    related: ["concrete", "rebar", "mulch"],
  },
  {
    slug: "wallpaper", name: "Wallpaper Calculator", category: "Home Improvement", categorySlug: "home-improvement", icon: "❖", description: "Estimate wallpaper rolls and cost for a room, minus openings and with pattern waste.",
    fields: [{ key: "perimeter", label: "Room perimeter", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 52 }, { key: "height", label: "Wall height", type: "number", unit: "ft", min: 1, step: 0.5, defaultValue: 8 }, { key: "doors", label: "Doors", type: "number", unit: "doors", min: 0, step: 1, defaultValue: 1 }, { key: "windows", label: "Windows", type: "number", unit: "windows", min: 0, step: 1, defaultValue: 2 }, { key: "rollCoverage", label: "Coverage per roll", type: "number", unit: "sq ft", min: 1, step: 0.5, defaultValue: 55 }, { key: "patternWaste", label: "Pattern waste", type: "number", unit: "%", min: 0, max: 40, step: 1, defaultValue: 15 }, { key: "price", label: "Price per roll", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 30 }],
    results: [{ key: "wallArea", label: "Wall area", unit: "sq ft", format: "number" }, { key: "rolls", label: "Rolls to buy", unit: "rolls", format: "number", estimate: true }, { key: "cost", label: "Material estimate", unit: "$", format: "currency", estimate: true }, { key: "dyeLotNote", label: "Dye lot", format: "text" }],
    calculate: (v) => { const wallArea = n(v, "perimeter", 52) * n(v, "height", 8) - n(v, "doors", 1) * 21 - n(v, "windows", 2) * 15; const orderArea = Math.max(0, wallArea) * (1 + n(v, "patternWaste", 15) / 100); const rolls = ceil(orderArea / n(v, "rollCoverage", 55)); return { wallArea: round(Math.max(0, wallArea)), rolls, cost: round(rolls * n(v, "price", 30), 2), dyeLotNote: "Order every roll from one dye lot — mixed lots show at the seams." }; },
    howItWorks: ["Wall area is the room perimeter × wall height, minus 21 square feet per door and 15 per window.", "Pattern waste — 15% is typical — covers matching repeats and trimming; large patterns and many corners need more.", "Rolls are order area ÷ coverage per roll, rounded up. A US double roll is 60.75 sq ft nominal but lands near 55 usable."],
    example: { title: "12 × 14 room", inputs: "8 ft walls, 1 door, 2 windows, 15% pattern waste", result: "365 sq ft of wall — 8 rolls at 55 sq ft each, about $240." },
    faqs: [{ question: "How much wallpaper is on a roll?", answer: "A US double roll (27 in × 27 ft) is 60.75 square feet nominal, but pattern repeats and trimming leave about 50–55 usable. European and peel-and-stick rolls differ — enter the coverage printed on your roll's label." }, { question: "What is pattern waste?", answer: "The extra material consumed matching the pattern at every seam and trimming top and bottom. Small repeats waste little; large drop patterns of 24 inches or more can eat 20 to 25 percent." }, { question: "What is a dye lot, and why does it matter?", answer: "Wallpaper is printed in batches, and small color shifts between batches are visible where sheets meet. Buy every roll — plus one spare — from the same dye lot in a single order." }, { question: "Can I wallpaper over existing wallpaper?", answer: "Usually not a good idea. Seams telegraph through and adhesion fails on the old paste. Strip the old paper, prime, then hang — the prep is most of the job." }],
    seo: { title: "Wallpaper Calculator – Rolls & Cost | CalcForged", description: "Calculate wallpaper rolls and cost for a room, minus doors and windows, with pattern waste and dye-lot guidance.", h1: "Wallpaper calculator", intro: "Wallpaper punishes two mistakes equally: one roll short, and rolls from different dye lots. This calculator works from the room's wall area — perimeter × height, minus doors and windows — then adds a pattern-waste allowance for the material that disappears into matching repeats and trim cuts. Rolls come from your roll's actual usable coverage, not its nominal size, and the dye-lot note is there before you order, not after the seams show." },
    related: ["paint", "flooring"],
  },
  {
    slug: "mortgage", name: "Mortgage Calculator", category: "Finance", categorySlug: "finance", icon: "🏠", description: "Estimate your monthly mortgage payment, including taxes and insurance.",
    fields: [{ key: "homePrice", label: "Home price", type: "number", unit: "$", min: 10000, step: 1000, defaultValue: 400000 }, { key: "downPayment", label: "Down payment", type: "number", unit: "$", min: 0, step: 1000, defaultValue: 80000 }, { key: "rate", label: "Interest rate", type: "number", unit: "%", min: 0, max: 25, step: 0.05, defaultValue: 6.5 }, { key: "term", label: "Loan term", type: "select", defaultValue: "30", options: [{ label: "30 years", value: "30" }, { label: "20 years", value: "20" }, { label: "15 years", value: "15" }, { label: "10 years", value: "10" }] }, { key: "tax", label: "Property tax per year", type: "number", unit: "$", min: 0, step: 100, defaultValue: 3600 }, { key: "insurance", label: "Home insurance per year", type: "number", unit: "$", min: 0, step: 100, defaultValue: 1500 }],
    results: [{ key: "loan", label: "Loan amount", unit: "$", format: "currency" }, { key: "monthlyPI", label: "Principal & interest", unit: "$/mo", format: "currency" }, { key: "monthlyTotal", label: "Estimated total monthly", unit: "$/mo", format: "currency", estimate: true, interpretation: "Principal, interest, property tax, and insurance." }, { key: "totalInterest", label: "Total interest over the loan", unit: "$", format: "currency", estimate: true }],
    calculate: (v) => {
      const price = n(v, "homePrice", 400000); const principal = Math.max(0, price - n(v, "downPayment", 80000));
      const r = n(v, "rate", 6.5) / 1200; const months = Number(option(v, "term", "30")) * 12;
      const pi = r === 0 ? principal / months : principal * r / (1 - (1 + r) ** -months);
      const taxMo = n(v, "tax", 3600) / 12; const insMo = n(v, "insurance", 1500) / 12;
      return { loan: Math.round(principal), monthlyPI: round(pi, 2), monthlyTotal: round(pi + taxMo + insMo, 2), totalInterest: round(pi * months - principal, 0) };
    },
    howItWorks: ["The loan amount is the home price minus your down payment.", "Principal and interest use the standard amortization formula: loan × monthly rate ÷ (1 − (1 + monthly rate)⁻ⁿ).", "Property tax and insurance are divided into monthly amounts and added to the payment; escrow for HOA dues or mortgage insurance is not included."],
    example: { title: "$400,000 home", inputs: "$80,000 down, 6.5% for 30 years, $3,600 tax, $1,500 insurance", result: "About $2,023 principal & interest, or roughly $2,448 total monthly." },
    faqs: [{ question: "Does this include PMI?", answer: "No. If your down payment is under 20%, most lenders add private mortgage insurance, which is not part of this estimate." }, { question: "Why is my escrow payment different?", answer: "Lenders collect taxes and insurance into escrow and may keep a cushion, so the escrow portion of a real bill can differ from a simple division by twelve." }, { question: "How much does a shorter term save?", answer: "A shorter term raises the monthly payment but cuts total interest dramatically — compare 15 and 30 years in the term selector." }, { question: "What interest rate should I use?", answer: "Use the rate from a current lender quote or pre-approval. Headline rates you see advertised often assume points and strong credit." }],
    seo: { title: "Mortgage Calculator – Monthly Payment Estimate | CalcForged", description: "Estimate your monthly mortgage payment with principal, interest, property tax, and insurance included.", h1: "Mortgage calculator", intro: "A mortgage payment is more than the loan. Enter the home price, down payment, interest rate, and term to see the principal-and-interest portion, then add your expected property tax and insurance for a realistic monthly total. The calculator uses the standard amortization formula lenders use, so it is a solid starting point before you compare official loan estimates. Remember that a down payment under 20% usually adds private mortgage insurance, and closing costs are separate from everything shown here." },
    related: ["loan", "compound-interest", "investment"],
  },
  {
    slug: "loan", name: "Loan Calculator", category: "Finance", categorySlug: "finance", icon: "💵", description: "See the monthly payment, total interest, and payoff cost for any fixed loan.",
    fields: [{ key: "amount", label: "Loan amount", type: "number", unit: "$", min: 100, step: 100, defaultValue: 25000 }, { key: "rate", label: "Interest rate", type: "number", unit: "%", min: 0, max: 40, step: 0.05, defaultValue: 8.5 }, { key: "months", label: "Term", type: "number", unit: "months", min: 1, max: 480, defaultValue: 60 }],
    results: [{ key: "monthly", label: "Monthly payment", unit: "$/mo", format: "currency" }, { key: "totalInterest", label: "Total interest", unit: "$", format: "currency", estimate: true }, { key: "totalPaid", label: "Total repaid", unit: "$", format: "currency", estimate: true }, { key: "interestShare", label: "Interest as share of payments", unit: "%", format: "percent" }],
    calculate: (v) => {
      const principal = n(v, "amount", 25000); const r = n(v, "rate", 8.5) / 1200; const months = Math.max(1, n(v, "months", 60));
      const monthly = r === 0 ? principal / months : principal * r / (1 - (1 + r) ** -months);
      const totalPaid = monthly * months; const interest = totalPaid - principal;
      return { monthly: round(monthly, 2), totalInterest: round(interest, 0), totalPaid: round(totalPaid, 0), interestShare: principal ? round((interest / totalPaid) * 100, 1) : 0 };
    },
    howItWorks: ["Monthly payment uses the standard amortization formula for a fixed-rate, fixed-term loan.", "Total repaid is the monthly payment multiplied by the number of months.", "Total interest is everything you pay above the amount borrowed; it assumes no extra payments and no fees."],
    example: { title: "$25,000 personal loan", inputs: "8.5% over 60 months", result: "About $512.91 per month and $5,775 total interest." },
    faqs: [{ question: "Does this work for car loans?", answer: "Yes. Any fixed-rate, fixed-term installment loan — personal, auto, or student — uses the same formula." }, { question: "Are origination fees included?", answer: "No. Fees are not interest, but they raise your real cost. Some loans add them to the balance, so you could enter a slightly higher loan amount to account for that." }, { question: "What happens if I pay extra each month?", answer: "Extra payments go straight to principal and shorten the loan, so your actual total interest would be lower than shown." }, { question: "Why does a longer term cost more?", answer: "A longer term lowers the monthly payment but keeps interest accruing for more months, so the total interest grows even at the same rate." }],
    seo: { title: "Loan Calculator – Monthly Payment & Total Interest | CalcForged", description: "Calculate the monthly payment, total interest, and total repayment cost for any fixed-rate loan.", h1: "Loan calculator", intro: "Before you sign for a personal, auto, or business loan, it helps to see the whole picture: the monthly payment, the total interest, and what the loan really costs end to end. Enter the amount, rate, and term in months and the calculator applies the standard amortization formula lenders use for fixed installment loans. Try a shorter term or a lower rate to see how much interest each change saves, and remember that fees and extra payments are not part of this estimate." },
    related: ["mortgage", "compound-interest", "savings"],
  },
  {
    slug: "investment", name: "Investment Calculator", category: "Finance", categorySlug: "finance", icon: "📈", description: "Project the growth of a one-time investment plus ongoing monthly contributions.",
    fields: [{ key: "initial", label: "Starting amount", type: "number", unit: "$", min: 0, step: 100, defaultValue: 10000 }, { key: "monthly", label: "Monthly contribution", type: "number", unit: "$", min: 0, step: 10, defaultValue: 500 }, { key: "returnRate", label: "Expected annual return", type: "number", unit: "%", min: -10, max: 30, step: 0.1, defaultValue: 7 }, { key: "years", label: "Years invested", type: "number", unit: "years", min: 1, max: 60, defaultValue: 20 }],
    results: [{ key: "futureValue", label: "Projected value", unit: "$", format: "currency", estimate: true }, { key: "totalDeposits", label: "Total contributed", unit: "$", format: "currency" }, { key: "growth", label: "Investment growth", unit: "$", format: "currency", estimate: true }],
    calculate: (v) => {
      const initial = n(v, "initial", 10000); const monthly = n(v, "monthly", 500); const years = n(v, "years", 20);
      const i = n(v, "returnRate", 7) / 1200; const months = years * 12;
      const growthFactor = i === 0 ? months : ((1 + i) ** months - 1) / i;
      const fv = initial * (1 + i) ** months + monthly * growthFactor;
      const deposits = initial + monthly * months;
      return { futureValue: round(fv, 0), totalDeposits: round(deposits, 0), growth: round(fv - deposits, 0) };
    },
    howItWorks: ["The starting balance compounds monthly at your expected annual return.", "Each monthly contribution is treated as an end-of-month deposit earning the same rate.", "Investment growth is the projected value minus everything you contributed — the part compounding did on its own."],
    example: { title: "20-year plan", inputs: "$10,000 start, $500/month, 7% annual return", result: "Roughly $301,000 projected value from $130,000 contributed." },
    faqs: [{ question: "What return should I assume?", answer: "Long-run diversified stock index returns have historically averaged around 7% nominal per year, but future returns are never guaranteed. Run conservative, moderate, and optimistic scenarios." }, { question: "Does this account for inflation?", answer: "No. Results are in today's dollars at the return you enter. A real return of 4–5% (nominal return minus inflation) gives a rougher but more honest picture." }, { question: "Are taxes and fees included?", answer: "No. Account fees, expense ratios, and taxes on gains all reduce the real result, sometimes by 1% a year or more." }, { question: "Why does the growth column get so large?", answer: "Compounding: your returns start earning their own returns. Over long horizons, growth routinely exceeds everything you deposited." }],
    seo: { title: "Investment Calculator – Project Portfolio Growth | CalcForged", description: "Project investment growth from a starting balance and monthly contributions at any expected return.", h1: "Investment calculator", intro: "The most motivating part of investing is watching compounding take over, and the clearest way to see it is to run the numbers. Enter a starting amount, a monthly contribution, an expected annual return, and a time horizon. The calculator projects the future value with monthly compounding and splits the result into what you contributed versus what growth added. Use it for retirement planning, a brokerage account, or comparing what an extra $100 a month is worth over 20 years." },
    related: ["compound-interest", "savings", "loan"],
  },
  {
    slug: "savings", name: "Savings Calculator", category: "Finance", categorySlug: "finance", icon: "🎯", description: "Find out when you'll hit a savings goal with your current plan.",
    fields: [{ key: "goal", label: "Savings goal", type: "number", unit: "$", min: 100, step: 100, defaultValue: 20000 }, { key: "current", label: "Current savings", type: "number", unit: "$", min: 0, step: 100, defaultValue: 5000 }, { key: "monthly", label: "Monthly deposit", type: "number", unit: "$", min: 0, step: 10, defaultValue: 400 }, { key: "returnRate", label: "Interest rate", type: "number", unit: "%", min: 0, max: 15, step: 0.1, defaultValue: 4 }],
    results: [{ key: "months", label: "Months to reach goal", unit: "months", format: "number", estimate: true }, { key: "years", label: "That's about", unit: "years", format: "number", estimate: true }, { key: "deposits", label: "You'll have deposited", unit: "$", format: "currency" }, { key: "status", label: "Plan check", format: "text" }],
    calculate: (v) => {
      const goal = n(v, "goal", 20000); const monthly = n(v, "monthly", 400); const i = n(v, "returnRate", 4) / 1200;
      let balance = n(v, "current", 5000); let months = 0;
      while (balance < goal && months < 1200) { balance = balance * (1 + i) + monthly; months += 1; }
      if (balance < goal) return { months: "—", years: "—", deposits: round(n(v, "current", 5000) + monthly * 1200, 0), status: "Not reachable at this pace — raise the deposit or the rate." };
      return { months, years: round(months / 12, 1), deposits: round(n(v, "current", 5000) + monthly * months, 0), status: "On track with this plan." };
    },
    howItWorks: ["Each month, interest is applied to the balance, then your deposit is added.", "The loop runs until the balance reaches your goal, up to 100 years.", "If the plan never gets there — for example, deposits that don't cover interest losses — the check result tells you plainly."],
    example: { title: "$20,000 emergency fund", inputs: "$5,000 saved, $400/month at 4%", result: "About 35 months — just under 3 years." },
    faqs: [{ question: "What interest rate should I use?", answer: "High-yield savings accounts move with the market; use your account's current APY. For cash under a mattress, use 0%." }, { question: "What if I already reached my goal?", answer: "If current savings already meet or exceed the goal, the result is zero months." }, { question: "Does this include withdrawals?", answer: "No. It assumes deposits only. If you'll dip into the fund along the way, aim for a higher goal." }, { question: "Why does the result say 'not reachable'?", answer: "If your monthly deposit is zero and interest alone can't close the gap, no number of months gets you there — the tool flags it instead of guessing." }],
    seo: { title: "Savings Calculator – When Will I Reach My Goal? | CalcForged", description: "Calculate how long it takes to reach a savings goal with monthly deposits and interest.", h1: "Savings calculator", intro: "A savings goal becomes real when it has a date. Enter your target, what you have saved, your monthly deposit, and the interest your account pays. The calculator walks the balance forward month by month — interest first, then your deposit — and tells you when you arrive, how much you'll have deposited along the way, and whether the plan works at all. Use it for an emergency fund, a house down payment, a car, or a trip." },
    related: ["investment", "compound-interest", "loan"],
  },
  {
    slug: "compound-interest", name: "Compound Interest Calculator", category: "Finance", categorySlug: "finance", icon: "🪙", description: "Watch principal, interest, and compounding frequency grow a balance over time.",
    fields: [{ key: "principal", label: "Starting principal", type: "number", unit: "$", min: 0, step: 100, defaultValue: 5000 }, { key: "rate", label: "Annual interest rate", type: "number", unit: "%", min: 0, max: 30, step: 0.1, defaultValue: 5 }, { key: "frequency", label: "Compounding frequency", type: "select", defaultValue: "12", options: [{ label: "Daily", value: "365" }, { label: "Monthly", value: "12" }, { label: "Quarterly", value: "4" }, { label: "Annually", value: "1" }] }, { key: "years", label: "Years", type: "number", unit: "years", min: 1, max: 60, defaultValue: 10 }, { key: "monthlyAdd", label: "Additional monthly deposit", type: "number", unit: "$", min: 0, step: 10, defaultValue: 100 }],
    results: [{ key: "futureValue", label: "Final balance", unit: "$", format: "currency", estimate: true }, { key: "deposits", label: "Total deposited", unit: "$", format: "currency" }, { key: "interest", label: "Interest earned", unit: "$", format: "currency", estimate: true }, { key: "apy", label: "Effective annual rate", unit: "%", format: "percent" }],
    calculate: (v) => {
      const principal = n(v, "principal", 5000); const years = n(v, "years", 10); const monthlyAdd = n(v, "monthlyAdd", 100);
      const freq = Number(option(v, "frequency", "12")); const r = n(v, "rate", 5) / 100; const periods = freq * years;
      const perPeriod = r / freq; const factor = (1 + perPeriod) ** periods;
      const fv = principal * factor + monthlyAdd * (freq / 12) * ((factor - 1) / (perPeriod || 1));
      const deposits = principal + monthlyAdd * years * 12;
      return { futureValue: round(fv, 2), deposits: round(deposits, 0), interest: round(fv - deposits, 2), apy: round(((1 + r / freq) ** freq - 1) * 100, 3) };
    },
    howItWorks: ["The principal grows at rate ÷ frequency, compounded once per period for all periods.", "Monthly deposits are converted to the compounding period and earn the same rate — an approximation when deposits and compounding don't align exactly.", "The effective annual rate shows what your nominal rate is really worth once compounding frequency is applied."],
    example: { title: "$5,000 at 5%", inputs: "Compounded monthly, 10 years, $100/month added", result: "About $23,763 final balance, with $6,763 of it interest." },
    faqs: [{ question: "What's the difference between APR and APY?", answer: "APR is the nominal annual rate; APY includes the effect of compounding. A 5% rate compounded monthly is about 5.12% APY." }, { question: "How much does daily compounding help?", answer: "Marginally — daily versus monthly compounding changes a 5% rate by about 0.01% a year. Term and rate matter far more than frequency." }, { question: "Does this work for debt?", answer: "The math is identical, which is exactly why credit card balances grow so fast. Enter your card's APR to see what a balance becomes if you pay only interest." }, { question: "Why is the interest estimate approximate with deposits?", answer: "The formula assumes each deposit compounds for an average period. Real accounts credit deposits on the day they arrive, which shifts results by a few dollars." }],
    seo: { title: "Compound Interest Calculator – Growth Over Time | CalcForged", description: "Calculate compound interest with any compounding frequency, plus monthly deposits and effective rate.", h1: "Compound interest calculator", intro: "Compound interest is the engine behind both savings growth and debt growth, and small changes in rate or time swing the result surprisingly hard. Enter a starting principal, rate, compounding frequency, and optional monthly deposits to see the final balance, total interest earned, and the effective annual rate your nominal rate really delivers. Use it to compare savings accounts, project a certificate of deposit, or understand what a credit card balance does when left alone." },
    related: ["investment", "savings", "loan"],
  },
  {
    slug: "bmi", name: "BMI Calculator", category: "Health", categorySlug: "health", icon: "⚖", description: "Compute Body Mass Index and see where it falls on the standard scale.",
    fields: [{ key: "weight", label: "Weight", type: "number", min: 20, max: 1000, step: 0.1, defaultValue: 154 }, { key: "weightUnit", label: "Weight unit", type: "select", defaultValue: "lb", options: [{ label: "Pounds (lb)", value: "lb" }, { label: "Kilograms (kg)", value: "kg" }] }, { key: "height", label: "Height", type: "number", min: 20, max: 120, step: 0.5, defaultValue: 67 }, { key: "heightUnit", label: "Height unit", type: "select", defaultValue: "in", options: [{ label: "Inches", value: "in" }, { label: "Centimeters", value: "cm" }] }],
    results: [{ key: "bmi", label: "Your BMI", format: "number" }, { key: "category", label: "Standard category", format: "text" }, { key: "healthyRange", label: "Healthy weight range", format: "text", estimate: true }],
    calculate: (v) => {
      const weight = n(v, "weight", 154); const height = n(v, "height", 67);
      const kg = option(v, "weightUnit", "lb") === "lb" ? weight * 0.45359237 : weight;
      const meters = option(v, "heightUnit", "in") === "in" ? height * 0.0254 : height / 100;
      if (meters <= 0) return { bmi: "—", category: "Enter a valid height", healthyRange: "—" };
      const bmi = kg / (meters * meters);
      const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy weight" : bmi < 30 ? "Overweight" : "Obesity";
      const lowKg = 18.5 * meters * meters; const highKg = 24.9 * meters * meters;
      const toDisplay = (kgValue: number) => option(v, "weightUnit", "lb") === "lb" ? `${Math.round(kgValue / 0.45359237)} lb` : `${Math.round(kgValue)} kg`;
      return { bmi: round(bmi, 1), category, healthyRange: `${toDisplay(lowKg)} – ${toDisplay(highKg)} for your height` };
    },
    howItWorks: ["Weight is converted to kilograms and height to meters.", "BMI equals kilograms divided by height in meters squared.", "The category bands are the standard adult cutoffs: under 18.5, 18.5–24.9, 25–29.9, and 30+."],
    example: { title: "154 lb at 5'7\"", inputs: "154 lb, 67 inches", result: "BMI of about 24.1 — healthy weight, with a range of roughly 118–159 lb." },
    faqs: [{ question: "Is BMI accurate for everyone?", answer: "No. It doesn't distinguish muscle from fat, so athletes often score high, and it isn't calibrated for children, pregnancy, or adults over 65." }, { question: "What BMI is healthy?", answer: "For most adults, 18.5 to 24.9 is the standard healthy band, but individual health depends on far more than this one number." }, { question: "Why does the healthy range use my weight unit?", answer: "The range is calculated from your height and shown in the same unit you entered, so you can compare it directly with your weight." }, { question: "Should I use BMI or body fat percentage?", answer: "BMI is a quick population-level screen; body composition measures say more about individual risk. Treat BMI as a starting point, not a diagnosis." }],
    seo: { title: "BMI Calculator – Body Mass Index | CalcForged", description: "Calculate Body Mass Index in pounds or kilograms and see the standard weight category.", h1: "BMI calculator", intro: "Body Mass Index is the fastest general screen for whether your weight is in a standard healthy band for your height. Enter your weight and height in whichever units you use — pounds or kilograms, inches or centimeters — and the calculator returns your BMI, the standard category, and the weight range that corresponds to a healthy BMI for someone your height. BMI is a population screening tool, not a diagnosis: it can't tell muscle from fat, so use it as a starting point for a conversation with a healthcare provider." },
    related: ["pregnancy-due-date", "weight-converter", "age"],
  },
  {
    slug: "pregnancy-due-date", name: "Pregnancy Due Date Calculator", category: "Health", categorySlug: "health", icon: "🤰", description: "Estimate a due date from your last period or conception date.",
    fields: [{ key: "method", label: "Start from", type: "select", defaultValue: "lmp", options: [{ label: "First day of last period", value: "lmp" }, { label: "Conception date", value: "conception" }] }, { key: "date", label: "Date", type: "text", help: "YYYY-MM-DD" }, { key: "cycle", label: "Average cycle length", type: "number", unit: "days", min: 20, max: 45, defaultValue: 28 }, { key: "asOf", label: "Show progress as of", type: "text", defaultToday: true, help: "Leave blank and today fills in automatically" }],
    results: [{ key: "dueDate", label: "Estimated due date", format: "text", estimate: true }, { key: "conceptionDate", label: "Estimated conception", format: "text", estimate: true }, { key: "progress", label: "Progress on the date above", format: "text", estimate: true }, { key: "trimester", label: "Trimester on that date", format: "text" }],
    calculate: (v) => {
      const start = parseYmd(String(v.date ?? ""));
      if (!start) return { dueDate: "Enter a valid date (YYYY-MM-DD)", conceptionDate: "—", progress: "—", trimester: "—" };
      const method = option(v, "method", "lmp"); const cycleAdjust = method === "lmp" ? n(v, "cycle", 28) - 28 : 0;
      const conception = method === "lmp" ? addDaysUtc(start, 14 + cycleAdjust) : start;
      const due = addDaysUtc(conception, 266);
      const asOf = parseYmd(String(v.asOf ?? ""));
      if (!asOf) return { dueDate: fmtDate(due), conceptionDate: fmtDate(conception), progress: "—", trimester: "—" };
      const days = Math.floor((asOf.getTime() - start.getTime()) / 86400000);
      if (days < 0) return { dueDate: fmtDate(due), conceptionDate: fmtDate(conception), progress: "Cycle day " + (days + 280 > 0 ? Math.max(1, days + 281) : 1), trimester: "—" };
      const weeks = Math.floor(days / 7); const remainder = days % 7;
      const trimester = weeks < 13 ? "First trimester" : weeks < 27 ? "Second trimester" : "Third trimester";
      return { dueDate: fmtDate(due), conceptionDate: fmtDate(conception), progress: weeks > 42 ? "Past 42 weeks — speak with your provider" : `${weeks} weeks, ${remainder} days pregnant`, trimester };
    },
    howItWorks: ["From the first day of your last period, the estimate adds 280 days, adjusted by your average cycle length (Naegele's rule).", "From a known or estimated conception date, it adds 266 days.", "Progress counts completed weeks and days from the start date to the date shown, using standard obstetric counting."],
    example: { title: "Last period June 1", inputs: "LMP June 1, 28-day cycle", result: "Estimated due date around March 8, with conception near June 15." },
    faqs: [{ question: "How accurate is a due date estimate?", answer: "Only a small share of babies arrive on their estimated date; most arrive within a window about two weeks either side. An early ultrasound is the most accurate dating method." }, { question: "Why does cycle length change the estimate?", answer: "The 280-day rule assumes ovulation on day 14. If your cycles run longer or shorter, ovulation likely shifted, so the estimate moves with it." }, { question: "Why is progress counted from the last period?", answer: "Pregnancy age is conventionally counted from the first day of the last menstrual period, which is about two weeks before conception." }, { question: "Is this medical advice?", answer: "No. This is a planning estimate. Your prenatal provider will confirm dating with measurements and adjust as needed." }],
    seo: { title: "Pregnancy Due Date Calculator – Estimate Your Date | CalcForged", description: "Estimate a due date from the first day of your last period or a conception date, with progress and trimester.", h1: "Pregnancy due date calculator", intro: "An estimated due date gives a pregnancy its shape: appointments, planning, and the finish line. Enter the first day of your last menstrual period — or a known conception date — and your average cycle length. The calculator applies the standard obstetric rules (280 days from the last period, adjusted for cycle length, or 266 days from conception), estimates the conception window, and shows how many weeks along the pregnancy is as of today. Every estimate is a midpoint, not a deadline; most babies arrive within about two weeks of the date." },
    related: ["bmi", "age", "time-zone"],
  },
  {
    slug: "currency-converter", name: "Currency Converter", category: "Travel", categorySlug: "travel", icon: "💱", description: "Convert between major world currencies using live exchange rates.",
    liveRates: true,
    fields: [{ key: "amount", label: "Amount", type: "number", min: 0, step: 0.01, defaultValue: 100 }, { key: "from", label: "From currency", type: "select", defaultValue: "USD", options: CURRENCIES }, { key: "to", label: "To currency", type: "select", defaultValue: "EUR", options: CURRENCIES }],
    results: [{ key: "converted", label: "Converted amount", format: "number", estimate: true }, { key: "rate", label: "Exchange rate", format: "text" }, { key: "inverse", label: "Inverse rate", format: "text" }, { key: "source", label: "Rate source", format: "text" }],
    calculate: (v) => {
      const amount = n(v, "amount", 100); const from = option(v, "from", "USD"); const to = option(v, "to", "EUR");
      let rates = FALLBACK_RATES; let source = "Built-in snapshot — live rates unavailable";
      try { const parsed = JSON.parse(String(v.__rates ?? "")) as { rates?: Record<string, number>; date?: string }; if (parsed?.rates && Object.keys(parsed.rates).length > 5) { rates = parsed.rates; source = `Live European Central Bank reference rates${parsed.date ? ` · ${parsed.date}` : ""}`; } } catch { /* fallback stands */ }
      const rate = (rates[to] ?? FALLBACK_RATES[to]) / (rates[from] ?? FALLBACK_RATES[from]);
      return { converted: round(amount * rate, 2), rate: `1 ${from} = ${round(rate, 4)} ${to}`, inverse: `1 ${to} = ${round(1 / rate, 4)} ${from}`, source };
    },
    howItWorks: ["The converter pulls the latest reference rates when the page loads and refreshes them each visit.", "Cross rates are derived from each currency's rate against the US dollar.", "If the rate service can't be reached, a built-in snapshot is used and the source line says so."],
    example: { title: "$100 to euros", inputs: "100 USD to EUR at 0.92", result: "About €92.00, with the inverse rate shown for the trip home." },
    faqs: [{ question: "How current are these rates?", answer: "When live rates load, they're the latest European Central Bank reference rates, updated each business day. The source line shows the rate date." }, { question: "Will I get this rate at the airport?", answer: "Almost never. Banks, cards, and exchange kiosks add a margin on top of the mid-market rate, so expect a few percent worse in practice." }, { question: "Which cards give the best conversion?", answer: "Many travel-friendly cards convert close to the mid-market rate with no foreign transaction fee — usually far better than cash exchange kiosks." }, { question: "What does the inverse rate mean?", answer: "It's the reverse conversion, so you can sanity-check prices in both directions without flipping the calculator around." }],
    seo: { title: "Currency Converter – Live Exchange Rates | CalcForged", description: "Convert between USD, EUR, GBP, JPY, and more with live reference rates and inverse rates.", h1: "Currency converter", intro: "Whether you're pricing a hotel or checking a receipt from a trip, this converter translates between ten major currencies using live central-bank reference rates, loaded fresh each visit. Enter an amount, pick the two currencies, and see the converted result plus the exact exchange rate and its inverse. The rate you're shown is the mid-market reference — the honest baseline — while banks and exchange services add their own margin on top, so budget a few percent worse for real-world transactions." },
    related: ["time-zone", "tip", "percentage"],
  },
  {
    slug: "time-zone", name: "Time Zone Calculator", category: "Travel", categorySlug: "travel", icon: "🕐", description: "Convert a time between two cities and see the gap and day shift.",
    fields: [{ key: "date", label: "Date", type: "text", defaultToday: true, help: "YYYY-MM-DD — leave blank for today" }, { key: "time", label: "Time to convert", type: "text", help: "24-hour clock, e.g. 14:30", defaultValue: "14:30" }, { key: "fromZone", label: "From", type: "select", defaultValue: "America/New_York", options: ZONES }, { key: "toZone", label: "To", type: "select", defaultValue: "Asia/Tokyo", options: ZONES }],
    results: [{ key: "converted", label: "Time there", format: "text" }, { key: "difference", label: "Time difference", format: "text" }, { key: "dayShift", label: "Day", format: "text" }],
    calculate: (v) => {
      const from = option(v, "fromZone", "America/New_York"); const to = option(v, "toZone", "Asia/Tokyo");
      const dateStr = String(v.date ?? "").trim(); const timeStr = String(v.time ?? "").trim();
      const utc = zonedToUtc(dateStr || "2000-01-01", timeStr || "12:00", from);
      if (!utc) return { converted: "Enter a time like 14:30 and a date like 2026-01-31", difference: "—", dayShift: "—" };
      const stamp = zoneStamp(utc, to);
      const difference = from === to ? "Same time zone" : `${zoneDiffLabel(from, to, utc)} relative to the starting zone`;
      const convertedDay = new Intl.DateTimeFormat("en-CA", { timeZone: to, year: "numeric", month: "2-digit", day: "2-digit" }).format(utc);
      const startDay = parseYmd(dateStr);
      const dayShift = startDay ? (convertedDay === dateStr ? "Same day" : convertedDay > dateStr ? "Next day" : "Previous day") : "—";
      return { converted: stamp, difference, dayShift };
    },
    howItWorks: ["Your entered time is interpreted in the starting zone, including daylight saving rules for that exact date.", "The instant is then displayed in the destination zone using its own DST rules.", "The difference and day shift are calculated for the specific date, so crossings near a DST change stay correct."],
    example: { title: "2:30 PM New York to Tokyo", inputs: "Any weekday, 14:30 ET → Asia/Tokyo", result: "About 3:30 AM the next day in Tokyo, 13–14 hours ahead depending on DST." },
    faqs: [{ question: "Why does the difference change during the year?", answer: "Daylight saving starts and ends on different dates in different countries, so the gap between two zones can shift by an hour for part of the year. This tool uses the exact date you enter." }, { question: "Does it handle half-hour zones?", answer: "Yes. Zones like India (UTC+5:30) are shown with their exact minute offsets." }, { question: "What time format should I enter?", answer: "24-hour time, like 09:00 or 21:45. The result is shown in 12-hour format with AM/PM." }, { question: "Is this good for scheduling calls?", answer: "Yes — enter the time you want to meet in your zone and read what it becomes for the other person, including whether it lands on their next day." }],
    seo: { title: "Time Zone Calculator – Convert Time Between Cities | CalcForged", description: "Convert times between world cities with daylight-saving-aware results and the exact hour difference.", h1: "Time zone calculator", intro: "Scheduling across time zones goes wrong in two ways: an hour lost to daylight saving, or a meeting that lands on someone's next day. This converter takes a date and time in one zone and shows exactly when it lands in another, with the precise hour difference and any day shift. It uses each zone's real daylight-saving rules for the date you enter, handles half-hour offsets like India, and covers 19 major zones from Honolulu to Auckland — enough for scheduling calls, flights, and launches." },
    related: ["currency-converter", "age", "percentage"],
  },
  {
    slug: "percentage", name: "Percentage Calculator", category: "Everyday Life", categorySlug: "everyday-life", icon: "%", description: "Find a percentage of a number, a share of a whole, or the change between two values.",
    fields: [{ key: "mode", label: "What do you need?", type: "select", defaultValue: "of", options: [{ label: "X% of Y — e.g. 15% of 200", value: "of" }, { label: "X is what % of Y — e.g. 30 of 200", value: "share" }, { label: "% change from X to Y — e.g. 80 → 100", value: "change" }] }, { key: "x", label: "X", type: "number", step: 0.01, defaultValue: 15 }, { key: "y", label: "Y", type: "number", step: 0.01, defaultValue: 200 }],
    results: [{ key: "result", label: "Result", format: "number" }, { key: "formula", label: "What was computed", format: "text" }],
    calculate: (v) => {
      const x = n(v, "x", 15); const y = n(v, "y", 200); const mode = option(v, "mode", "of");
      if (mode === "share") return { result: y === 0 ? "—" : round((x / y) * 100, 2), formula: `${x} ÷ ${y} × 100 — X as a share of Y` };
      if (mode === "change") return { result: x === 0 ? "—" : round(((y - x) / Math.abs(x)) * 100, 2), formula: `(${y} − ${x}) ÷ ${Math.abs(x)} × 100 — change from X to Y` };
      return { result: round((x / 100) * y, 2), formula: `${x}% × ${y} — X percent of Y` };
    },
    howItWorks: ["Pick the mode first — the same two numbers mean different things in each mode.", "X% of Y multiplies; X as a share of Y divides; percent change divides the difference by the starting value.", "Percent change is negative when the value falls and uses the absolute starting value as its base."],
    example: { title: "Tip on a discount", inputs: "15% of 200", result: "30." },
    faqs: [{ question: "How do I calculate a discount?", answer: "Use X% of Y to get the discount amount, then subtract it from the price. For a $80 item at 25% off, the discount is $20 and the price is $60." }, { question: "How do I add a percentage, like tax or tip?", answer: "Use % change from X to Y in reverse, or simply compute X% of Y and add it. A 15% tip on $60 is $9, so pay $69." }, { question: "Why is my percent change negative?", answer: "The value went down. A drop from 100 to 80 is −20%, calculated against the original 100." }, { question: "What's the difference between percent and percentage points?", answer: "Going from 10% to 15% is a 5 percentage-point rise, but a 50% relative change. This calculator computes the relative change." }],
    seo: { title: "Percentage Calculator – Discounts, Shares & Change | CalcForged", description: "Calculate X% of Y, one number as a percentage of another, or the percent change between two values.", h1: "Percentage calculator", intro: "Percentages trip people up because the same two numbers can answer three different questions: what is 15% of 200, what share of 200 is 30, and how much did 80 change to become 100. Pick the question, enter two numbers, and get the answer with the exact formula shown beside it. This covers discounts, tax, tips, grade shares, price increases, and the percentage-point versus percent-change distinction that catches so many people out." },
    related: ["tip", "weight-converter", "square-root-cube-root"],
  },
  {
    slug: "weight-converter", name: "Weight Converter", category: "Everyday Life", categorySlug: "everyday-life", icon: "⇄", description: "Convert between pounds, kilograms, ounces, grams, and stone.",
    fields: [{ key: "weight", label: "Weight", type: "number", min: 0, step: 0.01, defaultValue: 150 }, { key: "from", label: "From unit", type: "select", defaultValue: "lb", options: [{ label: "Pounds (lb)", value: "lb" }, { label: "Kilograms (kg)", value: "kg" }, { label: "Ounces (oz)", value: "oz" }, { label: "Grams (g)", value: "g" }, { label: "Stone (st)", value: "st" }] }, { key: "to", label: "To unit", type: "select", defaultValue: "kg", options: [{ label: "Pounds (lb)", value: "lb" }, { label: "Kilograms (kg)", value: "kg" }, { label: "Ounces (oz)", value: "oz" }, { label: "Grams (g)", value: "g" }, { label: "Stone (st)", value: "st" }] }],
    results: [{ key: "converted", label: "Converted weight", format: "number" }, { key: "all", label: "In every unit", format: "text" }],
    calculate: (v) => {
      const weight = n(v, "weight", 150); const from = option(v, "from", "lb"); const to = option(v, "to", "kg");
      const kg: Record<string, number> = { lb: 0.45359237, kg: 1, oz: 0.028349523125, g: 0.001, st: 6.35029318 };
      const inKg = weight * kg[from];
      const display = (unit: string) => { const value = inKg / kg[unit]; return `${round(value, value < 10 ? 3 : 2)} ${unit}`; };
      return { converted: round(inKg / kg[to], 4), all: (["lb", "kg", "oz", "g", "st"] as const).map(display).join("\n") };
    },
    howItWorks: ["The entered weight is converted to kilograms using exact standard factors.", "Kilograms are then converted to your chosen target unit.", "The full conversion table shows the same weight in all five units at once."],
    example: { title: "150 lb in kilograms", inputs: "150 lb → kg", result: "About 68.04 kg — and the table shows ounces, grams, and stone too." },
    faqs: [{ question: "How many pounds is a kilogram?", answer: "One kilogram is about 2.2046 pounds. For quick mental math, multiply kilograms by 2.2." }, { question: "What is stone, and who uses it?", answer: "A stone is 14 pounds, commonly used for body weight in the UK and Ireland." }, { question: "How precise are the conversions?", answer: "The factors are exact by definition where possible (pound, ounce, gram); results are rounded for display but computed from full precision." }, { question: "Does this work for cooking measurements?", answer: "Yes for weight — ounces and grams here are units of mass. Fluid ounces measure volume and are not interchangeable." }],
    seo: { title: "Weight Converter – lb, kg, oz, g & stone | CalcForged", description: "Convert weight between pounds, kilograms, ounces, grams, and stone with exact factors.", h1: "Weight converter", intro: "Weight units split awkwardly across the Atlantic: recipes in grams, gym plates in pounds, body weight in stone in the UK. This converter handles all five units with exact standard factors — enter a weight, pick the units, and see the precise conversion plus a table showing the same weight in every unit at once. Useful for travel, shipping, cooking from foreign recipes, and translating a medical form that assumes you think in kilograms." },
    related: ["percentage", "bmi", "currency-converter"],
  },
  {
    slug: "tip", name: "Tip Calculator", category: "Everyday Life", categorySlug: "everyday-life", icon: "🧾", description: "Work out the tip, the total, and what each person owes — with optional rounding.",
    fields: [{ key: "bill", label: "Bill amount", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 85 }, { key: "tipPercent", label: "Tip percentage", type: "number", unit: "%", min: 0, max: 100, step: 1, defaultValue: 18 }, { key: "split", label: "Split between", type: "number", unit: "people", min: 1, max: 100, defaultValue: 1 }, { key: "roundUp", label: "Round each share", type: "select", defaultValue: "no", options: [{ label: "No rounding", value: "no" }, { label: "Round up to whole dollars", value: "yes" }] }],
    results: [{ key: "tip", label: "Tip amount", unit: "$", format: "currency" }, { key: "total", label: "Total with tip", unit: "$", format: "currency" }, { key: "perPerson", label: "Per person", unit: "$", format: "currency" }, { key: "note", label: "Rounding note", format: "text" }],
    calculate: (v) => {
      const bill = n(v, "bill", 85); const percent = n(v, "tipPercent", 18); const people = Math.max(1, n(v, "split", 1));
      const tip = bill * percent / 100; const total = bill + tip; const perPerson = total / people;
      if (option(v, "roundUp", "no") === "yes") {
        const rounded = Math.ceil(perPerson); const adjustedTotal = rounded * people;
        return { tip: round(adjustedTotal - bill, 2), total: round(adjustedTotal, 2), perPerson: rounded, note: `Each of ${people} pays $${rounded}, putting the effective tip at ${bill ? round(((adjustedTotal - bill) / bill) * 100, 1) : 0}%.` };
      }
      return { tip: round(tip, 2), total: round(total, 2), perPerson: round(perPerson, 2), note: "Turn on rounding to make each share a whole dollar amount." };
    },
    howItWorks: ["The tip is the bill multiplied by your percentage.", "The total is bill plus tip, divided evenly across the number of people.", "With rounding on, each person's share is rounded up to the next whole dollar and the effective tip percentage is recalculated."],
    example: { title: "$85 dinner for two", inputs: "18% tip, 2 people, rounded", result: "$51 each, an effective tip of 20%." },
    faqs: [{ question: "How much should I tip?", answer: "In the US, 15–20% at restaurants is customary, with 20% for great service. Tipping norms differ widely by country and service type." }, { question: "Should I tip on tax?", answer: "Practice varies. Tipping on the pre-tax subtotal is the traditional approach; many people simply tip on the full bill for simplicity." }, { question: "Does rounding overtip?", answer: "Slightly — the note shows the effective percentage so you can see exactly what the rounded shares add up to." }, { question: "What if the bill includes a service charge?", answer: "Large parties often carry an automatic gratuity. If the bill already includes service, an additional tip is optional." }],
    seo: { title: "Tip Calculator – Split the Bill | CalcForged", description: "Calculate the tip, total, and per-person share for any bill, with optional dollar rounding.", h1: "Tip calculator", intro: "The check arrives, the table does mental math, and someone always rounds wrong. Enter the bill, choose a tip percentage, and say how many people are splitting; the calculator shows the tip, the total, and each person's share. Turn on rounding and every share becomes a clean whole-dollar amount — with the effective tip percentage shown so you know exactly what the rounding did. Useful at restaurants, for haircuts, taxis, delivery, and any service where the tip is expected." },
    related: ["percentage", "currency-converter", "loan"],
  },
  {
    slug: "age", name: "Age Calculator", category: "Everyday Life", categorySlug: "everyday-life", icon: "🎂", description: "Find an exact age in years, months, and days — plus the next birthday.",
    fields: [{ key: "birthDate", label: "Date of birth", type: "text", help: "YYYY-MM-DD" }, { key: "asOf", label: "Age on this date", type: "text", defaultToday: true, help: "Leave blank and today fills in automatically" }],
    results: [{ key: "summary", label: "Exact age", format: "text" }, { key: "totalDays", label: "Total days lived", unit: "days", format: "number", estimate: true }, { key: "nextBirthday", label: "Next birthday in", unit: "days", format: "number" }, { key: "bornOn", label: "Born on a", format: "text" }],
    calculate: (v) => {
      const birth = parseYmd(String(v.birthDate ?? "")); const asOf = parseYmd(String(v.asOf ?? ""));
      if (!birth || !asOf) return { summary: "Enter a birth date like 1990-05-14", totalDays: "—", nextBirthday: "—", bornOn: "—" };
      if (birth > asOf) return { summary: "That birth date is in the future", totalDays: "—", nextBirthday: "—", bornOn: "—" };
      let years = asOf.getUTCFullYear() - birth.getUTCFullYear();
      let months = asOf.getUTCMonth() - birth.getUTCMonth();
      let days = asOf.getUTCDate() - birth.getUTCDate();
      if (days < 0) { months -= 1; days += new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), 0)).getUTCDate(); }
      if (months < 0) { years -= 1; months += 12; }
      const totalDays = Math.floor((asOf.getTime() - birth.getTime()) / 86400000);
      let next = Date.UTC(asOf.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate());
      if (next <= asOf.getTime()) next = Date.UTC(asOf.getUTCFullYear() + 1, birth.getUTCMonth(), birth.getUTCDate());
      const bornWeekday = birth.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long" });
      return { summary: `${years} years, ${months} months, ${days} days`, totalDays, nextBirthday: Math.round((next - asOf.getTime()) / 86400000), bornOn: bornWeekday };
    },
    howItWorks: ["Years, months, and days are counted calendar-accurately, borrowing days from the previous month when needed.", "Total days is the exact day count between the two dates.", "The next birthday is the upcoming anniversary of the birth date; if today is the birthday, it counts to next year."],
    example: { title: "Born May 14, 1990", inputs: "As of January 31, 2026", result: "35 years, 8 months, 17 days — next birthday in 103 days." },
    faqs: [{ question: "Why do months vary in length?", answer: "Calendar months run 28 to 31 days, so an age in years-months-days depends on which months are involved. The day count is always exact." }, { question: "Can I calculate an age on a past or future date?", answer: "Yes — edit the second date to any day, past or future, and the age is calculated as of that date." }, { question: "Does it handle leap-year birthdays?", answer: "February 29 birthdays are counted on March 1 in non-leap years for the next-birthday result." }, { question: "Why would I need an exact day count?", answer: "Visa and residency applications, insurance forms, and sports age divisions often ask for age in years, months, and days rather than just years." }],
    seo: { title: "Age Calculator – Exact Age in Years, Months & Days | CalcForged", description: "Calculate exact age from a birth date, with total days lived, next birthday countdown, and birth weekday.", h1: "Age calculator", intro: "\"How old are you\" has a simple answer until a form asks for it exactly. Enter a date of birth and this calculator returns the precise age in years, months, and days as of today (or any date you choose), plus the total days lived, a countdown to the next birthday, and the weekday you were born on. Calendar-accurate, including leap years — useful for applications, anniversaries, milestone planning, and settling birthday debates." },
    related: ["pregnancy-due-date", "bmi", "percentage"],
  },
  {
    slug: "gpa", name: "GPA Calculator", category: "Education", categorySlug: "education", icon: "🎓", description: "Calculate your grade point average from course credits and letter grades.",
    fields: [{ key: "courses", label: "Courses", type: "ingredient-list", help: "One row per course: name, credit hours in the amount box, and final grade (A, B+, C− …) in the unit box." }],
    results: [{ key: "gpa", label: "Your GPA", format: "number" }, { key: "credits", label: "Total credits", unit: "credits", format: "number" }, { key: "qualityPoints", label: "Quality points", format: "number" }, { key: "band", label: "Letter equivalent", format: "text" }],
    calculate: (v) => {
      const rows = Array.isArray(v.courses) ? v.courses : [];
      let credits = 0; let points = 0; let counted = 0;
      for (const row of rows) {
        const courseCredits = Number(row.amount) || 0;
        const grade = (row.unit || "").trim().toUpperCase();
        const gp = GPA_POINTS[grade];
        if (!courseCredits || gp === undefined) continue;
        credits += courseCredits; points += courseCredits * gp; counted += 1;
      }
      if (!credits) return { gpa: "—", credits: 0, qualityPoints: 0, band: "Add at least one course with credits and a letter grade" };
      const gpa = points / credits;
      const band = gpa >= 3.85 ? "A" : gpa >= 3.5 ? "A−" : gpa >= 3.15 ? "B+" : gpa >= 2.85 ? "B" : gpa >= 2.5 ? "B−" : gpa >= 2.15 ? "C+" : gpa >= 1.85 ? "C" : gpa >= 1.5 ? "C−" : gpa >= 1.15 ? "D+" : gpa >= 0.85 ? "D" : "F";
      return { gpa: round(gpa, 2), credits: round(credits, 1), qualityPoints: round(points, 1), band: `${band} average across ${counted} course${counted === 1 ? "" : "s"}` };
    },
    howItWorks: ["Each letter grade is converted to grade points on the standard 4.0 scale (A = 4.0, B+ = 3.3, and so on).", "Quality points are grade points multiplied by credit hours for every course.", "Your GPA is total quality points divided by total credits — weighted exactly the way most registrars calculate it."],
    example: { title: "Four-course semester", inputs: "A in a 4-credit course, B+ in 3 credits, B in 3 credits, A− in 2 credits", result: "About 3.52 GPA across 12 credits." },
    faqs: [{ question: "Which grade scale does this use?", answer: "The common 4.0 scale with plus/minus grades: A = 4.0, A− = 3.7, B+ = 3.3, down to F = 0. If your school uses a different scale, adjust your expectations accordingly." }, { question: "Are pass/fail courses included?", answer: "No — enter only letter-graded courses. Pass/fail credits usually don't affect GPA, though they may count toward enrollment totals." }, { question: "How do I project my semester GPA?", answer: "Enter just this semester's courses. To see a cumulative GPA, add previous courses too, using their actual grades and credits." }, { question: "Why do credits matter so much?", answer: "A 4-credit course moves your GPA more than a 1-credit lab. Credit weighting is exactly why two students with the same grades can have different GPAs." }],
    seo: { title: "GPA Calculator – Weighted Grade Point Average | CalcForged", description: "Calculate your GPA on the 4.0 scale from course credits and letter grades, weighted properly.", h1: "GPA calculator", intro: "A GPA isn't an average of grades — it's an average weighted by credit hours, which is why that 4-credit chemistry course matters more than a 1-credit seminar. Add one row per course with its credits and final letter grade, and this calculator converts grades to the standard 4.0 scale, sums the quality points, and divides by total credits. Use it at the end of a semester, to project what final grades will do to your cumulative GPA, or to see exactly what raising one grade is worth." },
    related: ["square-root-cube-root", "percentage", "age"],
  },
  {
    slug: "square-root-cube-root", name: "Square Root & Cube Root Calculator", category: "Education", categorySlug: "education", icon: "🔢", description: "Get square roots, cube roots, and any nth root — with the math shown.",
    fields: [{ key: "value", label: "Number", type: "number", step: "any", defaultValue: 144 }, { key: "n", label: "For nth root, use n", type: "number", unit: "n", min: 2, max: 12, step: 1, defaultValue: 4 }],
    results: [{ key: "sqrt", label: "Square root (√)", format: "number" }, { key: "cbrt", label: "Cube root (∛)", format: "number" }, { key: "nth", label: "nth root", format: "text" }, { key: "check", label: "Check", format: "text" }],
    calculate: (v) => {
      const value = n(v, "value", 144); const nth = Math.round(n(v, "n", 4));
      const sqrtNum = value < 0 ? NaN : Math.sqrt(value);
      const cbrt = Math.cbrt(value);
      const nthRoot = (x: number, root: number) => (x < 0 && root % 2 === 0 ? null : Math.sign(x) * Math.abs(x) ** (1 / root));
      const nthValue = nthRoot(value, nth);
      return {
        sqrt: value < 0 ? "Not a real number" : round(sqrtNum, 6),
        cbrt: round(cbrt, 6),
        nth: nthValue === null ? `No real ${nth}th root of a negative number` : `ⁿ√ with n = ${nth}: ${round(nthValue, 6)}`,
        check: value < 0 ? "Square is negative — no real square root" : Number.isInteger(sqrtNum) ? `${sqrtNum} × ${sqrtNum} = ${value}` : `${round(sqrtNum, 4)}² ≈ ${value}`,
      };
    },
    howItWorks: ["The square root is the number that, multiplied by itself, gives your input.", "The cube root handles negatives correctly — ∛−27 is −3 — because odd roots of negatives are real.", "The nth root takes any n from 2 to 12; even roots of negative numbers have no real solution and the result says so."],
    example: { title: "144", inputs: "Value 144, n = 4", result: "√144 = 12, ∛144 ≈ 5.24, and the 4th root is ≈ 3.46." },
    faqs: [{ question: "Why is the square root of a negative number impossible?", answer: "No real number times itself is negative, so even roots of negatives have no real solution — they live in complex numbers, which this calculator doesn't show." }, { question: "How do I estimate a square root mentally?", answer: "Find the nearest perfect squares above and below your number and interpolate. √50 sits between 7 (49) and 8 (64), so around 7.07." }, { question: "What is a principal root?", answer: "Every positive number has two square roots, positive and negative. The √ symbol means the positive one — the principal root — and that's what's shown." }, { question: "When would I need an nth root?", answer: "Geometry and finance both use them: side lengths from areas and volumes, and compound-growth back-solving (the 12th root of a 12-year growth factor gives the annual rate)." }],
    seo: { title: "Square Root Calculator – With Cube & nth Roots | CalcForged", description: "Calculate square roots, cube roots, and any nth root instantly, with a verification check.", h1: "Square root and cube root calculator", intro: "Roots come up everywhere: geometry homework, the Pythagorean theorem, standard deviations, and back-solving growth rates. Enter any number and get the square root and cube root instantly, plus any nth root from 2 to 12 with the n of your choice. Negative numbers are handled correctly — odd roots of negatives are real, even roots are flagged rather than silently wrong — and a check line shows the arithmetic so you can trust the answer at a glance." },
    related: ["gpa", "percentage", "compound-interest"],
  },
  {
    slug: "wedding-dessert-table", name: "Wedding Dessert Table Calculator", category: "Events", categorySlug: "events", icon: "🍰", description: "Plan dessert pieces, cake slices, and variety for a wedding dessert spread.",
    fields: [{ key: "guests", label: "Guests", type: "number", unit: "people", min: 1, max: 1000, defaultValue: 80 }, { key: "cakePlan", label: "Cake plan", type: "select", defaultValue: "cake-table", options: [{ label: "Dessert table only (no cake)", value: "none" }, { label: "Cake only", value: "cake" }, { label: "Cake + dessert table", value: "cake-table" }] }, { key: "dessertTypes", label: "Dessert types on the table", type: "number", unit: "types", min: 1, max: 12, step: 1, defaultValue: 5 }, { key: "portionStyle", label: "Portion style", type: "select", defaultValue: "mini", options: [{ label: "Mini desserts (2 to 3 bites)", value: "mini" }, { label: "Full servings", value: "full" }] }],
    results: [{ key: "totalPieces", label: "Total dessert pieces", unit: "pieces", format: "number", estimate: true, interpretation: "Cake slices plus table pieces to prepare." }, { key: "tablePieces", label: "Dessert table pieces", unit: "pieces", format: "number", estimate: true }, { key: "perType", label: "Pieces per dessert type", unit: "pieces", format: "number", estimate: true }, { key: "guidance", label: "Serving guidance", format: "text", estimate: true }],
    calculate: (v) => {
      const guests = n(v, "guests", 80);
      const plan = option(v, "cakePlan", "cake-table");
      const types = Math.max(1, Math.round(n(v, "dessertTypes", 5)));
      const mini = option(v, "portionStyle", "mini") === "mini";
      const tablePieces = ceil(guests * (mini ? (plan === "none" ? 3.5 : plan === "cake-table" ? 2.5 : 0) : plan === "none" ? 1.25 : plan === "cake-table" ? 0.75 : 0));
      const cakeSlices = plan === "cake" ? ceil(guests) : plan === "cake-table" ? ceil(guests * 0.8) : 0;
      const perType = Math.round(tablePieces / types);
      const varietyNote = guests < 100 ? "Four to six dessert types work well under 100 guests." : guests < 150 ? "Five to seven dessert types suit an event this size." : "Six to eight dessert types give a full table without extra complexity.";
      const cakeNote = plan === "none" ? " With no cake, the table carries the whole dessert course." : plan === "cake" ? " With cake as the only dessert, plan a slice for every guest." : " Cake covers most of the dessert need, so the table stays light.";
      return { totalPieces: tablePieces + cakeSlices, tablePieces, perType, guidance: `${varietyNote}${cakeNote}` };
    },
    howItWorks: ["Cake served on its own is planned at one slice per guest; paired with a dessert table, slices for about 80% of guests are enough because some guests skip a slice.", "Without cake, plan 3 to 4 mini desserts per guest; with cake and a table together, 2 to 3 mini portions per guest cover the gap the cake leaves.", "Table pieces divide evenly across your dessert types, and full servings are planned at roughly a third of the mini count."],
    example: { title: "80 guests, cake plus table", inputs: "Cake + dessert table, 5 types, mini desserts", result: "About 64 cake slices and 200 mini desserts — 264 pieces total, roughly 40 pieces per dessert type." },
    faqs: [{ question: "Do cookies count as dessert pieces?", answer: "Yes. A standard cookie, brownie square, or small tart counts as one mini piece. For very small bites, plan one and a half to two pieces so the tray does not empty early." }, { question: "Mini desserts or full servings?", answer: "Minis let guests sample several things without waste — 3 to 4 mini pieces is roughly one full serving. Full servings suit a seated dessert course where each guest takes one plate." }, { question: "How much cake should I order per guest?", answer: "One slice per serving is the unit. When cake shares the table with other desserts, ordering for about 80% of guests is standard since not everyone takes a slice; when cake is the only dessert, plan a slice for every guest." }, { question: "When can you skip the dessert table?", answer: "Whenever budget or logistics say so. A well-sized cake is a complete dessert course on its own — the table adds variety and visual appeal, not a requirement." }],
    seo: { title: "Wedding Dessert Table Calculator – Pieces Per Guest | CalcForged", description: "Plan how many desserts for a wedding: mini pieces per guest, cake slices, and dessert types for the table.", h1: "Wedding dessert table calculator", intro: "A dessert table looks effortless and hides a real question: how many desserts does a wedding actually need? Enter your guest count, whether cake is served, the number of dessert types you want, and whether you are serving minis or full servings. The calculator plans cake slices and table pieces separately, using the portion rules caterers work with — 3 to 4 mini desserts per guest when there is no cake, 2 to 3 when cake is sharing the job, and slices for about 80% of guests when cake and table run together. Use the result as your buying list, then divide it across your dessert types." },
    related: ["wedding-food", "catering-food-quantity", "appetizers-per-person"],
  },
  {
    slug: "catering-price-per-person", name: "Catering Price Per Person Calculator", category: "Business", categorySlug: "business", icon: "🧾", description: "Set a per-person catering charge from food cost, labor, and your target margin.",
    fields: [{ key: "guests", label: "Guests", type: "number", unit: "people", min: 1, max: 5000, defaultValue: 40 }, { key: "serviceStyle", label: "Service style", type: "select", defaultValue: "buffet", options: [{ label: "Plated dinner", value: "plated" }, { label: "Buffet", value: "buffet" }, { label: "Cocktail reception", value: "cocktail" }, { label: "Food stations", value: "stations" }] }, { key: "foodCost", label: "Food cost per person", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 18 }, { key: "pricingBasis", label: "Pricing basis", type: "select", defaultValue: "pct", options: [{ label: "Target food-cost percentage", value: "pct" }, { label: "Labor + overhead added", value: "labor" }] }, { key: "targetPct", label: "Target food-cost percentage", type: "number", unit: "%", min: 5, max: 90, defaultValue: 30 }, { key: "laborCost", label: "Labor + overhead per person", type: "number", unit: "$", min: 0, step: 0.01, defaultValue: 15, help: "Used when the pricing basis is labor + overhead." }],
    results: [{ key: "charge", label: "Suggested charge per person", unit: "$", format: "currency", estimate: true }, { key: "quote", label: "Total quote", unit: "$", format: "currency", estimate: true }, { key: "foodPct", label: "Food cost at that price", unit: "%", format: "percent" }, { key: "marketNote", label: "Market range check", format: "text", estimate: true, interpretation: "A sanity check against typical per-guest pricing — not a quote." }],
    calculate: (v) => {
      const guests = n(v, "guests", 40);
      const food = n(v, "foodCost", 18);
      const pct = Math.max(5, n(v, "targetPct", 30)) / 100;
      const labor = n(v, "laborCost", 15);
      const charge = option(v, "pricingBasis", "pct") === "labor" ? food / pct + labor : food / pct;
      const quote = Math.round(charge * guests);
      const foodPct = charge ? round((food / charge) * 100, 1) : 0;
      const style = option(v, "serviceStyle", "buffet");
      const range = style === "plated" ? [75, 150] : style === "cocktail" ? [45, 95] : [55, 110];
      const marketNote = charge < range[0] ? `Below the typical $${range[0]}–$${range[1]} range for this style — check that labor and rentals are covered.` : charge > range[1] ? `Above the typical $${range[0]}–$${range[1]} range for this style — the menu or market will need to support it.` : `Inside the typical $${range[0]}–$${range[1]} per-guest range for this service style.`;
      return { charge: round(charge, 2), quote, foodPct, marketNote };
    },
    howItWorks: ["The classic baseline is to charge about three times your food cost, which puts food at 30% of the price.", "Pricing from labor instead marks your food up to the target percentage, then adds your per-person labor and overhead on top.", "The range check compares your charge with typical market pricing for the service style; rentals, tax, and gratuity usually sit on top of food in real quotes."],
    example: { title: "40-guest buffet", inputs: "Buffet, $18 food cost, 30% target", result: "A $60 per-person charge, a $2,400 total quote, and a note that $60 sits inside the typical buffet range of $55–$110." },
    faqs: [{ question: "What percentage should food cost be?", answer: "Many caterers target 28% to 35%. At 30%, charging three times your food cost covers the margin; higher-cost menus or heavy staffing mean the number should be checked against your full costs." }, { question: "What do I add for labor?", answer: "Staff hours times wages plus payroll burden, then rentals, transport, and overhead. A service charge of 18% to 22% on the subtotal is also common practice in catering quotes." }, { question: "How should I price beverages?", answer: "Keep them as a separate line. A per-person drink package or a consumption-based bar both work; folding drinks into the food number hides your real margin." }, { question: "How do deposits usually work?", answer: "A deposit of 25% to 50% holds the date, with the balance due a week or more before the event. Put both dates in the contract." }],
    seo: { title: "Catering Price Per Person Calculator | CalcForged", description: "Work out how much to charge per person for catering, with a market-range sanity check.", h1: "Catering price per person calculator", intro: "How much to charge per person for catering is part arithmetic, part market check. Enter your guest count, service style, and food cost per person, then price from either a target food-cost percentage — the classic rule is to charge about three times your food cost — or from your labor and overhead added on top. The calculator shows the resulting charge, the total quote for the event, and how your number compares with typical market ranges for plated, buffet, cocktail, and station service. Treat the comparison as a starting point for the client conversation, not a final quote: labor, rentals, tax, and gratuity usually ride on top of food." },
    related: ["restaurant-food-cost", "wedding-food", "catering-food-quantity"],
  },
  {
    slug: "appetizers-per-person", name: "Appetizers Per Person Calculator", category: "Food & Catering", categorySlug: "food-catering", icon: "🥟", description: "Plan appetizer pieces per guest for pre-dinner bites, cocktail hours, or appetizer-only meals.",
    fields: [{ key: "guests", label: "Guests", type: "number", unit: "people", min: 1, max: 1000, defaultValue: 40 }, { key: "occasion", label: "Occasion", type: "select", defaultValue: "cocktail", options: [{ label: "Pre-dinner bites (dinner follows)", value: "pre-dinner" }, { label: "Cocktail party (no dinner)", value: "cocktail" }, { label: "Appetizers are the meal", value: "meal" }] }, { key: "hours", label: "Event length", type: "number", unit: "hours", min: 0.5, max: 8, step: 0.5, defaultValue: 2 }, { key: "heavy", label: "Heavy appetites", type: "select", defaultValue: "no", options: [{ label: "No", value: "no" }, { label: "Yes (add about 20%)", value: "yes" }] }],
    results: [{ key: "totalPieces", label: "Total appetizer pieces", unit: "pieces", format: "number", estimate: true }, { key: "perGuest", label: "Pieces per guest", unit: "pieces", format: "number", estimate: true }, { key: "perVariety", label: "Pieces per variety", unit: "pieces", format: "number", estimate: true }, { key: "varietyNote", label: "Variety guidance", format: "text", estimate: true }],
    calculate: (v) => {
      const guests = n(v, "guests", 40);
      const occasion = option(v, "occasion", "cocktail");
      const hours = Math.max(0.5, n(v, "hours", 2));
      let perGuest = occasion === "pre-dinner" ? 4 : occasion === "meal" ? 12 + Math.max(0, hours - 2) : 6 + 2.5 * Math.max(0, hours - 1);
      if (option(v, "heavy", "no") === "yes") perGuest *= 1.2;
      const pieces = ceil(guests * perGuest);
      const varieties = guests < 50 ? 5 : guests < 100 ? 6 : guests < 150 ? 7 : 8;
      const perVariety = Math.ceil(pieces / varieties);
      const varietyNote = `${guests < 100 ? "Aim for 4 to 6 varieties under 100 guests." : "Six to eight varieties cover a crowd this size."} The per-variety figure assumes about ${varieties} varieties.`;
      return { totalPieces: pieces, perGuest: round(perGuest, 1), perVariety, varietyNote };
    },
    howItWorks: ["Pre-dinner bites run about 4 pieces per guest — guests hold back when a full meal is coming.", "A cocktail party with no dinner climbs from about 6 pieces in the first hour by 2 to 3 pieces per additional hour; when appetizers are the meal, start at 12 and add one per hour past two.", "Heavy appetites or an event with nothing else to eat add about 20%, and pieces per variety assume a variety count suited to your guest list."],
    example: { title: "40 guests, 2-hour cocktail party", inputs: "Cocktail party, 2 hours, no heavy appetites", result: "About 340 pieces — roughly 68 per variety across 5 varieties." },
    faqs: [{ question: "How many appetizers for 50 guests?", answer: "For a two- to three-hour cocktail party, 8 to 12 pieces per guest means 400 to 600 pieces. If dinner follows, 4 to 6 per guest — about 200 to 300 pieces — is plenty." }, { question: "What counts as one piece?", answer: "One bite-size serving: a crostini, a skewer, a spring roll. Larger items like sliders or substantial skewers can count as one and a half to two pieces." }, { question: "How many appetizer varieties should I offer?", answer: "Four to six varieties for events under 100 guests, six to eight for larger crowds. More variety looks generous but multiplies prep and serving dishes." }, { question: "Should I round up or down?", answer: "Up. Appetizers run out before they run over, especially with drinks being served — err on the generous side of any range." }],
    seo: { title: "Appetizers Per Person Calculator | CalcForged", description: "Work out how many appetizers per person for pre-dinner bites, cocktail parties, or appetizer-only meals.", h1: "Appetizers per person calculator", intro: "How many appetizers per person depends on what else is being served and how long guests are standing around hungry. Pick the occasion — pre-dinner bites, a cocktail party with no dinner behind it, or appetizers as the meal itself — set the event length, and note whether appetites run heavy. The calculator turns those into a piece count per guest, a total for your shopping list, and a per-variety split across a sensible number of varieties. The ranges follow standard catering practice: about 4 pieces per guest before dinner, 8 to 12 across a two- to three-hour cocktail party, and 12 or more when the apps are the meal." },
    related: ["catering-food-quantity", "taco-bar", "wedding-dessert-table"],
  },
  {
    slug: "yarn-yardage", name: "Yarn Yardage Calculator", category: "Hobbies", categorySlug: "hobbies", icon: "🧶", description: "Estimate yarn yardage and skeins for blankets by size and yarn weight.",
    fields: [{ key: "lengthIn", label: "Length", type: "number", unit: "inches", min: 4, max: 200, defaultValue: 60, help: "Common sizes: baby blanket 30×40, throw 50×60, queen 90×100." }, { key: "widthIn", label: "Width", type: "number", unit: "inches", min: 4, max: 200, defaultValue: 50 }, { key: "weight", label: "Yarn weight", type: "select", defaultValue: "4", options: [{ label: "0 — Lace", value: "0" }, { label: "1 — Superfine (sock, fingering)", value: "1" }, { label: "2 — Fine (sport)", value: "2" }, { label: "3 — Light (DK)", value: "3" }, { label: "4 — Medium (worsted)", value: "4" }, { label: "5 — Bulky", value: "5" }, { label: "6 — Super bulky", value: "6" }, { label: "7 — Jumbo", value: "7" }] }, { key: "yardsPerSkein", label: "Yards per skein", type: "number", unit: "yd", min: 10, max: 2000, defaultValue: 220 }, { key: "wastePct", label: "Waste allowance", type: "number", unit: "%", min: 0, max: 100, defaultValue: 15, help: "For swatching, fringe, and weaving in ends." }],
    results: [{ key: "totalYards", label: "Yarn needed", unit: "yd", format: "number", estimate: true, interpretation: "Before the waste allowance." }, { key: "buyYards", label: "Yards to buy (with allowance)", unit: "yd", format: "number", estimate: true }, { key: "skeins", label: "Skeins to buy", unit: "skeins", format: "number", estimate: true }, { key: "note", label: "Reality check", format: "text", estimate: true }],
    calculate: (v) => {
      const length = Math.max(4, n(v, "lengthIn", 60));
      const width = Math.max(4, n(v, "widthIn", 50));
      const area = length * width;
      const factors: Record<string, number> = { "0": 1.7, "1": 1.45, "2": 1.25, "3": 1.12, "4": 1, "5": 0.75, "6": 0.55, "7": 0.4 };
      const factor = factors[option(v, "weight", "4")] ?? 1;
      const totalYards = round(area * 0.6 * factor);
      const buyYards = Math.round(totalYards * (1 + Math.min(100, Math.max(0, n(v, "wastePct", 15))) / 100));
      const skeins = ceil(buyYards / Math.max(10, n(v, "yardsPerSkein", 220)));
      return { totalYards, buyYards, skeins, note: "Gauge and stitch density change everything — dense stitches use more yarn, open stitches less. Treat this as a starting estimate and let a swatch refine it." };
    },
    howItWorks: ["The estimate starts from your project's area in square inches.", "Each yarn weight carries a yards-per-square-inch factor, calibrated so a 50×60 throw in worsted weight lands near the 1,800 yards most guides cite.", "Your waste allowance is added for swatching, fringe, and weaving in ends, then divided by yards per skein and rounded up to whole skeins."],
    example: { title: "50×60 throw in worsted", inputs: "50 × 60 inches, weight 4, 220 yd skeins, 15% allowance", result: "About 1,800 yards — 2,070 with the allowance, or 10 skeins." },
    faqs: [{ question: "Why do yarn estimates vary so much?", answer: "Gauge, stitch density, and stitch pattern all change consumption. Two makers with the same yarn and hook can differ by 10% to 20%, so a calculator gives a starting estimate, not a guarantee." }, { question: "What eats extra yarn?", answer: "Fringe and borders, colorwork with floats, dense textured stitches, and the swatch itself — which is why the allowance defaults to 15%." }, { question: "How do I check my gauge?", answer: "Work a 4-inch swatch in your pattern stitch, wash and block it the way you will finish the blanket, then count stitches and rows per inch against the yarn's label." }, { question: "Why buy one dye lot?", answer: "Dye lots vary between batches, and the difference shows across a large project. Buy every skein for the blanket at once, all from the same lot." }],
    seo: { title: "Yarn Yardage Calculator – How Much Yarn for a Blanket | CalcForged", description: "Estimate yarn yardage and skeins for a blanket by size and yarn weight, with a waste allowance for swatching and finishing.", h1: "Yarn yardage calculator", intro: "How much yarn a blanket needs is one of those questions with a famously long answer — gauge, stitch density, and yarn weight all move the number. This blanket yarn calculator gives you a grounded starting point: enter the finished length and width, pick your yarn weight from the standard 0-to-7 categories, and set your yards per skein and waste allowance. The math is calibrated so a 50×60 throw in worsted weight lands near the 1,800 yards most yarn guides cite, then scales across the other weights. The skein count rounds up so one dye lot covers the whole project. Treat the result as a planning estimate and let a swatch refine it." },
    related: ["recipe-scaling", "weight-converter", "percentage"],
  },
  {
    slug: "pizza-party", name: "Pizza Party Calculator", category: "Food & Catering", categorySlug: "food-catering", icon: "🍕", description: "Order the right number of pizzas for any crowd, by size and appetite.",
    fields: [
      { key: "adults", label: "Adults", type: "number", unit: "people", min: 0, max: 1000, defaultValue: 20 },
      { key: "children", label: "Children", type: "number", unit: "people", min: 0, max: 1000, defaultValue: 0 },
      { key: "slicesPerAdult", label: "Slices per adult", type: "number", unit: "slices", min: 1, max: 6, defaultValue: 3, help: "Most adults eat 2–3 slices; 3–4 when pizza is the only main." },
      { key: "slicesPerChild", label: "Slices per child", type: "number", unit: "slices", min: 0, max: 4, defaultValue: 2, help: "Kids usually manage 1–2 slices." },
      { key: "pizzaSize", label: "Pizza size", type: "select", defaultValue: "large", options: [{ label: "10\" small — 6 slices", value: "small" }, { label: "12\" medium — 8 slices", value: "medium" }, { label: "14\" large — 8 slices", value: "large" }, { label: "16\" extra large — 12 slices", value: "xl" }] },
    ],
    results: [
      { key: "slices", label: "Total slices", unit: "slices", format: "number" },
      { key: "pizzas", label: "Pizzas to order", unit: "pizzas", format: "number", estimate: true, interpretation: "Rounded up to whole pizzas." },
      { key: "note", label: "Ordering note", format: "text" },
    ],
    calculate: (v) => {
      const adults = n(v, "adults", 20);
      const children = n(v, "children", 0);
      const slices = ceil(adults * n(v, "slicesPerAdult", 3) + children * n(v, "slicesPerChild", 2));
      const sizes: Record<string, { perPizza: number; label: string }> = { small: { perPizza: 6, label: "10\" small" }, medium: { perPizza: 8, label: "12\" medium" }, large: { perPizza: 8, label: "14\" large" }, xl: { perPizza: 12, label: "16\" extra large" } };
      const size = sizes[option(v, "pizzaSize", "large")] ?? sizes.large;
      const pizzas = ceil(slices / size.perPizza);
      const lo = Math.floor(size.perPizza / 3);
      const hi = Math.ceil(size.perPizza / 3);
      const per = lo === hi ? `${lo} adults` : `${lo}–${hi} adults`;
      const spare = pizzas * size.perPizza - slices;
      return { slices, pizzas, note: `Each ${size.label} pizza has ${size.perPizza} slices — about ${per} per pizza at 3 slices each.${spare > 0 ? ` Ordering whole pizzas leaves ${spare} spare slices; odd leftovers feed the morning after.` : ""}` };
    },
    howItWorks: ["Count slices first: most adults eat 2–3 and kids 1–2, so the default plans 3 slices per adult and 2 per child.", "Divide total slices by the slice count for your pizza size — 6 for a 10\" small, 8 for a 12\" medium or 14\" large, 12 for a 16\" extra large — and round up to whole pizzas.", "Most U.S. chains cut a large into 8 slices; square-cut or 10-slice pizzerias yield a couple more per pie, so the estimate errs on the safe side."],
    example: { title: "20 adults, large pizzas", inputs: "20 adults, 3 slices each, 14\" large", result: "60 slices — 8 large pizzas, with 4 slices to spare." },
    faqs: [{ question: "How many slices of pizza per person?", answer: "Plan 2–3 slices per adult and 1–2 per child. When pizza is the only main dish, move adults up to 3–4 slices." }, { question: "How many pizzas for 20 adults?", answer: "At 3 slices each, 20 adults need 60 slices — 8 large pizzas cut into 8 slices, or 5 extra larges cut into 12. Order one more if guests are hearty or the party runs late." }, { question: "How many pizza varieties should I order?", answer: "Under 20 people, 2–3 types is plenty: cheese and pepperoni cover most guests, plus one specialty. Bigger crowds stay happy with 3–4 repeats of the bestsellers." }, { question: "What do I do with leftover pizza?", answer: "Refrigerate slices within two hours; they keep 3–4 days and freeze for about a month. Reheat in a skillet or hot oven so the crust crisps back up." }],
    seo: { title: "Pizza Party Calculator – How Many Pizzas to Order | CalcForged", description: "Calculate how many pizzas to order for any group — adults, kids, and pizza size, from 10-inch smalls to 16-inch extra larges.", h1: "Pizza party calculator", intro: "How many pizzas for 20 adults — or any crowd — comes down to slices: adults eat 2–3, kids eat 1–2, and every pizza size cuts into a known slice count. Enter your adults and children, set the appetite, and pick the size you are ordering, from a 10\" small at 6 slices to a 16\" extra large at 12. The calculator divides total slices by slices per pizza and rounds up to whole pies, so you order a real number instead of a guess. It assumes the 8-slice large most U.S. chains ship, which errs on the safe side when a pizzeria cuts 10." },
    related: ["taco-bar", "appetizers-per-person", "catering-food-quantity"],
  },
  {
    slug: "chicken-wings", name: "Chicken Wings Calculator", category: "Food & Catering", categorySlug: "food-catering", icon: "🍗", description: "Turn guests into wing pieces, pounds to buy, and sauce to toss.",
    fields: [
      { key: "guests", label: "Guests", type: "number", unit: "people", min: 1, max: 1000, defaultValue: 10 },
      { key: "serving", label: "Serving style", type: "select", defaultValue: "main", options: [{ label: "Appetizer — 6 pieces per guest", value: "appetizer" }, { label: "Main dish — 12 pieces per guest", value: "main" }] },
      { key: "pieceType", label: "Wing type", type: "select", defaultValue: "party", options: [{ label: "Flats & drumettes — each piece counts as 1", value: "party" }, { label: "Whole wings — each wing is 2 pieces", value: "whole" }] },
      { key: "cupsPerLb", label: "Sauce per cooked lb", type: "number", unit: "cups", min: 0, max: 2, step: 0.125, defaultValue: 0.5, help: "Standard recipes work out to about ½ cup per cooked pound." },
    ],
    results: [
      { key: "pieces", label: "Wing pieces", unit: "pieces", format: "number" },
      { key: "cooked", label: "Cooked wings", unit: "lb", format: "number", estimate: true },
      { key: "raw", label: "Raw wings to buy", unit: "lb", format: "number", estimate: true, interpretation: "Assumes standard-size party wings; jumbo wings run heavier." },
      { key: "sauce", label: "Buffalo sauce", unit: "cups", format: "number", estimate: true },
    ],
    calculate: (v) => {
      const guests = n(v, "guests", 10);
      const piecesPerPerson = option(v, "serving", "main") === "appetizer" ? 6 : 12;
      const pieces = Math.round(guests * piecesPerPerson);
      const rawPerPiece = option(v, "pieceType", "party") === "whole" ? 1.9 : 1.6;
      const rawBase = pieces * rawPerPiece / 16;
      const cookedBase = rawBase * 0.68;
      return { pieces, cooked: round(cookedBase), raw: round(rawBase), sauce: round(cookedBase * n(v, "cupsPerLb", 0.5), 1) };
    },
    howItWorks: ["Guests eat about 6 wing pieces when wings are an appetizer and 10–12 when they are the main dish; this calculator plans 6 and 12.", "Pieces convert to raw pounds at roughly 1.6 ounces per pre-cut piece — about 9 pieces per pound; whole wings run heavier because the tip rides along in the purchase weight.", "Bone-in wings lose about a third of their weight cooking (a 65–70% yield), so the raw figure is the buying number, and sauce is planned at about half a cup per cooked pound."],
    example: { title: "10 guests, main-dish wings", inputs: "Main dish, flats & drumettes, ½ cup sauce per cooked lb", result: "120 pieces — about 12 lb raw to buy, 8.2 lb cooked, and 4.1 cups of sauce." },
    faqs: [{ question: "How many wings per person as an appetizer vs a main?", answer: "About 6 pieces per person as an appetizer and 10–12 as the main dish. With hearty sides or a second main on the table, lean to the low end." }, { question: "Whole wings or pre-cut flats and drumettes?", answer: "A whole wing cuts into two pieces (flat and drumette), with the tip usually discarded. Pre-cut party wings count one piece each; this estimate assumes those unless you pick whole wings." }, { question: "Fresh or frozen wings?", answer: "Both work. Individually quick-frozen wings are often cheaper and keep until party day — thaw them in the fridge a day ahead and pat dry before cooking." }, { question: "How much sauce do wings need?", answer: "Standard recipes work out to 2–3 fluid ounces per raw pound, or about half a cup per cooked pound. Toss just before serving so the skin stays crisp, and keep extra warm for dipping." }],
    seo: { title: "Chicken Wings Calculator – How Many Wings Per Person | CalcForged", description: "Calculate chicken wing pieces, raw pounds to buy, and buffalo sauce for any guest count — appetizer or main dish.", h1: "Chicken wings calculator", intro: "How many wings per person depends on what else is on the table: about 6 pieces when wings are an appetizer and 10–12 when they are the main dish. Enter your guest count and serving style, say whether you are buying pre-cut flats and drumettes or whole wings, and get pieces, raw pounds to buy, and the buffalo sauce to toss. The weight math uses standard party-wing averages — roughly 9 pieces per raw pound — and a 65–70% raw-to-cooked yield, so the buying number errs on the generous side." },
    related: ["bbq-meat", "taco-bar", "pizza-party"],
  },
  {
    slug: "party-ice", name: "Party Ice Calculator", category: "Events", categorySlug: "events", icon: "🧊", description: "Estimate pounds of ice, bags to buy, and cost for drinks and coolers.",
    fields: [
      { key: "guests", label: "Guests", type: "number", unit: "people", min: 1, max: 1000, defaultValue: 20 },
      { key: "hours", label: "Event length", type: "number", unit: "hours", min: 1, max: 12, step: 0.5, defaultValue: 3 },
      { key: "setting", label: "Setting", type: "select", defaultValue: "indoor", options: [{ label: "Indoor or cool", value: "indoor" }, { label: "Outdoor or warm", value: "outdoor" }] },
      { key: "uses", label: "What the ice has to do", type: "select", defaultValue: "drinks", options: [{ label: "Drinks only", value: "drinks" }, { label: "Drinks + chilling bottles", value: "bottles" }, { label: "Everything, including displays", value: "everything" }] },
      { key: "bagSize", label: "Bag size", type: "number", unit: "lb", min: 5, max: 40, step: 5, defaultValue: 10 },
      { key: "bagPrice", label: "Price per bag", type: "number", unit: "$", min: 0, step: 0.25, defaultValue: 3.5, help: "Grocery-store 10 lb bags run about $3.50; gas stations are cheaper per stop, dearer per pound." },
    ],
    results: [
      { key: "totalLb", label: "Ice needed", unit: "lb", format: "number", estimate: true, interpretation: "1 lb per guest for the first two hours, then 0.5 lb per extra hour." },
      { key: "bags", label: "Bags to buy", unit: "bags", format: "number", estimate: true },
      { key: "cost", label: "Ice cost", unit: "$", format: "currency", estimate: true },
      { key: "note", label: "Keep it frozen", format: "text" },
    ],
    calculate: (v) => {
      const guests = n(v, "guests", 20);
      const hours = Math.max(1, n(v, "hours", 3));
      let totalLb = guests * (Math.min(2, hours) + Math.max(0, hours - 2) * 0.5);
      if (option(v, "setting", "indoor") === "outdoor") totalLb *= 1.5;
      const uses = option(v, "uses", "drinks");
      if (uses === "bottles") totalLb += guests * 0.5;
      if (uses === "everything") totalLb += guests;
      const bags = ceil(totalLb / Math.max(1, n(v, "bagSize", 10)));
      return { totalLb: round(totalLb), bags, cost: round(bags * n(v, "bagPrice", 3.5), 2), note: "Buy bags a day early and store them cold and closed; pack coolers with a base layer of ice, drinks, then ice on top, and keep a spare bag for top-ups." };
    },
    howItWorks: ["Drinks start at 1 pound of ice per guest for the first two hours, then add half a pound per guest per extra hour.", "Warm or outdoor settings multiply the drink total by 1.5 for melt; chilling bottles in coolers adds about half a pound per guest, and food displays add the same again.", "The total converts to whole bags at your bag size and prices out at your local per-bag cost."],
    example: { title: "20 guests, 3-hour outdoor party", inputs: "Outdoor, drinks + chilling bottles, 10 lb bags", result: "About 55 lb of ice — 6 bags, roughly $21." },
    faqs: [{ question: "How much ice per person for a party?", answer: "The common range is 1–2 pounds per guest: about 1 lb for a short indoor drinks-only event, 1.5 lb for a typical 3-hour party, and 2 lb or more for hot outdoor events or when ice also chills bottles and displays." }, { question: "How do I keep ice from melting too fast?", answer: "Pre-chill the coolers, keep bags closed and out of the sun, and layer ice under and over the drinks. Keep the lid shut, and hold a spare bag back for top-ups late in the event." }, { question: "Should I buy bags or have ice delivered?", answer: "Grocery and warehouse bags are cheapest per pound for most parties. For long outdoor events, block ice melts far slower; for 100+ guests, delivered bulk ice saves the store runs." }, { question: "Is bagged ice safe for drinks?", answer: "Buy ice packaged and labeled for consumption. Never use ice that has touched a cooler floor or raw food, and serve with a scoop rather than hands." }],
    seo: { title: "Party Ice Calculator – How Much Ice for a Party | CalcForged", description: "Calculate how many pounds of ice and how many bags to buy for your party — drinks, bottles, and displays included.", h1: "Party ice calculator", intro: "How much ice for a party is one of the most under-planned numbers on the shopping list. The baseline is about a pound of ice per guest for the first two hours of drinks, half a pound more per extra hour, and more again for outdoor heat, chilling bottles, and food displays. Enter your guests, hours, setting, and what the ice has to do, and get total pounds, bags to buy at your bag size, and the cost at your local bag price. Most 10-pound bags run about $3.50 at the grocery store, so a typical 20-guest afternoon lands near five bags." },
    related: ["wedding-food", "appetizers-per-person", "bbq-meat"],
  },
  {
    slug: "balloon-quantity", name: "Balloon Quantity Calculator", category: "Events", categorySlug: "events", icon: "🎈", description: "Turn a room or car interior into a balloon count, helium volume, and tank count.",
    fields: [
      { key: "whatToFill", label: "What are you filling", type: "select", defaultValue: "room", options: [{ label: "A room", value: "room" }, { label: "A car interior", value: "car" }] },
      { key: "lengthFt", label: "Length", type: "number", unit: "ft", min: 1, max: 120, defaultValue: 12, help: "A typical sedan's usable interior is about a 4 × 5 × 3 ft box — the full cabin measures 110–120 cu ft before seats and console eat most of it. A living room is often 12 × 10 × 8 ft." },
      { key: "widthFt", label: "Width", type: "number", unit: "ft", min: 1, max: 120, defaultValue: 10 },
      { key: "heightFt", label: "Height", type: "number", unit: "ft", min: 1, max: 30, defaultValue: 8 },
      { key: "balloonSize", label: "Balloon size", type: "select", defaultValue: "11", options: [{ label: "9 in latex", value: "9" }, { label: "11 in latex", value: "11" }, { label: "12 in latex", value: "12" }, { label: "16 in latex", value: "16" }, { label: "36 in latex (giant)", value: "36" }] },
      { key: "tankSize", label: "Tank size", type: "select", defaultValue: "14.9", options: [{ label: "8.9 cu ft — small disposable", value: "8.9" }, { label: "14.9 cu ft — standard disposable", value: "14.9" }, { label: "55 cu ft — rental cylinder", value: "55" }, { label: "110 cu ft — rental cylinder", value: "110" }, { label: "150 cu ft — rental cylinder", value: "150" }, { label: "219 cu ft — rental cylinder", value: "219" }] },
    ],
    results: [
      { key: "balloons", label: "Balloons to fill it", unit: "balloons", format: "number", estimate: true, interpretation: "Usable box × 0.9 fill factor; packing gaps can swing the real count ±15%." },
      { key: "helium", label: "Helium needed", unit: "cu ft", format: "number", estimate: true },
      { key: "tanks", label: "Tanks to buy or rent", unit: "tanks", format: "number", estimate: true },
      { key: "note", label: "Float time & timing", format: "text", estimate: true },
    ],
    calculate: (v) => {
      const usable = Math.max(1, n(v, "lengthFt", 12)) * Math.max(1, n(v, "widthFt", 10)) * Math.max(1, n(v, "heightFt", 8)) * 0.9;
      const perBalloon: Record<string, number> = { "9": 0.3, "11": 0.5, "12": 0.65, "16": 1.1, "36": 7.5 };
      const size = option(v, "balloonSize", "11");
      const per = perBalloon[size] ?? 0.5;
      const balloons = Math.floor(usable / per);
      const helium = balloons * per;
      const tanks = ceil(helium / Math.max(0.5, n(v, "tankSize", 14.9)));
      const floatTimes: Record<string, string> = { "9": "6–8 hours", "11": "10–12 hours", "12": "10–14 hours", "16": "18–24 hours", "36": "2–3 days" };
      const carHint = option(v, "whatToFill", "room") === "car" ? " Working from the car's usable box keeps the count realistic — a typical sedan is about 4 × 5 × 3 ft." : "";
      return { balloons, helium: round(helium), tanks, note: `Latex this size floats about ${floatTimes[size] ?? "10–12 hours"} indoors — inflate close to event time, or add Hi-Float to roughly double it. Plan 10–15% fewer balloons per tank above 4,000 ft altitude.${carHint}` };
    },
    howItWorks: ["The usable space is your length × width × height, times a 0.9 fill factor for the corners and odd volumes the tidy box leaves out.", "Each balloon size has a known helium appetite — about 0.5 cu ft for an 11-inch latex — and the count is usable volume divided by that number.", "Helium volume divides by your tank size and rounds up, because a tank that dies two balloons short ruins the reveal; float times come from standard latex charts."],
    example: { title: "Fill a sedan with 11-inch balloons", inputs: "Car interior 4 × 5 × 3 ft, 11 in balloons, 14.9 cu ft disposable tank", result: "About 108 balloons — 54 cu ft of helium, or 4 disposable tanks (one 55 cu ft rental covers it)." },
    faqs: [{ question: "How many balloons does it take to fill a car?", answer: "A typical sedan's usable interior is roughly a 4 × 5 × 3 ft box — about 60 cu ft, or 100–120 eleven-inch balloons at 0.5 cu ft each. Published cabin volumes run 110–120 cu ft, but seats, console, and sloped glass eat most of that. An SUV's cargo area alone can take 200+." }, { question: "How long will the balloons stay up?", answer: "An 11-inch latex balloon floats 10–12 hours indoors; 16-inch runs 18–24 hours and 36-inch giants 2–3 days. Hi-Float roughly doubles latex time. Inflate close to the event — balloons blown up the night before droop by the party." }, { question: "Which helium tank do I need?", answer: "The standard 14.9 cu ft disposable fills about 30 eleven-inch balloons; the smaller 8.9 cu ft fills about 18. Past roughly 50 balloons, rent: 55 and 110 cu ft cylinders cost a fraction per cubic foot and one tank covers the room." }, { question: "How many balloons for an arch or garland?", answer: "A standard garland packs 4–6 balloons per foot and lush wedding-style builds run 7–10+, so a 10-foot arch takes 40–60 balloons. Most arches are air-filled, which needs no helium and holds its shape for days." }],
    seo: { title: "Balloon Quantity Calculator – Balloons & Helium per Room or Car | CalcForged", description: "Calculate how many balloons and how much helium fill a room or car interior — by balloon size, with tanks to buy and float time built in.", h1: "Balloon quantity calculator", intro: "How many balloons it takes to fill a room — or a car — comes down to volume: your space times a 0.9 fill factor, divided by the helium each balloon holds. An 11-inch latex balloon takes about 0.5 cubic feet of helium, a 9-inch about 0.3, and a 36-inch giant about 7.5. Pick the space, set the three dimensions, choose the balloon size and your tank, and the calculator returns a balloon count, the helium it consumes, and how many tanks that takes — disposable tanks fill roughly 30 eleven-inch balloons each, so anything past a few dozen points you at a rental cylinder. Float time is built into the note: latex runs 10–12 hours indoors untreated, so inflation timing matters as much as the count." },
    related: ["party-ice", "appetizers-per-person", "wedding-dessert-table"],
  },
  {
    slug: "tire-size", name: "Tire Size Calculator", category: "Automotive", categorySlug: "automotive", icon: "🛞", description: "Read a metric tire size in inches, or find the standard sizes that match your current diameter.",
    fields: [
      { key: "direction", label: "Direction", type: "select", defaultValue: "metric", options: [{ label: "Metric size → inches", value: "metric" }, { label: "Inches → matching sizes", value: "inches" }] },
      { key: "metricWidth", label: "Section width", type: "number", unit: "mm", min: 100, max: 400, defaultValue: 225, help: "First number in 225/65R17." },
      { key: "aspect", label: "Aspect ratio", type: "number", unit: "%", min: 20, max: 95, defaultValue: 65, help: "Sidewall height as a percentage of width — the second number." },
      { key: "rim", label: "Rim diameter", type: "number", unit: "in", min: 8, max: 26, defaultValue: 17, help: "The R-number. In the inches direction this is your wheel size — every match stays on this rim." },
      { key: "targetDiameter", label: "Target overall diameter", type: "number", unit: "in", min: 15, max: 45, step: 0.05, defaultValue: 28.5, help: "For the inches direction — your current tire's overall diameter (the metric direction computes it)." },
      { key: "targetWidth", label: "Target section width", type: "number", unit: "in", min: 4, max: 16, step: 0.05, defaultValue: 8.9 },
    ],
    results: [
      { key: "tireDiameter", label: "Overall diameter", unit: "in", format: "number", interpretation: "Rim diameter plus twice the sidewall height." },
      { key: "sidewall", label: "Sidewall height", unit: "in", format: "number" },
      { key: "sectionWidth", label: "Section width", unit: "in", format: "number" },
      { key: "revsPerMile", label: "Revolutions per mile", unit: "revs", format: "number", interpretation: "Speedometer and odometer shift with this number." },
      { key: "matches", label: "Options that fit", format: "text" },
    ],
    calculate: (v) => {
      const mm = Math.max(100, n(v, "metricWidth", 225));
      const aspect = Math.max(20, n(v, "aspect", 65));
      const rim = Math.max(8, n(v, "rim", 17));
      if (option(v, "direction", "metric") === "metric") {
        const sidewall = round(mm * aspect / 100 / 25.4, 2);
        const diameter = round(rim + 2 * sidewall, 2);
        const widthIn = round(mm / 25.4, 2);
        const revs = Math.round(63360 / (Math.PI * diameter));
        const combos: { size: string; diameter: number; width: number; pct: number; revs: number }[] = [];
        for (const w of [155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315, 325, 335]) for (const a of [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]) {
          if (w === mm && a === aspect) continue;
          const d = rim + 2 * (w * a / 100 / 25.4);
          const pct = round((d - diameter) / diameter * 100, 1);
          if (Math.abs(pct) <= 3) combos.push({ size: `${w}/${a}R${rim}`, diameter: round(d, 2), width: round(w / 25.4, 2), pct, revs: Math.round(63360 / (Math.PI * d)) });
        }
        for (const f of FLOTATION_SIZES) if (f.rim === rim) {
          const pct = round((f.d - diameter) / diameter * 100, 1);
          if (Math.abs(pct) <= 3) combos.push({ size: `${f.d}×${f.w.toFixed(2)}R${rim}`, diameter: f.d, width: f.w, pct, revs: Math.round(63360 / (Math.PI * f.d)) });
        }
        combos.sort((x, y) => (Math.abs(x.pct) + 2 * Math.abs(x.width - widthIn)) - (Math.abs(y.pct) + 2 * Math.abs(y.width - widthIn)));
        const tag = (c: { pct: number }) => Math.abs(c.pct) <= 2 ? "Match" : "Close option";
        const lines = [
          `Your size: ${mm}/${aspect}R${rim} — ${diameter} in overall, ${widthIn} in wide, ${revs} revs/mile.`,
          ...combos.slice(0, 4).map((c) => `${tag(c)}: ${c.size} — ${c.diameter} in (${c.pct > 0 ? "+" : ""}${c.pct}%), ${c.width} in wide.`),
          "Within ±2% keeps the speedometer, ABS, and transmission in factory tolerance; ±3% is the outer fitment guideline. Same rim throughout.",
        ];
        return { tireDiameter: diameter, sidewall, sectionWidth: widthIn, revsPerMile: revs, matches: lines.join("\n") };
      }
      const target = Math.max(10, n(v, "targetDiameter", 28.5));
      const targetWidth = Math.max(3, n(v, "targetWidth", 8.9));
      const combos: { size: string; diameter: number; width: number; pct: number; revs: number }[] = [];
      for (const w of [155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315, 325, 335]) for (const a of [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]) {
        const diameter = rim + 2 * (w * a / 100 / 25.4);
        const pct = round((diameter - target) / target * 100, 1);
        if (Math.abs(pct) <= 3) combos.push({ size: `${w}/${a}R${rim}`, diameter: round(diameter, 2), width: round(w / 25.4, 2), pct, revs: Math.round(63360 / (Math.PI * diameter)) });
      }
      for (const f of FLOTATION_SIZES) if (f.rim === rim) {
        const pct = round((f.d - target) / target * 100, 1);
        if (Math.abs(pct) <= 3) combos.push({ size: `${f.d}×${f.w.toFixed(2)}R${rim}`, diameter: f.d, width: f.w, pct, revs: Math.round(63360 / (Math.PI * f.d)) });
      }
      combos.sort((x, y) => (Math.abs(x.pct) + 2 * Math.abs(x.width - targetWidth)) - (Math.abs(y.pct) + 2 * Math.abs(y.width - targetWidth)));
      const tag = (c: { pct: number }) => Math.abs(c.pct) <= 2 ? "Match" : "Close option";
      const best = combos[0];
      if (!best) return { tireDiameter: "", sidewall: "", sectionWidth: "", revsPerMile: "", matches: `No standard size lands within 3% of ${target} in — that diameter needs a recalibrated speedometer or a different rim.` };
      const lines = [
        `${tag(best)}: ${best.size} — ${best.diameter} in overall (${best.pct > 0 ? "+" : ""}${best.pct}% vs target), ${best.width} in wide, ${best.revs} revs/mile.`,
        ...combos.slice(1, 4).map((c) => `${tag(c)}: ${c.size} — ${c.diameter} in (${c.pct > 0 ? "+" : ""}${c.pct}%), ${c.width} in wide, ${c.revs} revs/mile.`),
        "Within ±2% keeps the speedometer, ABS, and transmission in factory tolerance; ±3% is the outer fitment guideline. The speedometer shifts by about the same percentage as the diameter — verify clearance before buying.",
      ];
      return { tireDiameter: "", sidewall: "", sectionWidth: "", revsPerMile: "", matches: lines.join("\n") };
    },
    howItWorks: ["Metric sizes decode directly: sidewall = width × aspect ÷ 100 in millimeters, overall diameter = rim + 2 × sidewall, and revolutions per mile = 63,360 ÷ (π × diameter) — then the calculator lists every size on the same rim within 3% of that diameter.", "The inches direction holds your rim fixed and sweeps the width and aspect combinations on it, keeping every match within 3% of your target diameter — you already own the wheels, so the rim never changes.", "Anything within 2% is a straight fit; 2–3% is the outer guideline, where the speedometer drifts by the same amount and wheel-well clearance needs a check."],
    example: { title: "35 in tall, 12.5 in wide, 20 in rim", inputs: "Inches → matching sizes: 35 in diameter, 12.5 in width, 20 in rim", result: "35×12.50R20 (the flotation size itself) plus 315/60R20 — 34.9 in overall, 12.4 in wide. Close: 325/60R20 and 295/65R20." },
    faqs: [{ question: "What do the numbers in 225/65R17 mean?", answer: "225 is the section width in millimeters, 65 is the sidewall height as a percentage of that width, R is radial construction, and 17 is the wheel diameter in inches. Overall height is the rim plus twice the sidewall — 28.5 inches here." }, { question: "Do I have to keep the same rim?", answer: "If you're keeping your wheels, yes — the rim is fixed, and that's how this calculator works: every match it returns is on the rim size you enter. Changing rim sizes means buying new wheels, and then overall diameter and width are the constraints that transfer." }, { question: "What is the 3% rule for tires?", answer: "A widely used fitment guideline (not law): keep a replacement tire's overall diameter within 3% of the stock size so the speedometer, ABS, and transmission stay within tolerance. Within 2% is the comfortable zone; bigger jumps belong on trucks with a recalibration." }, { question: "How does tire size change my speedometer?", answer: "The speedometer counts wheel revolutions. A taller tire covers more ground per revolution, so it reads low — 3% taller means 60 indicated is really about 62 mph. A shorter tire makes it read high by the same logic." }],
    seo: { title: "Tire Size Calculator – Metric to Inches & Matching Sizes | CalcForged", description: "Convert metric tire sizes to inches — diameter, sidewall, width, revs per mile — or find matching sizes on your rim within the 3% fitment rule.", h1: "Tire size calculator", intro: "A tire size like 225/65R17 packs four numbers into one code, and every one of them changes how the tire fits, rolls, and reports your speed. This tire size calculator works both ways: enter the metric size and it converts to inches — overall diameter, sidewall height, section width, and revolutions per mile — or enter your current diameter, width, and rim size, and it sweeps the width and aspect combinations on that rim for sizes within the 3% fitment guideline, flagging the straight matches inside ±2% separately from the 2–3% outer options. The rim stays fixed because you already own the wheels; the speedometer shifts by about the same percentage as the diameter changes, and clearance on the actual vehicle is the final check before you buy." },
    related: ["weight-converter", "percentage"],
  },
  {
    slug: "towing-capacity", name: "Towing Capacity & Tongue Weight Calculator", category: "Automotive", categorySlug: "automotive", icon: "🚚", description: "Look up a verified towing capacity and bracket the safe tongue-weight range for your trailer.",
    fields: [
      { key: "make", label: "Make", type: "select", defaultValue: "", options: [{ label: "Select a make", value: "" }, ...TOWING_MAKES.map((make) => ({ label: make, value: make }))] },
      { key: "model", label: "Model", type: "select", defaultValue: "", optionsFor: "make", optionsMap: TOWING_MODEL_OPTIONS, help: "The verified models for your make." },
      { key: "year", label: "Year", type: "number", min: 1990, max: 2030, defaultValue: 2024 },
      { key: "trailerWeight", label: "Trailer weight (loaded)", type: "number", unit: "lb", min: 0, max: 40000, defaultValue: 7000, help: "Trailer plus everything in it — the gross weight, not the dry weight." },
      { key: "myTowingCapacity", label: "Your towing capacity (if known)", type: "number", unit: "lb", min: 0, max: 40000, defaultValue: 0, help: "Not listed? Enter the capacity from your door jamb or owner's manual." },
    ],
    results: [
      { key: "maxTowing", label: "Max conventional towing", unit: "lb", format: "number", estimate: true, interpretation: "From the verified table or your own rating — the door jamb always wins." },
      { key: "tongueWeightMin", label: "Tongue weight minimum (10%)", unit: "lb", format: "number", estimate: true },
      { key: "tongueWeightMax", label: "Tongue weight maximum (15%)", unit: "lb", format: "number", estimate: true },
      { key: "warning", label: "Before you hook up", format: "text" },
    ],
    calculate: (v) => {
      const makeIn = option(v, "make", "").trim();
      const modelIn = option(v, "model", "").trim();
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const row = makeIn && modelIn ? TOWING_TABLE.find((r) => norm(r.make) === norm(makeIn) && norm(r.model) === norm(modelIn)) : undefined;
      const manual = Math.max(0, n(v, "myTowingCapacity", 0));
      const trailer = Math.max(0, n(v, "trailerWeight", 0));
      const maxTowing = row ? row.lb : manual;
      const tongueMin = round(trailer * 0.1);
      const tongueMax = round(trailer * 0.15);
      const vehicle = [makeIn, modelIn].filter(Boolean).join(" ");
      const warning = [
        maxTowing > 0 && trailer > maxTowing ? `Stop: a ${trailer.toLocaleString("en-US")} lb trailer exceeds the ${maxTowing.toLocaleString("en-US")} lb rating — do not tow it.` : "",
        row ? `${vehicle}: ${row.lb.toLocaleString("en-US")} lb is the common-configuration table value. ${row.note ?? ""} Verified from the manufacturer's towing guide, September 2026.` : manual > 0 ? `Using the ${manual.toLocaleString("en-US")} lb rating you entered.` : vehicle ? `No verified table match for ${vehicle} — enter the capacity from your door jamb or owner's manual above.` : `Pick your make and model from the lists to pull a verified capacity — or enter your own rating from the door jamb or owner's manual.`,
        "Capacities vary by engine, axle, and package — your VIN's towing guide and door-jamb labels always win, and payload has to carry the tongue weight. Never exceed your hitch or receiver rating.",
      ].filter(Boolean).join(" ");
      return { maxTowing, tongueWeightMin: tongueMin, tongueWeightMax: tongueMax, warning };
    },
    howItWorks: ["A curated table of the most-towed U.S. vehicles returns the common configuration's verified maximum; anything else uses the rating you enter from the door jamb or owner's manual.", "Conventional towing puts 10–15% of the loaded trailer weight on the hitch — the calculator brackets your trailer's tongue weight at exactly those bounds.", "The warning carries the fine print: ratings swing by engine, axle, and package, fifth-wheel pin weight runs 15–25% and rides on payload, and the manufacturer's labels always beat any table."],
    example: { title: "2019 F-150, 7,000 lb trailer", inputs: "Ford F-150, 7,000 lb loaded trailer", result: "About 12,800 lb from the table — tongue weight should land between 700 and 1,050 lb." },
    faqs: [{ question: "How much tongue weight is safe?", answer: "For a conventional ball hitch, 10–15% of the loaded trailer weight — a 7,000 lb trailer wants 700–1,050 lb on the ball. Too little invites sway; too much overloads the rear axle. Measure with a tongue-weight scale, or at a truck scale weighing the truck with and without the trailer tongue down." }, { question: "Where do I find my exact towing capacity?", answer: "The door-jamb sticker, the owner's manual, and the manufacturer's towing guide for your VIN. The table here gives the common configuration's verified maximum — engines, axle ratios, and tow packages move the real number by thousands of pounds, especially on full-size trucks." }, { question: "What's the difference between towing capacity and GCWR?", answer: "Towing capacity is what the hitch can pull; GCWR is the combined limit for the loaded truck plus trailer, passengers, and cargo. Payload is often the real-world limiter — the tongue weight rides in the bed, and it counts against payload before anything else goes in." }, { question: "When do I need a weight-distributing hitch?", answer: "When the manufacturer requires one for your trailer weight (often around 5,000 lb and up) or whenever the rear of the vehicle squats. Spring bars shift tongue weight to the front axle, restoring steering and headlight aim — sized and adjusted per the manufacturer's instructions." }],
    seo: { title: "Towing Capacity & Tongue Weight Calculator | CalcForged", description: "Look up verified towing capacities for the most-towed vehicles and compute the safe 10–15% tongue-weight range for your trailer.", h1: "Towing capacity & tongue weight calculator", intro: "Towing numbers are safety data, so this calculator keeps them honest. Enter your make, model, and year — the most-towed vehicles in America, from the F-150 and Silverado 1500 to the Tacoma, Explorer, and Grand Cherokee, return a towing capacity verified against the manufacturer's own towing guide, stated for the common configuration with the real range spelled out. Unlisted vehicles take your capacity from the door jamb or owner's manual. Add your loaded trailer weight and the calculator brackets the tongue weight at the safe 10–15% band for a conventional ball hitch — 700 to 1,050 lb on a 7,000 lb trailer — and flags it plainly if the trailer exceeds the rating. Fifth-wheel owners: pin weight runs 15–25% of trailer weight and counts against payload, and the door-jamb labels always win over any table." },
    related: ["tire-size"],
  },
  {
    slug: "train-scale-converter", name: "Model Train Scale Converter", category: "Hobbies", categorySlug: "hobbies", icon: "🚂", description: "Convert real dimensions to model size — or back — across Z, N, HO, O, G, and more.",
    fields: [
      { key: "dimension", label: "Dimension", type: "number", min: 0.1, max: 10000, step: "any", defaultValue: 40 },
      { key: "unit", label: "Unit", type: "select", defaultValue: "ft", options: [{ label: "Feet", value: "ft" }, { label: "Inches", value: "in" }, { label: "Centimeters", value: "cm" }, { label: "Meters", value: "m" }] },
      { key: "scale", label: "Scale", type: "select", defaultValue: "87.1", options: [{ label: "Z — 1:220", value: "220" }, { label: "N — 1:160", value: "160" }, { label: "TT — 1:120", value: "120" }, { label: "HO — 1:87.1", value: "87.1" }, { label: "OO — 1:76 (UK)", value: "76" }, { label: "S — 1:64", value: "64" }, { label: "O — 1:48", value: "48" }, { label: "G — 1:22.5 (garden)", value: "22.5" }] },
      { key: "direction", label: "Direction", type: "select", defaultValue: "toModel", options: [{ label: "Real → model", value: "toModel" }, { label: "Model → real", value: "toReal" }] },
    ],
    results: [
      { key: "realSize", label: "Real-world size", unit: "in", format: "number", estimate: true },
      { key: "modelSize", label: "Model size", unit: "in", format: "number", estimate: true },
      { key: "modelMm", label: "Model size", unit: "mm", format: "number", estimate: true },
      { key: "comparison", label: "Same object in other scales", format: "text", estimate: true },
    ],
    calculate: (v) => {
      const ratio = Math.max(1, n(v, "scale", 87.1));
      const raw = Math.max(0.01, n(v, "dimension", 40));
      const unit = option(v, "unit", "ft");
      const toInches = unit === "ft" ? raw * 12 : unit === "in" ? raw : unit === "cm" ? raw / 2.54 : raw * 39.3701;
      const toReal = option(v, "direction", "toModel") === "toReal";
      const realIn = toReal ? raw * ratio : toInches;
      const modelIn = toReal ? raw : toInches / ratio;
      const comparison = `Same real object: Z ≈ ${round(realIn / 220, 2)} in · N ≈ ${round(realIn / 160, 2)} in · O ≈ ${round(realIn / 48, 2)} in · G ≈ ${round(realIn / 22.5, 2)} in.`;
      return { realSize: round(realIn, 2), modelSize: round(modelIn, 2), modelMm: round(modelIn * 25.4, 1), comparison };
    },
    howItWorks: ["Each scale is a ratio — HO runs 1:87.1 (3.5 mm to the foot), N 1:160, O 1:48, OO 1:76, G 1:22.5.", "Real → model divides your dimension by the ratio after converting to inches; model → real multiplies back out.", "The comparison line sizes the same real object in Z, N, O, and G so you can see at a glance which scale fits the shelf you actually have."],
    example: { title: "40 ft boxcar in HO", inputs: "40 ft, HO (1:87.1)", result: "About 5.5 in long (140 mm) — the same boxcar is 3.0 in in N and 10.0 in in O." },
    faqs: [{ question: "What's the difference between HO and OO?", answer: "Both run on the same 16.5 mm track. OO is 1:76 (4 mm to the foot — the UK standard), so its bodies are about 15% larger than HO's 1:87.1 — which is why British stock looks chunky next to continental equipment on a shared layout." }, { question: "Which scales are the biggest?", answer: "G at 1:22.5 is the common garden scale, running outdoors on 45 mm track; #1 gauge and 1:20.3 live nearby. At the other end, Z at 1:220 fits a complete layout on a door or coffee table." }, { question: "How much space does N save over HO?", answer: "N is about half the linear size of HO (1:160 vs 1:87.1), so the same real-world scene covers roughly 30% of the footprint — about four times the railroad in the same room, or the same railroad in a quarter of it." }, { question: "Why is G listed at 1:22.5?", answer: "G is really a track gauge, not one ratio: LGB's 1:22.5 is the most common, but 1:20.3, 1:24, and 1:29 all share the same 45 mm rails. Narrow-gauge prototypes account for most of the mixing, and modelers choose knowingly." }],
    seo: { title: "Model Train Scale Converter – Z, N, HO, O & G Ratios | CalcForged", description: "Convert real dimensions to model train size in Z, N, TT, HO, OO, S, O, and G scales — or model size back to the real world.", h1: "Model train scale converter", intro: "Every model railroad question starts with the same arithmetic: a 40-foot boxcar is 5.5 inches long in HO, and everything else follows from the ratio. This train scale converter handles Z (1:220), N (1:160), TT (1:120), HO (1:87.1), OO (1:76), S (1:64), O (1:48), and G (1:22.5) in both directions — type a real dimension in feet, inches, centimeters, or meters and get the model size in inches and millimeters, or measure a model and recover the real-world size. The comparison line sizes the same object in Z, N, O, and G at once, so deciding whether a helper yard fits on the shelf takes one glance instead of six divisions." },
    related: ["yarn-yardage", "filament-cost"],
  },
  {
    slug: "miniature-scale-converter", name: "Miniature Scale Converter", category: "Hobbies", categorySlug: "hobbies", icon: "🎲", description: "Convert between real-world heights and tabletop figure scales like 28 mm heroic and 32 mm.",
    fields: [
      { key: "height", label: "Height", type: "number", min: 0.1, max: 10000, step: "any", defaultValue: 6 },
      { key: "unit", label: "Unit", type: "select", defaultValue: "ft", options: [{ label: "Feet", value: "ft" }, { label: "Inches", value: "in" }, { label: "Centimeters", value: "cm" }, { label: "Millimeters", value: "mm" }] },
      { key: "figureScale", label: "Figure scale", type: "select", defaultValue: "56", options: [{ label: "15 mm — ~1:100 (big historical battles)", value: "100" }, { label: "25 mm — ~1:64 (classic lines)", value: "64" }, { label: "28 mm heroic — ~1:56 (D&D, fantasy standard)", value: "56" }, { label: "32 mm — ~1:50 (newer Warhammer)", value: "50" }] },
      { key: "direction", label: "Direction", type: "select", defaultValue: "toModel", options: [{ label: "Real → figure", value: "toModel" }, { label: "Figure → real", value: "toReal" }] },
    ],
    results: [
      { key: "realSize", label: "Real-world height", unit: "in", format: "number", estimate: true },
      { key: "modelMm", label: "Figure height", unit: "mm", format: "number", estimate: true },
      { key: "modelIn", label: "Figure height", unit: "in", format: "number", estimate: true },
      { key: "note", label: "Proportions note", format: "text", estimate: true },
    ],
    calculate: (v) => {
      const ratio = Math.max(1, n(v, "figureScale", 56));
      const raw = Math.max(0.1, n(v, "height", 6));
      const unit = option(v, "unit", "ft");
      const toReal = option(v, "direction", "toModel") === "toReal";
      const realMm = toReal ? raw * ratio : unit === "ft" ? raw * 304.8 : unit === "in" ? raw * 25.4 : unit === "cm" ? raw * 10 : raw;
      const modelMm = toReal ? raw : realMm / ratio;
      const scaleNames: Record<string, string> = { "100": "15 mm", "64": "25 mm", "56": "28 mm heroic", "50": "32 mm" };
      const ranges: Record<string, string> = { "100": "about 1:100", "64": "about 1:64 (some lines run 1:72)", "56": "about 1:56 (some lines run 1:60–61)", "50": "about 1:50 (some lines run 1:48–54)" };
      const name = scaleNames[String(ratio)] ?? "figure scale";
      return { realSize: round(realMm / 25.4, 2), modelMm: round(modelMm, 1), modelIn: round(modelMm / 25.4, 2), note: `${name} corresponds to ${ranges[String(ratio)] ?? "its nominal ratio"}. "Heroic" lines run chunkier than true scale — oversized heads, hands, and weapons so the figure reads at arm's length — which is why a 6-ft human lands near 32 mm in 28 mm heroic.` };
    },
    howItWorks: ["Figure scales are ratios: 15 mm runs about 1:100, 25 mm about 1:64, 28 mm heroic about 1:56, and 32 mm about 1:50.", "Real → figure divides your height by the ratio after converting to millimeters; figure → real multiplies back out.", "The proportions note flags the heroic caveat — oversized heads and hands mean a printed true-scale figure looks lanky next to heroic metal or plastic."],
    example: { title: "6 ft human in 28 mm heroic", inputs: "6 ft, 28 mm heroic (~1:56)", result: "About 33 mm tall (1.3 in) — chunkier proportions than a true 1:56 figure." },
    faqs: [{ question: "What scale are D&D miniatures?", answer: "Most official and third-party D&D minis are 28–32 mm heroic: a Medium human stands roughly 30–33 mm tall on a 25 mm (1 inch) base. The base is a game convention, not a scale measurement." }, { question: "28 mm or 32 mm — which do I buy?", answer: "They mix fine on the table. 32 mm runs a slightly larger ratio (about 1:50) with beefier proportions; modern Warhammer moved to 32 mm while D&D and most fantasy lines sit at 28 mm heroic. Pick one for a rank-and-file army, mix freely for an adventuring party." }, { question: "Can I 3D print true-scale miniatures?", answer: "Yes — rescale a 32 mm sculpt to 1:56 for true proportions, but heads and weapons will look small next to heroic metal or plastic. Many printers compromise around 1:50–52 for 'heroic-plus' that matches a mixed collection." }, { question: "Do bases tell me the scale?", answer: "No — bases follow game rules (25 mm rounds for Medium D&D creatures, 32 mm under newer editions), not figure height. Judge scale by the figure's overall height, and remember manufacturers often measure foot-to-eye, which is one more reason ratios are approximate." }],
    seo: { title: "Miniature Scale Converter – 15mm, 25mm, 28mm & 32mm Ratios | CalcForged", description: "Convert real heights to tabletop miniature scale — 15 mm, 25 mm, 28 mm heroic, and 32 mm — or a figure back to real-world size.", h1: "Miniature scale converter", intro: "How tall is a 6-foot human at 28 mm heroic scale? About 33 millimeters — and the answer changes with every line of miniatures you buy. This miniature scale converter works both directions across the hobby's common scales: 15 mm (about 1:100, the big-battle historical standard), 25 mm (about 1:64, the classic), 28 mm heroic (about 1:56, the D&D and fantasy standard), and 32 mm (about 1:50, the newer Warhammer size). Enter a real-world height in feet, inches, centimeters, or millimeters and get the figure height in millimeters and inches — or measure a miniature and recover what it represents. The proportions note carries the caveat that matters in practice: heroic lines upsize heads and hands deliberately, so a true-scale print beside heroic metal looks lanky, not broken." },
    related: ["train-scale-converter", "filament-cost", "resin-cost"],
  },
  {
    slug: "filament-cost", name: "Filament Cost Calculator", category: "Hobbies", categorySlug: "hobbies", icon: "🖨", description: "Price a 3D print from slicer weight, spool price, and your failure rate.",
    fields: [
      { key: "modelWeight", label: "Model weight", type: "number", unit: "g", min: 1, max: 5000, defaultValue: 50, help: "Read it from your slicer after slicing — it includes supports and multi-color purge." },
      { key: "spoolPrice", label: "Spool price", type: "number", unit: "$", min: 0, step: 0.5, defaultValue: 20 },
      { key: "spoolWeight", label: "Spool weight", type: "number", unit: "g", min: 50, max: 10000, defaultValue: 1000 },
      { key: "failPct", label: "Failure allowance", type: "number", unit: "%", min: 0, max: 100, defaultValue: 10, help: "Covers spaghetti prints and aborted starts; drop toward 0% once your first layer is dialed in." },
    ],
    results: [
      { key: "costPerPrint", label: "Filament cost per print", unit: "$", format: "currency", estimate: true },
      { key: "costPerGram", label: "Cost per gram", unit: "$", format: "currency", estimate: true },
      { key: "printsPerSpool", label: "Prints per spool", unit: "prints", format: "number", estimate: true },
      { key: "note", label: "Electricity & reality check", format: "text", estimate: true },
    ],
    calculate: (v) => {
      const weight = Math.max(1, n(v, "modelWeight", 50));
      const price = Math.max(0, n(v, "spoolPrice", 20));
      const spool = Math.max(1, n(v, "spoolWeight", 1000));
      const fail = Math.min(100, Math.max(0, n(v, "failPct", 10))) / 100;
      const costPerGram = price / spool;
      const costPerPrint = weight * costPerGram * (1 + fail);
      const printsPerSpool = Math.floor(spool / (weight * (1 + fail)));
      return { costPerPrint: round(costPerPrint, 2), costPerGram: round(costPerGram, 3), printsPerSpool, note: `The ${Math.round(fail * 100)}% allowance covers spaghetti and aborted first layers — drop it toward 0% once the machine is dialed in. Electricity is typically pennies: a desktop FDM printer draws 50–150 W and a typical print uses about 0.4 kWh, roughly 6¢ at common U.S. rates.` };
    },
    howItWorks: ["Cost per gram is spool price divided by spool weight; a print's share is that number times the slicer's weight estimate.", "The failure allowance inflates each print's cost and deflates prints-per-spool by the same factor, so the math absorbs the spaghetti you know is coming.", "Electricity barely registers — desktop printers draw 50–150 W, and a typical print consumes around 0.4 kWh, a few cents at most."],
    example: { title: "50 g mini on a $20 spool", inputs: "50 g model, $20 per 1,000 g spool, 10% failure allowance", result: "$1.10 per print at $0.02 per gram — about 18 prints from one spool." },
    faqs: [{ question: "PLA vs PETG — does the price differ?", answer: "Both run about $15–25 per kilogram in standard colors, with PETG typically a dollar or two higher. Specialty filaments — carbon-fiber blends, silk, wood-fill — run $30–50, which is why the calculator takes your actual spool price." }, { question: "Where do I read the print weight?", answer: "From your slicer after slicing — it reports filament grams used, already including supports and multi-color purge. Use that number rather than the model file's own weight." }, { question: "What failure rate should I use?", answer: "New setups see 10–20% failed prints; a well-tuned machine sits at 2–5%. The 10% default splits the difference and self-corrects as your first layers improve — set it honestly and the per-print cost stays real." }, { question: "Does wet filament change the math?", answer: "It changes the failure rate, not the price per gram: moist PLA strings, pops, and snaps mid-print. Dry it (PLA at 45–50 °C for 4–6 hours, PETG hotter at 55–65 °C) and your allowance can drop." }],
    seo: { title: "Filament Cost Calculator – 3D Print Cost per Print | CalcForged", description: "Calculate what a 3D print costs in filament — cost per gram, cost per print, and prints per spool, with a failure allowance built in.", h1: "Filament cost calculator", intro: "What does a 3D print actually cost? Take the slicer's weight estimate — it already includes supports and purge — multiply by your spool's price per gram, and add a failure allowance so the prints that end as spaghetti still get paid for. This filament cost calculator does that arithmetic and tells you the other number everyone forgets: prints per spool, so a 50-gram mini on a $20 spool runs about $1.10 with a 10% allowance and one kilogram covers roughly 18 of them. Electricity is in the note too, because it barely matters — desktop printers draw 50–150 W and a typical print consumes around 0.4 kWh, a few cents at U.S. rates." },
    related: ["resin-cost", "miniature-scale-converter"],
  },
  {
    slug: "resin-cost", name: "Resin Print Cost Calculator", category: "Hobbies", categorySlug: "hobbies", icon: "🧪", description: "Price a resin print from slicer volume, supports, and bottle cost.",
    fields: [
      { key: "volumeMl", label: "Model volume", type: "number", unit: "ml", min: 0.1, max: 5000, step: "any", defaultValue: 40, help: "From your slicer's resin-usage estimate." },
      { key: "density", label: "Resin density", type: "number", unit: "g/ml", min: 0.8, max: 1.5, step: 0.01, defaultValue: 1.1, help: "Standard resins run about 1.05–1.12 g/ml — check your resin's data sheet." },
      { key: "bottleSize", label: "Bottle size", type: "number", unit: "g", min: 100, max: 10000, defaultValue: 1000 },
      { key: "bottlePrice", label: "Bottle price", type: "number", unit: "$", min: 0, step: 0.5, defaultValue: 35 },
      { key: "supportPct", label: "Support allowance", type: "number", unit: "%", min: 0, max: 100, defaultValue: 15, help: "Supports typically add 10–30% resin; tree supports sit at the low end." },
      { key: "failPct", label: "Failure allowance", type: "number", unit: "%", min: 0, max: 100, defaultValue: 10 },
    ],
    results: [
      { key: "resinGrams", label: "Resin per print", unit: "g", format: "number", estimate: true },
      { key: "costPerPrint", label: "Resin cost per print", unit: "$", format: "currency", estimate: true },
      { key: "printsPerBottle", label: "Prints per bottle", unit: "prints", format: "number", estimate: true },
      { key: "note", label: "Safety & extras", format: "text" },
    ],
    calculate: (v) => {
      const volume = Math.max(0.1, n(v, "volumeMl", 40));
      const density = Math.max(0.5, n(v, "density", 1.1));
      const bottle = Math.max(1, n(v, "bottleSize", 1000));
      const price = Math.max(0, n(v, "bottlePrice", 35));
      const support = Math.min(100, Math.max(0, n(v, "supportPct", 15))) / 100;
      const fail = Math.min(100, Math.max(0, n(v, "failPct", 10))) / 100;
      const grams = volume * density * (1 + support);
      const costPerPrint = grams * (price / bottle) * (1 + fail);
      const printsPerBottle = Math.floor(bottle / grams);
      return { resinGrams: round(grams, 1), costPerPrint: round(costPerPrint, 2), printsPerBottle, note: "Wash-and-cure consumables (IPA, filters, FEP film) add a little per print. Uncured resin is safe for nobody's skin: nitrile gloves, ventilation, and no bare-hand handling until it's cured." };
    },
    howItWorks: ["Slicer volume converts to grams through the resin's density — standard resins run about 1.05–1.12 g/ml — then the support allowance adds its share.", "Cost per print is grams times price per gram, inflated by the failure allowance the way failed exposures eat resin and time.", "Prints per bottle divides bottle size by per-print grams and rounds down — the bottom of the bottle always stays dirty."],
    example: { title: "40 ml mini on a $35 bottle", inputs: "40 ml model, 1.1 g/ml density, 15% supports, 10% failures", result: "About 51 g of resin per print — $1.95 each, roughly 19 minis per 1 kg bottle." },
    faqs: [{ question: "Is resin printing cheaper than filament?", answer: "Per gram, no — resin runs roughly double filament's price. But minis and detailed parts are small: a 1 kg bottle covers about 19 typical 40 ml prints at $1–2 of resin each. Big functional parts stay filament territory." }, { question: "How much resin do supports add?", answer: "Typically 10–30% on top of the model, depending on overhangs and support style — tree supports sit at the low end, heavy full-contact supports at the top. Hollowing a model cuts it further, but always add drain holes." }, { question: "What's resin density, and why does it matter?", answer: "Slicers report volume while resin is sold by weight, so density is the bridge. Standard resins run about 1.05–1.12 g/ml in the bottle (cured parts end up denser still); the exact number is on the technical data sheet." }, { question: "How long does resin keep?", answer: "Sealed bottles last 1–2 years in a cool, dark place; an opened bottle is best within 6–12 months. Stir well before every pour — settled pigment throws your exposure settings off." }],
    seo: { title: "Resin Print Cost Calculator – Cost per Mini & Bottle | CalcForged", description: "Calculate resin cost per print from slicer volume, density, supports, and bottle price — plus prints per bottle and safe-handling notes.", h1: "Resin print cost calculator", intro: "Resin math has one extra step filament doesn't: slicers report volume, but resin is sold by weight, and density is the bridge. This resin cost calculator takes your model's volume, applies a density of about 1.05–1.12 g/ml for standard resins, adds the 10–30% that supports typically consume, and prices the print against your bottle — a 40 ml mini lands near 51 grams and about $1.95 on a $35 bottle, with roughly 19 prints to the kilogram. The failure allowance is there because failed exposures waste resin and time the same way spaghetti prints waste filament. The note carries the part that isn't optional: uncured resin needs nitrile gloves and ventilation, every time." },
    related: ["filament-cost", "miniature-scale-converter"],
  },
  {
    slug: "charcuterie-board", name: "Charcuterie Board Calculator", category: "Food & Catering", categorySlug: "food-catering", icon: "🧀", description: "Turn a guest count into cheese, meat, cracker, and filler amounts for a board that holds.",
    fields: [
      { key: "guests", label: "Guests", type: "number", unit: "people", min: 1, max: 500, defaultValue: 12 },
      { key: "boardStyle", label: "Role of the board", type: "select", defaultValue: "appetizer", options: [{ label: "Appetizer alongside dinner — 2 oz each of cheese and meat", value: "appetizer" }, { label: "The board IS the meal — 3.5 oz each", value: "meal" }] },
      { key: "cheeseVarieties", label: "Cheese varieties", type: "number", unit: "kinds", min: 1, max: 10, defaultValue: 3 },
      { key: "meatVarieties", label: "Meat varieties", type: "number", unit: "kinds", min: 0, max: 10, defaultValue: 2 },
    ],
    results: [
      { key: "cheeseLb", label: "Cheese total", unit: "lb", format: "number", estimate: true },
      { key: "meatLb", label: "Meat total", unit: "lb", format: "number", estimate: true },
      { key: "crackers", label: "Crackers", format: "text", estimate: true },
      { key: "shoppingList", label: "Shopping list", format: "text", estimate: true },
    ],
    calculate: (v) => {
      const guests = Math.max(1, n(v, "guests", 12));
      const meal = option(v, "boardStyle", "appetizer") === "meal";
      const ozCheese = meal ? 3.5 : 2;
      const ozMeat = meal ? 3.5 : 2;
      const cheeseLb = round(guests * ozCheese / 16, 1);
      const meatLb = round(guests * ozMeat / 16, 1);
      const crackerOz = meal ? 2 : 1.5;
      const crackerLb = round(guests * crackerOz / 16, 1);
      const crackerBoxes = ceil(guests * crackerOz / 8);
      const cheeseVarieties = Math.max(1, n(v, "cheeseVarieties", 3));
      const meatVarieties = Math.max(0, n(v, "meatVarieties", 2));
      const cheesePer = Math.ceil(guests * ozCheese / cheeseVarieties / 4) * 4;
      const meatPer = Math.ceil(guests * ozMeat / Math.max(1, meatVarieties) / 2) * 2;
      const fillLb = round(guests * 3 / 16, 1);
      const lines = [
        `Cheese — ${cheeseLb} lb total: ${cheeseVarieties} varieties × ~${cheesePer} oz each (round up to whole blocks at the counter).`,
        meatVarieties > 0 ? `Meat — ${meatLb} lb total: ${meatVarieties} varieties × ~${meatPer} oz each (an 8 oz pack covers about ${Math.max(1, Math.round(8 * meatVarieties / ozMeat))} guests per variety).` : "Meat — none planned; a spread or pâté makes a good savory anchor instead.",
        `Crackers — ${crackerLb} lb total: about ${crackerBoxes} standard 8 oz boxes.`,
        `Fillers — about ${fillLb} lb combined of fruit, nuts, and olives or pickles (2–3 oz per person) to plug the gaps.`,
      ];
      return { cheeseLb, meatLb, crackers: `${crackerLb} lb — about ${crackerBoxes} standard boxes (${crackerOz} oz per guest).`, shoppingList: lines.join("\n") };
    },
    howItWorks: ["Appetizer boards plan 2 oz each of cheese and meat per guest; when the board is the meal, that climbs to about 3.5 oz each — 7 oz of board per person.", "Crackers run 1.5–2 oz per guest, and fruit, nuts, and olives add another 2–3 oz per person to fill the visual gaps.", "The shopping list divides totals across your variety counts and rounds up to store-friendly packages — whole blocks and 8 oz meat packs, never 4.7 oz."],
    example: { title: "12 guests, board is dinner", inputs: "12 guests, the board IS the meal, 3 cheeses, 2 meats", result: "About 2.6 lb each of cheese and meat — 16 oz wedges ×3, ~22 oz meat packs ×2, plus 3 cracker boxes and 2.3 lb of fillers." },
    faqs: [{ question: "How much charcuterie per person?", answer: "For an appetizer board alongside dinner, 2 oz of cheese and 2 oz of meat per guest. When the board is the meal, 3–4 oz each — the calculator plans 3.5 — plus 1–2 oz of crackers and 2–3 oz of fruit, nuts, and olives to fill the board." }, { question: "How far ahead can I buy?", answer: "Hard cheeses keep 1–2 weeks (rewrap in parchment, not plastic) and unopened cured meats keep for weeks. Buy soft cheeses and cut fruit 1–2 days out, and slice cured meats the day of for the best look." }, { question: "How long can a board sit out?", answer: "Follow the 2-hour rule: perishable food is safe at room temperature about two hours (one hour above 90 °F). Set out half the meat and refill from the fridge, and keep soft cheeses chilled until the last minute." }, { question: "How many cheeses and meats for a good board?", answer: "Three cheeses and two meats cover most parties: one soft, one firm, one blue or aged; one salami-style, one prosciutto-style. Bigger crowds scale quantities before varieties — more of what worked beats a crowded board." }],
    seo: { title: "Charcuterie Board Calculator – Amounts Per Person | CalcForged", description: "Calculate cheese, meat, crackers, and fillers per person for a charcuterie board — appetizer or board-as-meal — rounded to store-friendly packages.", h1: "Charcuterie board calculator", intro: "How much charcuterie per person is the difference between a board that holds and a board that gets picked clean in ten minutes. For an appetizer spread alongside dinner, plan 2 oz each of cheese and meat per guest; when the board is the meal, that climbs to about 3.5 oz each, plus 1–2 oz of crackers and 2–3 oz of fruit, nuts, and olives to fill the gaps. Enter your guest count, the board's role, and how many cheeses and meats you want, and the calculator returns totals in pounds plus a shopping list divided by variety and rounded up to store-friendly packages — whole cheese blocks, 8 oz meat packs, full cracker boxes. The buying-ahead and 2-hour-room rules are in the FAQs, because a board is only as good as when it was built." },
    related: ["appetizers-per-person", "wedding-dessert-table", "pizza-party"],
  },
];

function formatFraction(value: number) {
  const rounded = Math.round(value * 16) / 16;
  const whole = Math.floor(rounded);
  const remainder = Math.round((rounded - whole) * 16);
  if (remainder === 0) return String(whole);
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const divisor = gcd(remainder, 16);
  const fraction = `${remainder / divisor}/${16 / divisor}`;
  return whole ? `${whole} ${fraction}` : fraction;
}

export const categories: { name: Category; slug: string; description: string }[] = [
  { name: "Food & Catering", slug: "food-catering", description: "Plan portions, menus, and recipes with less guesswork." },
  { name: "Home Improvement", slug: "home-improvement", description: "Get practical material estimates before you start." },
  { name: "Construction", slug: "construction", description: "Turn dimensions into order-ready quantities." },
  { name: "Events", slug: "events", description: "Make guest counts and event budgets easier to plan." },
  { name: "Business", slug: "business", description: "Check costs, margins, and operating decisions." },
  { name: "Hobbies", slug: "hobbies", description: "Useful tools for projects and pastimes." },
  { name: "Automotive", slug: "automotive", description: "Maintenance and ownership planning tools." },
  { name: "Everyday Life", slug: "everyday-life", description: "Small decisions, answered clearly." },
  { name: "Finance", slug: "finance", description: "Loans, savings, and money decisions made clear." },
  { name: "Health", slug: "health", description: "Quick health checks and personal timelines." },
  { name: "Travel", slug: "travel", description: "Money and time, converted for wherever you're headed." },
  { name: "Education", slug: "education", description: "Grades, roots, and quick academic answers." },
];

export const calculatorDefinitions = definitions;
export const calculatorsBySlug = Object.fromEntries(definitions.map((d) => [d.slug, d])) as Record<string, CalculatorDefinition>;
export const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<string, (typeof categories)[number]>;
