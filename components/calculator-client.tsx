"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calculatorsBySlug } from "@/lib/calculator-definitions";
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
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState<boolean | null>(null);
  const results = useMemo(() => definition.calculate(values), [definition, values]);

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
      fetch("https://api.frankfurter.app/latest?base=USD")
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
    setValues((current) => ({ ...current, [key]: value }));
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
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard?.writeText(url);
    fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "share_results", calculatorSlug: definition.slug }) }).catch(() => undefined);
    setNotice("Share link copied");
  };

  const copyResults = () => {
    const text = `${definition.name}\n${definition.results.map((r) => `${r.label}: ${formatValue(results[r.key] ?? "—", r.format)}${r.unit && r.format !== "currency" ? ` ${r.unit}` : ""}`).join("\n")}`;
    navigator.clipboard?.writeText(text);
    fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "copy_results", calculatorSlug: definition.slug }) }).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="cf-calculator" id="calculator">
      <div className="cf-calculator-head"><div><p className="cf-kicker">Live calculator</p><h2>Enter your details</h2></div><div className="cf-head-actions"><button type="button" className={`cf-save-star${saved ? " is-saved" : ""}`} onClick={toggleSaved} disabled={saved === null} aria-label={saved ? "Remove from my toolkit" : "Save to my toolkit"}><span aria-hidden="true">{saved ? "★" : "☆"}</span>{saved ? "Saved" : "Save"}</button><span className="cf-live-dot">Updates instantly</span></div></div>
      <div className="cf-calc-grid">
        <div className="cf-inputs">
          {definition.photoScan && <RecipePhotoScan onScan={applyScan} />}
          {definition.fields.map((field) => field.type === "ingredient-list" ? <IngredientEditor key={field.key} value={(values[field.key] as IngredientRow[]) ?? []} onChange={(rows) => update(field.key, rows)} /> : <label className="cf-field" key={field.key}><span>{field.label}</span><div className="cf-input-wrap">{field.type === "select" ? <select value={String(values[field.key])} onChange={(event) => update(field.key, event.target.value)}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={field.type} min={field.min} max={field.max} step={field.step} value={String(values[field.key])} onChange={(event) => update(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)} />}{field.unit && <em>{field.unit}</em>}</div>{field.help && <small>{field.help}</small>}</label>)}
        </div>
        <div className="cf-results-wrap">
          <div className="cf-results-head"><div><p className="cf-kicker">Your estimate</p><h3>Results</h3></div><span className="cf-estimate-note">Planning estimate</span></div>
          <div className="cf-results">{definition.results.map((result) => { const wide = result.format === "text" && typeof results[result.key] === "string" && (results[result.key] as string).includes("\n"); return <div className={`cf-result${wide ? " cf-result-wide" : ""}`} key={result.key}><span>{result.label}{result.estimate && <sup>EST.</sup>}</span><ResultBody result={result} value={results[result.key]} />{result.interpretation && <p>{result.interpretation}</p>}</div>; })}</div>
          <div className="cf-result-actions"><button type="button" onClick={copyResults}>{copied ? "Copied" : "Copy results"}</button><button type="button" onClick={() => { fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "print_results", calculatorSlug: definition.slug }) }).catch(() => undefined); window.print(); }}>Print</button><button type="button" onClick={shareUrl}>Share link</button></div>{notice && <p className="cf-action-notice" role="status">{notice}</p>}
          <PartnerPick slug={definition.slug} />
        </div>
      </div>
    </div>
  );
}

function ResultBody({ result, value }: { result: ResultDefinition; value: string | number | undefined }) {
  if (result.format === "text" && typeof value === "string" && value.includes("\n")) {
    return <ul className="cf-result-lines">{value.split("\n").filter((line) => line.trim().length > 0).map((line) => <li key={line}>{line}</li>)}</ul>;
  }
  return <strong className={result.format === "text" ? "cf-result-text" : undefined}>{formatValue(value ?? "—", result.format)}{result.unit && result.format !== "currency" && <small> {result.unit}</small>}</strong>;
}

function IngredientEditor({ value, onChange }: { value: IngredientRow[]; onChange: (value: IngredientRow[]) => void }) {
  return <fieldset className="cf-ingredients"><legend>Ingredients</legend>{value.map((row, index) => <div className="cf-ingredient-row" key={`${index}-${row.ingredient}`}><input aria-label="Ingredient amount" placeholder="1/2" value={row.amount} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, amount: event.target.value } : item))} /><input aria-label="Ingredient unit" placeholder="cup" value={row.unit} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, unit: event.target.value } : item))} /><input aria-label="Ingredient name" placeholder="Ingredient" value={row.ingredient} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, ingredient: event.target.value } : item))} /></div>)}<button className="cf-add-row" type="button" onClick={() => onChange([...value, { ingredient: "", amount: "", unit: "" }])}>+ Add ingredient</button></fieldset>;
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
      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={(event) => { handleFile(event.target.files?.[0]); event.target.value = ""; }} />
      <button className="cf-add-row" type="button" onClick={() => inputRef.current?.click()} disabled={status === "scanning"}>{status === "scanning" ? "Scanning…" : "📷 Choose recipe photo"}</button>
      {status === "error" && <p className="cf-scan-error" role="alert">{message}</p>}
    </fieldset>
  );
}
