import Link from "next/link";

export function CalcForgedHeader() {
  return (
    <header className="cf-header">
      <div className="cf-shell cf-header-inner">
        <Link href="/" className="cf-brand" aria-label="CalcForged home">
          <span className="cf-mark" aria-hidden="true">+</span>
          <span>CalcForged</span>
        </Link>
        <nav className="cf-nav" aria-label="Main navigation">
          <Link href="/calculators">All calculators</Link>
          <Link href="/#why">Why CalcForged</Link>
        </nav>
        <Link className="cf-header-cta" href="/calculators">Find a calculator <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
  );
}
