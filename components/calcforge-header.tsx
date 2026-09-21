import Link from "next/link";
import { getSession, signInUrl, signOutUrl } from "@/lib/session";

export async function CalcForgedHeader() {
  const session = await getSession();
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
        <Link className="cf-header-cta hide-sm" href="/calculator-requests">Request a calculator <span aria-hidden="true">↗</span></Link>
        <Link className="cf-header-cta hide-sm" href="/calculators">Find a calculator <span aria-hidden="true">↗</span></Link>
        {session ? (
          <span className="cf-header-auth">
            <Link href="/dashboard" className="cf-auth-strong">My area</Link>
            <a href={signOutUrl("/")} className="cf-auth-quiet">Sign out</a>
          </span>
        ) : (
          <span className="cf-header-auth">
            <a href={await signInUrl("/dashboard")} className="cf-auth-quiet">Log in</a>
            <a href={await signInUrl("/dashboard")} className="cf-auth-strong">Create account</a>
          </span>
        )}
      </div>
    </header>
  );
}
