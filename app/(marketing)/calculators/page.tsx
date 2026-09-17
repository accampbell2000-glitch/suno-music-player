import type { Metadata } from "next";
import { CalculatorCard } from "@/components/calculator-card";
import { calculatorDefinitions, categories } from "@/lib/calculator-definitions";

export const metadata: Metadata = { title: "All Calculators | CalcForge", description: "Browse every practical CalcForge calculator by category." };

export default function CalculatorsIndex() {
  return <section className="cf-page"><div className="cf-shell"><div className="cf-page-intro"><p className="cf-kicker">The full library</p><h1>All calculators</h1><p>Start with a practical answer. Browse by category, or jump straight into one of the tools below.</p></div>{categories.map((category) => { const items = calculatorDefinitions.filter((definition) => definition.categorySlug === category.slug); return <section className="cf-index-group" key={category.slug} id={category.slug}><div className="cf-index-heading"><div><p className="cf-kicker">{category.name}</p><h2>{category.description}</h2></div><span>{items.length ? `${items.length} live` : "Coming soon"}</span></div>{items.length ? <div className="cf-tools-grid">{items.map((definition) => <CalculatorCard key={definition.slug} definition={definition} />)}</div> : <div className="cf-coming"><span>+ </span>New tools are being shaped for this category.</div>}</section> })}</div></section>;
}
