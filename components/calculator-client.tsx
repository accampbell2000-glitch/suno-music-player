"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calculatorsBySlug, verifiedTireSizes } from "@/lib/calculator-definitions";
import type { CalculatorDefinition, CalculatorValues, IngredientRow, ResultDefinition } from "@/lib/calculator-definitions";
import { affiliateTopPicks, affiliateUrl } from "@/config/affiliate-links";

/**
 * PartnerPick
 *
 * Compact commission strip shown inside the calculator directly under the
 * results — the highest-intent moment. One product, one link, tagged in
 * config/affiliate-links.ts. Renders nothing where no pick exists; the
 * disclosure travels with the strip because it's a paid-link context.
 */
function PartnerPick({ slug }: { slug: string }) {
  const pick = affiliateTopPicks[slug];
  if (!pick) return null;
  return (
    <div className="cf-partner-strip">
      <p className="cf-kicker">Partner pick</p>
      <a href={affiliateUrl(pick.query)} target="_blank" rel="sponsored nofollow noopener">
        <strong>{pick.name}</strong>
        <span>{pick.blurb}</span>
        <em aria-hidden="true">Check current price ↗</em>
      </a>
      <small>As an Amazon Associate, CalcForged earns from qualifying purchases.</small>
    </div>
  );
}

const ABRACADABRA_AFFILIATE_URL = "https://www.anrdoezrs.net/click-101888675-17267207";

function AbracadabraPartyPick({ slug }: { slug: string }) {
  const partySlugs = ["balloon-quantity", "pizza-party", "party-ice"];
  if (!partySlugs.includes(slug)) return null;
  const calculator = calculatorsBySlug[slug];
  const returnUrl = `https://calcforged.com/calculators/${calculator.categorySlug}/${slug}`;
  const description = slug === "balloon-quantity"
    ? "Planning the balloons? Browse costumes and playful extras for the celebration."
    : slug === "pizza-party"
      ? "Planning a celebration? Browse costumes, props, and playful party extras."
      : "Getting the party together? Browse costumes, props, and playful extras.";
  const qrUrl = `/qr/${slug}.png`;
  return (
    <>
      <div className="cf-partner-strip cf-abracadabra-pick">
        <p className="cf-kicker">Party find</p>
        <a href={ABRACADABRA_AFFILIATE_URL} target="_blank" rel="sponsored nofollow noopener">
          <img src="https://www.lduhtrp.net/image-101888675-17267207" width="640" height="640" alt="Abracadabra NYC — costumes, props, and party finds" />
          <span className="cf-abracadabra-copy"><strong>Costumes &amp; party extras</strong><span>{description}</span><em aria-hidden="true">Explore Abracadabra NYC ↗</em></span>
        </a>
        <small>Affiliate link: CalcForged may earn a commission if you make a qualifying purchase.</small>
      </div>
      <div className="cf-print-return">
        <img src={qrUrl} width="180" height="180" alt={`QR code to reopen the ${calculator.name} on CalcForged`} />
        <span className="cf-print-return-copy"><strong>Keep planning with CalcForged</strong><span>Scan to reopen this calculator and find our party recommendation.</span><small>Affiliate disclosure: CalcForged may earn a commission if you purchase through the party recommendation on the page.</small></span>
      </div>
    </>
  );
}


function initialValues(definition: CalculatorDefinition): CalculatorValues {
  return Object.fromEntries(definition.fields.map((field) => [field.key, field.type === "ingredient-list" ? [{ ingredient: "", amount: "", unit: "" }] : field.defaultValue ?? field.options?.[0]?.value ?? ""]));
}

function formatValue(value: string | number, format?: string) {
  if (typeof value === "string") return value;
  if (format === "currency") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  if (format === "percent") return `${value}%`;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function CalculatorClient({ slug }: { slug: string }) {
  const definition = calculatorsBySlug[slug];
  const [values, setValues] = useState<CalculatorValues>(() => initialValues(definition));
  const [recipeUnitSystem, setRecipeUnitSystem] = useState<"us" | "metric">("us");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState<boolean | null>(null);
  const calculationValues = useMemo(() => definition.slug === "recipe-scaling" ? { ...values, __recipeUnitSystem: recipeUnitSystem } : values, [definition.slug, values, recipeUnitSystem]);
  const results = useMemo(() => definition.calculate(calculationValues), [definition, calculationValues]);

  useEffect(() => {
    const key = `calcforge-session-${definition.slug}`;
    const prior = window.localStorage.getItem(key);
    window.localStorage.setItem(key, "1");
    fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "page_view", calculatorSlug: definition.slug, sessionHash: key, isRepeat: Boolean(prior) }) }).catch(() => undefined);
    fetch("/api/toolkit").then((res) => {
      if (res.status === 401) { setSaved(false); return null; }
      return res.ok ? (res.json() as Promise<{ ok?: boolean; slugs?: string[] }>) : null;
    }).then((data) => { if (data?.ok) setSaved(Array.isArray(data.slugs) && data.slugs.includes(definition.slug)); }).catch(() => undefined);
  }, [definition.slug]);

  async function toggleSaved() {
    const next = !saved;
    setSaved(next);
    const res = await fetch("/api/toolkit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: definition.slug, action: next ? "add" : "remove" }) });
    if (res.status === 401) {
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (!res.ok) setSaved(!next);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const plain: Record<string, string | number> = {};
      definition.fields.forEach((field) => { if (field.type !== "ingredient-list") plain[field.key] = values[field.key] as string | number; });
      const summary = Object.entries(plain).map(([key, value]) => `${key}:${typeof value === "number" ? Math.round(Number(value) / 5) * 5 : String(value)}`).join("|");
      fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "calculation_performed", calculatorSlug: definition.slug, inputSummary: summary, inputs: plain, sessionHash: `calcforge-session-${definition.slug}` }) }).catch(() => undefined);
    }, 2500);
    return () => clearTimeout(timer);
  }, [definition, values]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unitPreference = params.get("units");
    if (definition.slug === "recipe-scaling" && (unitPreference === "us" || unitPreference === "metric")) setRecipeUnitSystem(unitPreference);
    const next = { ...values };
    definition.fields.forEach((field) => {
      const encoded = params.get(field.key);
      if (encoded !== null && field.type !== "ingredient-list") next[field.key] = field.type === "number" ? Number(encoded) : encoded;
    });
    setValues(next);
  // Initial URL hydration only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definition.slug]);

  useEffect(() => {
    const todayFields = definition.fields.filter((field) => field.defaultToday);
    if (todayFields.length) {
      const today = new Date().toLocaleDateString("en-CA");
      setValues((current) => {
        const next = { ...current };
        todayFields.forEach((field) => { if (!current[field.key]) next[field.key] = today; });
        return next;
      });
    }
    if (definition.liveRates) {
      let cancelled = false;
      fetch("https://api.frankfurter.dev/v1/latest?base=USD")
        .then((res) => res.json() as Promise<{ rates?: Record<string, number>; date?: string }>)
        .then((data) => {
          if (!cancelled && data?.rates) {
            const rates = { USD: 1, ...data.rates } as Record<string, number>;
            setValues((current) => ({ ...current, __rates: JSON.stringify({ rates, date: data.date as string }) }));
          }
        })
        .catch(() => undefined);
      return () => { cancelled = true; };
    }
  }, [definition]);

  const update = (key: string, value: string | number | IngredientRow[]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      // A dependent dropdown resets when its parent changes, so a stale child
      // selection can never pair with a new parent value.
      const child = definition.fields.find((f) => f.optionsFor === key);
      if (child && next[child.key] && !(child.optionsMap?.[String(value)] ?? []).some((o) => o.value === next[child.key])) next[child.key] = "";
      return next;
    });
    setNotice("");
  };

  const applyScan = (scan: { originalServings?: number; ingredients: IngredientRow[] }) => {
    setValues((current) => {
      const next = { ...current };
      if (typeof scan.originalServings === "number" && definition.fields.some((field) => field.key === "originalServings")) next.originalServings = scan.originalServings;
      definition.fields.forEach((field) => { if (field.type === "ingredient-list") next[field.key] = scan.ingredients; });
      return next;
    });
    setNotice("Photo scanned — check the rows, then set the new servings");
  };

  const shareUrl = () => {
    const params = new URLSearchParams();
    definition.fields.forEach((field) => {
      const value = values[field.key];
      if (typeof value === "string" || typeof value === "number") params.set(field.key, String(value));
    });
    if (definition.slug === "recipe-scaling") params.set("units", recipeUnitSystem);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard?.writeText(url);
    fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "share_results", calculatorSlug: definition.slug }) }).catch(() => undefined);
    setNotice("Share link copied");
  };

  const copyResults = () => {
    const text = `${definition.name}\n${definition.results.filter((r) => results[r.key] !== "").map((r) => `${r.label}: ${formatValue(results[r.key] ?? "—", r.format)}${r.unit && r.format !== "currency" ? ` ${r.unit}` : ""}`).join("\n")}`;
    navigator.clipboard?.writeText(text);
    fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "copy_results", calculatorSlug: definition.slug }) }).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="cf-calculator" id="calculator">
      <div className="cf-calculator-head"><div><p className="cf-kicker">Live calculator</p><h2>Enter your details</h2></div><div className="cf-head-actions"><button type="button" className={`cf-save-star${saved ? " is-saved" : ""}`} onClick={toggleSaved} disabled={saved === null} aria-label={saved ? "Remove from my toolkit" : "Save to my toolkit"}><span aria-hidden="true">{saved ? "★" : "☆"}</span>{saved ? "Saved" : "Save"}</button><span className="cf-live-dot">Updates instantly</span></div></div>
      <PrintSheet definition={definition} values={values} results={results} />
      <div className="cf-calc-grid">
        <div className="cf-inputs">
          {definition.photoScan && <RecipePhotoScan onScan={applyScan} />}
          {definition.fields.filter((field) => !field.visibleWhen || field.visibleWhen.values.includes(String(values[field.visibleWhen.key]))).map((field) => field.type === "ingredient-list" ? <IngredientEditor key={field.key} value={(values[field.key] as IngredientRow[]) ?? []} onChange={(rows) => update(field.key, rows)} schema={field.ingredientSchema} /> : <label className="cf-field" key={field.key}><span>{field.label}</span><div className="cf-input-wrap">{field.type === "select" ? (() => { const opts = field.optionsFor ? (field.optionsMap?.[String(values[field.optionsFor])] ?? []) : (field.options ?? []); const current = String(values[field.key]); return <select value={current} onChange={(event) => update(field.key, event.target.value)}>{field.optionsFor && <option value="" disabled>{opts.length ? `Choose a ${field.label.toLowerCase()}` : "Choose an option"}</option>}{opts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>; })() : <input type={field.type} min={field.min} max={field.max} step={field.step} value={String(values[field.key])} onChange={(event) => update(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)} />}{field.unit && <em>{field.unit}</em>}</div>{field.help && <small>{field.help}</small>}</label>)}
        </div>
        <div className="cf-results-wrap">
          <div className="cf-results-head"><div><p className="cf-kicker">Your estimate</p><h3>Results</h3></div><div className="cf-results-head-tools">{definition.slug === "recipe-scaling" && <div className="cf-unit-switch-wrap"><div className="cf-unit-switch-row"><span className="cf-unit-switch-label">Show in</span><div className="cf-unit-switch" role="group" aria-label="Recipe result units"><button type="button" aria-pressed={recipeUnitSystem === "us"} onClick={() => setRecipeUnitSystem("us")}>US</button><button type="button" aria-pressed={recipeUnitSystem === "metric"} onClick={() => setRecipeUnitSystem("metric")}>Metric</button></div></div><small className="cf-unit-note">Weight and volume stay separate.</small></div>}<span className="cf-estimate-note">Planning estimate</span></div></div>
          <div className="cf-results">{definition.results.filter((result) => results[result.key] !== "").map((result) => { const wide = result.format === "text" && typeof results[result.key] === "string" && (results[result.key] as string).includes("\n"); return <div className={`cf-result${wide ? " cf-result-wide" : ""}`} key={result.key}><span>{result.label}{result.estimate && <sup>EST.</sup>}</span>{definition.slug === "tire-size" && result.key === "matches" ? <TireMatchResults value={String(results[result.key] ?? "")} /> : <ResultBody result={result} value={results[result.key]} />}{result.interpretation && <p>{result.interpretation}</p>}</div>; })}</div>
          <div className="cf-result-actions"><button type="button" onClick={copyResults}>{copied ? "Copied" : "Copy results"}</button><button type="button" onClick={() => { fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "print_results", calculatorSlug: definition.slug }) }).catch(() => undefined); window.print(); }}>Print</button><button type="button" onClick={shareUrl}>Share link</button></div>{notice && <p className="cf-action-notice" role="status">{notice}</p>}
          {definition.slug !== "tire-size" && <PartnerPick slug={definition.slug} />}
          <AbracadabraPartyPick slug={definition.slug} />
        </div>
      </div>
    </div>
  );
}

function PrintSheet({ definition, values, results }: { definition: CalculatorDefinition; values: CalculatorValues; results: ReturnType<CalculatorDefinition["calculate"]> }) {
  const visibleFields = definition.fields.filter((field) => !field.visibleWhen || field.visibleWhen.values.includes(String(values[field.visibleWhen.key])));
  const printableResults = definition.results.filter((result) => results[result.key] !== undefined && results[result.key] !== "");

  return (
    <section className="cf-print-sheet" aria-hidden="true">
      <div className="cf-print-masthead">
        <div className="cf-print-wordmark"><span className="cf-print-mark">C</span><span>CALCFORGED</span></div>
        <span className="cf-print-category">{definition.category} / Calculation sheet</span>
      </div>
      <header className="cf-print-title">
        <h1>{definition.name}</h1>
        <p>{definition.description}</p>
      </header>
      <div className="cf-print-columns">
        <section className="cf-print-section cf-print-inputs">
          <h2>Inputs used</h2>
          <div className="cf-print-input-grid">
            {visibleFields.map((field) => {
              const value = values[field.key];
              if (field.type === "ingredient-list") {
                const rows = Array.isArray(value) ? (value as IngredientRow[]).filter((row) => [row.ingredient, row.amount, row.unit].some((part) => String(part ?? "").trim())) : [];
                return (
                  <div className="cf-print-input cf-print-input-list" key={field.key}>
                    <span className="cf-print-label">{field.label}</span>
                    {rows.length ? <ul>{rows.map((row, index) => {
                      const detail = field.ingredientSchema
                        ? [row.ingredient, row.amount && `${row.amount} ${field.ingredientSchema.amount.toLowerCase()}`, row.unit && `${row.unit} ${field.ingredientSchema.unit.toLowerCase()}`].filter(Boolean).join(" · ")
                        : [row.amount, row.unit, row.ingredient].filter(Boolean).join(" ");
                      return <li key={`${field.key}-${index}`}>{detail}</li>;
                    })}</ul> : <strong>None entered</strong>}
                  </div>
                );
              }

              let displayValue: string;
              if (field.type === "select") {
                const options = field.optionsFor ? field.optionsMap?.[String(values[field.optionsFor])] ?? [] : field.options ?? [];
                displayValue = options.find((option) => option.value === String(value ?? ""))?.label ?? (value ? String(value) : "Not selected");
              } else {
                const unit = field.unit && Number(value) === 1 && field.unit.endsWith("s") ? field.unit.slice(0, -1) : field.unit;
                displayValue = value === undefined || value === "" ? "Not entered" : `${String(value)}${unit ? ` ${unit}` : ""}`;
              }
              return <div className="cf-print-input" key={field.key}><span className="cf-print-label">{field.label}</span><strong>{displayValue}</strong></div>;
            })}
          </div>
        </section>
        <section className="cf-print-section cf-print-outputs">
          <h2>Results</h2>
          <div className="cf-print-result-grid">
            {printableResults.map((result) => {
              const value = results[result.key];
              const lines = typeof value === "string" && value.includes("\n") ? value.split("\n").filter((line) => line.trim()) : null;
              return (
                <article className={`cf-print-result${lines ? " cf-print-result-wide" : ""}${result.format === "text" ? " cf-print-result-text" : ""}`} key={result.key}>
                  <span className="cf-print-label">{result.label}{result.estimate && <em>Estimate</em>}</span>
                  {lines ? <ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul> : <strong>{formatValue(value, result.format)}{result.unit && result.format !== "currency" && <small> {Number(value) === 1 && result.unit.endsWith("s") ? result.unit.slice(0, -1) : result.unit}</small>}</strong>}
                  {result.interpretation && <p>{result.interpretation}</p>}
                </article>
              );
            })}
          </div>
        </section>
      </div>
      <section className="cf-print-notes">
        <h2>Additional notes</h2>
        <div className="cf-print-note-lines" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div key={index} />)}</div>
      </section>
      <footer className="cf-print-footer"><strong>CalcForged</strong><span>Practical calculators. Straight answers.</span></footer>
    </section>
  );
}

function TireMatchResults({ value }: { value: string }) {
  const lines = value.split("\n").filter((line) => line.trim());
  const sizePattern = /^(Your size|Match|Close option|Calculated option):\s*(.+?)\s+\u2014\s+(.+)$/;
  const linkCount = lines.filter((line) => sizePattern.test(line)).length;
  return (
    <div className="cf-tire-match-results">
      {linkCount > 0 && <div className="cf-tire-shopping-note"><strong>Shop by tire size</strong><span>Select a size below to search Amazon. Calculated options may not be retailer-verified.</span></div>}
      <ul className="cf-tire-match-lines">
        {lines.map((line, index) => {
          const match = sizePattern.exec(line);
          if (!match) return <li className="cf-tire-match-note" key={`note-${index}`}>{line}</li>;
          const [, label, size, details] = match;
          const isVerified = verifiedTireSizes.has(size);
          const searchSize = size.replace(/×/g, "x");
          return <li className="cf-tire-match-row" key={`${label}-${size}-${index}`}><span className="cf-tire-match-label">{label === "Your size" && !isVerified ? "Entered size" : label}: </span><a className={`cf-tire-match-size${isVerified ? "" : " cf-tire-match-unverified"}`} href={affiliateUrl(`${searchSize} tires`)} target="_blank" rel="sponsored nofollow noopener" aria-label={`Search Amazon for tires in size ${size}${isVerified ? "" : ", not retailer-verified"}`}>{size}</a><span className="cf-tire-match-details"> · {details}</span>{!isVerified && <small className="cf-tire-unverified-note">Not in our verified retailer list.</small>}</li>;
        })}
      </ul>
      {linkCount > 0 && <small className="cf-tire-affiliate-disclosure">As an Amazon Associate, CalcForged earns from qualifying purchases.</small>}
    </div>
  );
}

function ResultBody({ result, value }: { result: ResultDefinition; value: string | number | undefined }) {
  if (result.format === "text" && typeof value === "string" && value.includes("\n")) {
    return <ul className="cf-result-lines">{value.split("\n").filter((line) => line.trim().length > 0).map((line) => <li key={line}>{line}</li>)}</ul>;
  }
  return <strong className={result.format === "text" ? "cf-result-text" : undefined}>{formatValue(value ?? "—", result.format)}{result.unit && result.format !== "currency" && <small> {result.unit}</small>}</strong>;
}

function IngredientEditor({ value, onChange, schema }: { value: IngredientRow[]; onChange: (value: IngredientRow[]) => void; schema?: { first: string; amount: string; unit: string; name: string; amountPlaceholder?: string; unitPlaceholder?: string; namePlaceholder?: string } }) {
  const labels = schema ?? { first: "Ingredients", amount: "Amount", unit: "Unit", name: "Ingredient" };
  const amountPlaceholder = labels.amountPlaceholder ?? "1/2";
  const unitPlaceholder = labels.unitPlaceholder ?? "cup";
  const namePlaceholder = labels.namePlaceholder ?? labels.name;
  return <fieldset className="cf-ingredients"><legend>{labels.first}</legend>{value.map((row, index) => <div className="cf-ingredient-row" key={`${index}-${row.ingredient}`}><input aria-label={`${labels.amount} amount`} placeholder={amountPlaceholder} value={row.amount} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, amount: event.target.value } : item))} /><input aria-label={`${labels.unit} unit`} placeholder={unitPlaceholder} value={row.unit} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, unit: event.target.value } : item))} /><input aria-label={`${labels.name} name`} placeholder={namePlaceholder} value={row.ingredient} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, ingredient: event.target.value } : item))} /></div>)}<button className="cf-add-row" type="button" onClick={() => onChange([...value, { ingredient: "", amount: "", unit: "" }])}>+ Add {labels.name.toLowerCase()}</button></fieldset>;
}

async function shrinkImage(file: File, maxEdge = 1600, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

function RecipePhotoScan({ onScan }: { onScan: (scan: { originalServings?: number; ingredients: IngredientRow[] }) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setStatus("scanning");
    setMessage("Reading your recipe…");
    try {
      const image = await shrinkImage(file);
      setPreview(image);
      const response = await fetch("/api/scan-recipe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image }) });
      const data = await response.json().catch(() => null) as { error?: string; originalServings?: number; ingredients?: IngredientRow[] } | null;
      if (!response.ok || !data?.ingredients?.length) {
        setStatus("error");
        setMessage(data?.error ?? "The scan failed — try again in a moment.");
        return;
      }
      onScan({ originalServings: data.originalServings, ingredients: data.ingredients });
      setStatus("idle");
      setMessage("");
    } catch {
      setStatus("error");
      setMessage("That photo couldn't be read — try another one.");
    }
  };

  return (
    <fieldset className="cf-scan" disabled={status === "scanning"}>
      <legend>Scan a recipe photo</legend>
      {preview && <img className="cf-scan-preview" src={preview} alt="Recipe photo preview" width={64} height={64} />}
      <p>Snap the recipe — cookbook page, handwritten card, or screenshot — and AI reads the ingredients into the list below.</p>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => { handleFile(event.target.files?.[0]); event.target.value = ""; }} />
      <button className="cf-add-row" type="button" onClick={() => inputRef.current?.click()} disabled={status === "scanning"}>{status === "scanning" ? "Scanning…" : "📷 Choose recipe photo"}</button>
      {status === "error" && <p className="cf-scan-error" role="alert">{message}</p>}
    </fieldset>
  );
}
