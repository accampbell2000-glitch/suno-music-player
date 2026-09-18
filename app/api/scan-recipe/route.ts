type ScannedIngredient = { amount: string; unit: string; ingredient: string };

const SYSTEM_PROMPT = [
  "You extract recipes from photos of recipes (cookbooks, handwritten cards, phone screenshots).",
  "Reply with ONLY minified JSON matching exactly:",
  '{"name":string,"originalServings":number,"ingredients":[{"amount":string,"unit":string,"ingredient":string}]}',
  'Rules: "amount" is the numeric quantity as a DECIMAL string (e.g. "0.5", "1.25", "2" — never a fraction like "1/2"). "unit" is a short unit label such as cup, tbsp, tsp, g, ml, oz, lb, clove, can — use "" when the recipe states none. "ingredient" is the ingredient name only, with preparation notes removed (write "butter", not "1 stick butter, softened").',
  '"originalServings" is the servings or yield the recipe states; use 4 if it states none. "name" is the recipe title, "" if unreadable.',
].join(" ");

export async function POST(request: Request) {
  let payload: { image?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const image = typeof payload.image === "string" && payload.image.startsWith("data:image/") ? payload.image : null;
  if (!image) return Response.json({ error: "No photo was provided." }, { status: 400 });
  if (image.length > 6_500_000) return Response.json({ error: "That photo is too large — try a smaller one." }, { status: 413 });

  const apiKey = process.env.CREVIO_API_KEY;
  const gatewayUrl = process.env.CREVIO_AI_GATEWAY_URL;
  if (!apiKey || !gatewayUrl) return Response.json({ error: "Scanning is unavailable right now." }, { status: 500 });

  let completion: Response;
  try {
    completion = await fetch(`${gatewayUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "automatic",
        max_tokens: 1600,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the ingredient list from this recipe photo as JSON." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });
  } catch {
    return Response.json({ error: "The scan timed out — try again in a moment." }, { status: 504 });
  }

  if (!completion.ok) return Response.json({ error: "The scan failed — try again in a moment." }, { status: 502 });

  const data = (await completion.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
  const text = data?.choices?.[0]?.message?.content ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return Response.json({ error: "We couldn't read a recipe in that photo — try a clearer, closer shot." }, { status: 422 });

  try {
    const parsed = JSON.parse(match[0]) as { name?: unknown; originalServings?: unknown; ingredients?: unknown };
    const ingredients = Array.isArray(parsed.ingredients)
      ? (parsed.ingredients as Record<string, unknown>[])
          .filter((row) => typeof row?.ingredient === "string" && row.ingredient.trim().length > 0)
          .slice(0, 40)
          .map((row) => ({
            amount: typeof row.amount === "string" || typeof row.amount === "number" ? String(row.amount).slice(0, 12) : "",
            unit: typeof row.unit === "string" ? row.unit.slice(0, 20) : "",
            ingredient: (row.ingredient as string).slice(0, 80),
          }))
      : [];
    if (!ingredients.length) return Response.json({ error: "We couldn't find an ingredient list in that photo — try a clearer, closer shot." }, { status: 422 });
    const servings = Number(parsed.originalServings);
    return Response.json({
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 120) : "",
      originalServings: Number.isFinite(servings) && servings >= 1 && servings <= 500 ? servings : 4,
      ingredients,
    });
  } catch {
    return Response.json({ error: "We couldn't read that recipe — try a clearer, closer shot." }, { status: 422 });
  }
}
