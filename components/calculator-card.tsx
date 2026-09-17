import Link from "next/link";
import type { CalculatorDefinition } from "@/lib/calculator-definitions";

export function CalculatorCard({ definition }: { definition: CalculatorDefinition }) {
  return <Link href={`/calculators/${definition.categorySlug}/${definition.slug}`} className="cf-tool-card"><div className="cf-tool-icon" aria-hidden="true">{definition.icon}</div><div><p className="cf-card-category">{definition.category}</p><h3>{definition.name}</h3><p>{definition.description}</p></div><span className="cf-card-arrow" aria-hidden="true">↗</span></Link>;
}
