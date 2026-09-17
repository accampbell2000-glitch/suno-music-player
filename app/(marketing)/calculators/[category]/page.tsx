import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalculatorCard } from "@/components/calculator-card";
import { calculatorDefinitions, categories, categoryBySlug } from "@/lib/calculator-definitions";

export function generateStaticParams() { return categories.map((category) => ({ category: category.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> { const { category: slug } = await params; const category = categoryBySlug[slug]; return category ? { title: `${category.name} Calculators | CalcForged`, description: `${category.description} Browse CalcForged tools in ${category.name}.` } : {}; }
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) { const { category: slug } = await params; const category = categoryBySlug[slug]; if (!category) notFound(); const items = calculatorDefinitions.filter((definition) => definition.categorySlug === slug); return <section className="cf-page"><div className="cf-shell"><Link href="/calculators" className="cf-back-link">← All calculators</Link><div className="cf-page-intro cf-category-intro"><p className="cf-kicker">Category</p><h1>{category.name}</h1><p>{category.description}</p></div>{items.length ? <div className="cf-tools-grid">{items.map((definition) => <CalculatorCard key={definition.slug} definition={definition} />)}</div> : <div className="cf-empty-category"><span className="cf-empty-number">08</span><div><h2>Coming soon.</h2><p>We’re building useful tools for this category next. Browse another section to find a calculator today.</p></div></div>}</div></section>; }
