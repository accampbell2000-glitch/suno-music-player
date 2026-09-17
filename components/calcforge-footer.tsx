import Link from "next/link";
import { categories } from "@/lib/calculator-definitions";

export function CalcForgedFooter() {
  return (
    <footer className="cf-footer">
      <div className="cf-shell cf-footer-grid">
        <div>
          <Link href="/" className="cf-brand cf-brand-footer"><span className="cf-mark" aria-hidden="true">+</span><span>CalcForged</span></Link>
          <p className="cf-footer-note">Practical calculators. Straight answers.</p>
        </div>
        <div className="cf-footer-links">
          <div><p className="cf-footer-label">Browse</p><Link href="/calculators">All calculators</Link><Link href="/admin">Admin dashboard</Link></div>
          <div><p className="cf-footer-label">Categories</p>{categories.slice(0, 4).map((category) => <Link key={category.slug} href={`/calculators/${category.slug}`}>{category.name}</Link>)}</div>
          <div><p className="cf-footer-label">More tools</p>{categories.slice(4).map((category) => <Link key={category.slug} href={`/calculators/${category.slug}`}>{category.name}</Link>)}</div>
        </div>
      </div>
      <div className="cf-shell cf-footer-bottom"><span>© {new Date().getFullYear()} CalcForged</span><span>No sign-up. Free to use. Formulas explained.</span></div>
    </footer>
  );
}
