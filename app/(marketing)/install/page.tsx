import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Install CalcForged on Android, iPhone, iPad, or Windows",
  description: "Add CalcForged to your phone's Home Screen or install it as an app in Windows. No app-store download is required.",
};

export default function InstallPage() {
  return (
    <main className="cf-page">
      <div className="cf-shell">
        <div className="cf-breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Install CalcForged</span></div>
        <header className="cf-page-intro">
          <p className="cf-kicker">Take your tools with you</p>
          <h1>CalcForged, <em>one tap away.</em></h1>
          <p>Add CalcForged to your Home Screen or install it in Windows. It opens in its own app-style window and stays up to date from calcforged.com. No separate App Store or Play Store download is needed.</p>
        </header>

        <section aria-label="Install CalcForged by device" className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="border border-[var(--line)] bg-white p-6 md:p-7">
            <p className="cf-kicker">Android phones and tablets</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Install with Chrome</h2>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--muted-ink)]">
              <li>Open <a className="font-semibold text-[var(--ember)] underline" href="https://calcforged.com/">calcforged.com</a> in Chrome.</li>
              <li>Tap the three-dot menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
              <li>Confirm the install. Open CalcForged from the new icon.</li>
            </ol>
            <a className="mt-6 inline-block text-sm font-semibold text-[var(--ember)] underline" href="https://web.dev/learn/pwa/installation" target="_blank" rel="noopener noreferrer">Android install help ↗</a>
          </article>

          <article className="border border-[var(--line)] bg-white p-6 md:p-7">
            <p className="cf-kicker">iPhone and iPad</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Add from Safari</h2>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--muted-ink)]">
              <li>Open <a className="font-semibold text-[var(--ember)] underline" href="https://calcforged.com/">calcforged.com</a> in Safari.</li>
              <li>Tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>. Scroll down if needed.</li>
              <li>If shown, turn on <strong>Open as Web App</strong>, then tap <strong>Add</strong>.</li>
            </ol>
            <a className="mt-6 inline-block text-sm font-semibold text-[var(--ember)] underline" href="https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios" target="_blank" rel="noopener noreferrer">Apple's iPhone instructions ↗</a>
          </article>

          <article className="border border-[var(--line)] bg-white p-6 md:p-7">
            <p className="cf-kicker">Windows computers</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Install with Edge</h2>
            <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--muted-ink)]">
              <li>Open <a className="font-semibold text-[var(--ember)] underline" href="https://calcforged.com/">calcforged.com</a> in Microsoft Edge.</li>
              <li>Open the three-dot menu, choose <strong>Apps</strong>, then <strong>Install this site as an app</strong>.</li>
              <li>Choose <strong>Install</strong>. You can then pin CalcForged to Start or your taskbar.</li>
            </ol>
            <p className="mt-4 text-xs leading-5 text-[var(--muted-ink)]">In Chrome, use its <strong>Install</strong> option if it appears in the address bar or browser menu.</p>
            <a className="mt-4 inline-block text-sm font-semibold text-[var(--ember)] underline" href="https://support.microsoft.com/en-us/edge/install-manage-or-uninstall-apps-in-microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge install help ↗</a>
          </article>
        </section>

        <section className="mt-8 border-l-4 border-[var(--ember)] bg-white p-6 md:p-8" aria-label="About the CalcForged app">
          <p className="cf-kicker">A note about the app</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Same CalcForged, easier to reach.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-ink)]">This is the CalcForged website installed as an app-style shortcut, not a separate store download. Your account and saved fuel log work the same way. An internet connection is needed to sign in and load saved entries.</p>
        </section>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="cf-button cf-button-dark">Back to CalcForged <span aria-hidden="true">↗</span></Link>
          <Link href="/calculators" className="cf-text-link">Browse calculators <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </main>
  );
}
