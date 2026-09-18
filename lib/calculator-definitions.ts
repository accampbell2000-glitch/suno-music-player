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
