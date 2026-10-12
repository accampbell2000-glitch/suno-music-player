export function GigDriverMileageGate({ createAccountHref, logInHref }: { createAccountHref: string; logInHref: string }) {
  return (
    <section className="mx-auto my-8 w-full max-w-3xl border border-[var(--line)] bg-[var(--paper-2)] p-6 sm:my-12 sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10 sm:p-9" aria-labelledby="gig-mileage-gate-title">
      <div>
        <p className="cf-kicker">Seven-day shift log</p>
        <h2 id="gig-mileage-gate-title" className="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-4xl">Track your gig miles for free.</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-ink)]">Create a free account to keep the last 7 days of mileage records. No paid plan required.</p>
        <p className="mt-5 max-w-xl border-l-2 border-[var(--ember)] pl-3 text-xs leading-6 text-[var(--muted-ink)]">Start and stop GPS while parked. If GPS is denied or unavailable, enter your start and end odometer readings instead.</p>
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:mt-0 sm:min-w-44">
        <a href={createAccountHref} className="inline-flex min-h-12 items-center justify-center bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--ember)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ember)]">Create free account</a>
        <a href={logInHref} className="inline-flex min-h-12 items-center justify-center border border-[var(--line)] bg-[var(--paper)] px-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ember)] hover:text-[var(--ember)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--ember)]">Log in</a>
      </div>
    </section>
  );
}
