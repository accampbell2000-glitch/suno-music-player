"use client";

import { useEffect, useMemo, useState } from "react";
import { calculatorsBySlug } from "@/lib/calculator-definitions";
import type { CalculatorDefinition, CalculatorValues, IngredientRow } from "@/lib/calculator-definitions";

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
  const results = useMemo(() => definition.calculate(values), [definition, values]);

  useEffect(() => {
    const key = `calcforge-session-${definition.slug}`;
    const prior = window.localStorage.getItem(key);
    window.localStorage.setItem(key, "1");
    fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "page_view", calculatorSlug: definition.slug, sessionHash: key, isRepeat: Boolean(prior) }) }).catch(() => undefined);
  }, [definition.slug]);

  useEffect(() => {
    const summary = definition.fields.filter((field) => field.type !== "ingredient-list").map((field) => `${field.key}:${typeof values[field.key] === "number" ? Math.round(Number(values[field.key]) / 5) * 5 : String(values[field.key])}`).join("|");
    fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "calculation_performed", calculatorSlug: definition.slug, inputSummary: summary, sessionHash: `calcforge-session-${definition.slug}` }) }).catch(() => undefined);
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

  const update = (key: string, value: string | number | IngredientRow[]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setNotice("");
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
      <div className="cf-calculator-head"><div><p className="cf-kicker">Live calculator</p><h2>Enter your details</h2></div><span className="cf-live-dot">Updates instantly</span></div>
      <div className="cf-calc-grid">
        <div className="cf-inputs">
          {definition.fields.map((field) => field.type === "ingredient-list" ? <IngredientEditor key={field.key} value={(values[field.key] as IngredientRow[]) ?? []} onChange={(rows) => update(field.key, rows)} /> : <label className="cf-field" key={field.key}><span>{field.label}</span><div className="cf-input-wrap">{field.type === "select" ? <select value={String(values[field.key])} onChange={(event) => update(field.key, event.target.value)}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input type={field.type} min={field.min} max={field.max} step={field.step} value={String(values[field.key])} onChange={(event) => update(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)} />}{field.unit && <em>{field.unit}</em>}</div>{field.help && <small>{field.help}</small>}</label>)}
        </div>
        <div className="cf-results-wrap">
          <div className="cf-results-head"><div><p className="cf-kicker">Your estimate</p><h3>Results</h3></div><span className="cf-estimate-note">Planning estimate</span></div>
          <div className="cf-results">{definition.results.map((result) => <div className="cf-result" key={result.key}><span>{result.label}{result.estimate && <sup>EST.</sup>}</span><strong>{formatValue(results[result.key] ?? "—", result.format)}{result.unit && result.format !== "currency" && <small> {result.unit}</small>}</strong>{result.interpretation && <p>{result.interpretation}</p>}</div>)}</div>
          <div className="cf-result-actions"><button type="button" onClick={copyResults}>{copied ? "Copied" : "Copy results"}</button><button type="button" onClick={() => { fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "print_results", calculatorSlug: definition.slug }) }).catch(() => undefined); window.print(); }}>Print</button><button type="button" onClick={shareUrl}>Share link</button></div>{notice && <p className="cf-action-notice" role="status">{notice}</p>}
          <div className="cf-ad-slot" aria-label="Reserved advertising space"><span>Reserved space</span><small>Ads and partner recommendations may appear here later.</small></div>
        </div>
      </div>
    </div>
  );
}

function IngredientEditor({ value, onChange }: { value: IngredientRow[]; onChange: (value: IngredientRow[]) => void }) {
  return <fieldset className="cf-ingredients"><legend>Ingredients</legend>{value.map((row, index) => <div className="cf-ingredient-row" key={`${index}-${row.ingredient}`}><input aria-label="Ingredient amount" placeholder="1/2" value={row.amount} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, amount: event.target.value } : item))} /><input aria-label="Ingredient unit" placeholder="cup" value={row.unit} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, unit: event.target.value } : item))} /><input aria-label="Ingredient name" placeholder="Ingredient" value={row.ingredient} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, ingredient: event.target.value } : item))} /></div>)}<button className="cf-add-row" type="button" onClick={() => onChange([...value, { ingredient: "", amount: "", unit: "" }])}>+ Add ingredient</button></fieldset>;
}
