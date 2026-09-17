export type Category =
  | "Food & Catering"
  | "Home Improvement"
  | "Construction"
  | "Events"
  | "Business"
  | "Hobbies"
  | "Automotive"
  | "Everyday Life";

export type FieldOption = { label: string; value: string };
export type FieldDefinition = {
  key: string;
  label: string;
  type: "number" | "select" | "text" | "ingredient-list";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number;
  options?: FieldOption[];
  help?: string;
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
  howItWorks: string[];
  example: { title: string; inputs: string; result: string };
  faqs: { question: string; answer: string }[];
  seo: { title: string; description: string; h1: string; intro: string };
  related: string[];
};

const n = (values: CalculatorValues, key: string, fallback = 0) =>
  Number(values[key] ?? fallback) || fallback;
const option = (values: CalculatorValues, key: string, fallback: string) =>
  String(values[key] ?? fallback);
const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const ceil = (value: number) => Math.ceil(value);

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
    slug: "recipe-scaling", name: "Recipe Scaling Calculator", category: "Food & Catering", categorySlug: "food-catering", icon: "⌁", description: "Scale a recipe to a new serving count and keep ingredient amounts readable.",
    fields: [{ key: "originalServings", label: "Original servings", type: "number", unit: "servings", min: 1, defaultValue: 4 }, { key: "newServings", label: "New servings", type: "number", unit: "servings", min: 1, defaultValue: 8 }, { key: "ingredients", label: "Ingredients", type: "ingredient-list", help: "Add the amount, unit, and ingredient name for each row." }],
    results: [{ key: "factor", label: "Scale factor", format: "number" }, { key: "scaled", label: "Scaled ingredients", format: "text" }, { key: "note", label: "Baking note", format: "text" }],
    calculate: (v) => { const factor = n(v, "newServings", 8) / n(v, "originalServings", 4); const rows = Array.isArray(v.ingredients) ? v.ingredients : []; const scaled = rows.map((r) => `${formatFraction(Number(r.amount) * factor)} ${r.unit} ${r.ingredient}`); return { factor: round(factor, 2), scaled: scaled.join("\n") || "Add ingredients above", note: "For baking, scale pan size and time carefully; doubling a recipe rarely means doubling bake time." }; },
    howItWorks: ["The scale factor is new servings divided by original servings.", "Each ingredient amount is multiplied by that factor, while units and ingredient names stay the same.", "Cooking time and pan size do not always scale linearly, especially for baking; use the note as a prompt to check the recipe."],
    example: { title: "4 servings to 8", inputs: "Original 4 servings, new 8 servings", result: "A 2× scale factor. A 1/2 cup ingredient becomes 1 cup." },
    faqs: [{ question: "How do I scale a recipe down?", answer: "Enter a smaller new serving count. The scale factor will be below 1 and each ingredient will shrink proportionally." }, { question: "Does cooking time double?", answer: "Usually not. Watch doneness and use the recipe's pan-size guidance, especially for baking." }, { question: "Can I scale spices exactly?", answer: "Start with the calculated amount, then adjust to taste. Salt, chili, and strong spices may not scale perfectly." }, { question: "What units can I enter?", answer: "Enter any unit you already use—cups, grams, teaspoons, pounds, or another label. The tool scales the number and keeps your unit." }],
    seo: { title: "Recipe Scaling Calculator – Scale Ingredients | CalcForged", description: "Scale recipe ingredients up or down by servings with readable fractions and baking notes.", h1: "Recipe scaling calculator", intro: "Scaling a recipe should be simple: divide the servings you want by the servings you have, then multiply each ingredient by that factor. This calculator does the arithmetic and formats common results as useful fractions so your shopping list stays readable. Add the ingredients in your recipe, choose the new serving count, and the scaled list updates as you type. For baking, use the result as a starting point and remember that pan size, oven time, and leavening often need their own judgment." },
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
];

export const calculatorDefinitions = definitions;
export const calculatorsBySlug = Object.fromEntries(definitions.map((d) => [d.slug, d])) as Record<string, CalculatorDefinition>;
export const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<string, (typeof categories)[number]>;
