"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./fuel-mileage.module.css";

type FuelEntry = {
  id: number;
  odometerMiles: number;
  gallons: number;
  totalPaid: number;
  fullTank: boolean;
  stationName: string | null;
  fuelType: string | null;
  createdAt: string;
  intervalMpg: number | null;
  intervalMiles: number | null;
};

type FuelHistory = {
  ok: boolean;
  entries: FuelEntry[];
  latestOdometer: number | null;
  lastFullMpg: number | null;
  averageMpg: number | null;
  totalSpentLastFive: number;
  latestEntryMpg: number | null;
  latestEntryMiles: number | null;
  hasFullTankBaseline: boolean;
};

type ManualFields = { start: string; end: string; gallons: string; totalPaid: string };
type LogFields = { odometer: string; gallons: string; totalPaid: string; fullTank: boolean; stationName: string; fuelType: string };
type LoadState = "loading" | "signed-in" | "guest" | "error";

const numberFrom = (value: string) => value.trim() ? Number(value) : Number.NaN;
const formatNumber = (value: number, digits = 1) => new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const FUEL_TYPE_LABELS: Record<string, string> = { regular: "Regular", midgrade: "Midgrade", premium: "Premium", diesel: "Diesel", e85: "E85", other: "Other" };
const fuelTypeLabel = (value: string | null) => FUEL_TYPE_LABELS[value ?? ""] ?? "";
const formatDate = (value: string) => {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? "Recent fill-up" : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
};

export function FuelMileageCalculator() {
  const [view, setView] = useState<"manual" | "log">("manual");
  const [manual, setManual] = useState<ManualFields>({ start: "", end: "", gallons: "", totalPaid: "" });
  const [log, setLog] = useState<LogFields>({ odometer: "", gallons: "", totalPaid: "", fullTank: true, stationName: "", fuelType: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [history, setHistory] = useState<FuelHistory | null>(null);
  const [historyMessage, setHistoryMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedToToolkit, setSavedToToolkit] = useState<boolean | null>(null);
  const [notice, setNotice] = useState("");
  const [logError, setLogError] = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [historyActionError, setHistoryActionError] = useState("");
  const [historyActionBusy, setHistoryActionBusy] = useState(false);
  const [tripMiles, setTripMiles] = useState("");
  const [tripPrice, setTripPrice] = useState("");
  const [tripPriceTouched, setTripPriceTouched] = useState(false);

  const manualResult = useMemo(() => {
    const start = numberFrom(manual.start);
    const end = numberFrom(manual.end);
    const gallons = numberFrom(manual.gallons);
    const distance = end - start;
    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(gallons) || distance <= 0 || gallons <= 0) return null;
    const paid = manual.totalPaid.trim() ? Number(manual.totalPaid) : null;
    const validPaid = paid !== null && Number.isFinite(paid) && paid >= 0 ? paid : null;
    return {
      distance,
      mpg: distance / gallons,
      totalPaid: validPaid,
      pricePerGallon: validPaid === null ? null : validPaid / gallons,
      costPerMile: validPaid === null ? null : validPaid / distance,
    };
  }, [manual]);

  const comparableRecentEntries = useMemo(() => {
    const entries = history?.entries ?? [];
    const latestFuelType = entries[0]?.fuelType ?? null;
    return latestFuelType ? entries.filter((entry) => entry.fuelType === latestFuelType) : entries;
  }, [history]);

  const recentAveragePrice = useMemo(() => {
    const gallons = comparableRecentEntries.reduce((total, entry) => total + entry.gallons, 0);
    const paid = comparableRecentEntries.reduce((total, entry) => total + entry.totalPaid, 0);
    return gallons > 0 ? paid / gallons : null;
  }, [comparableRecentEntries]);

  const lowestComparableStop = useMemo(() => {
    const latestFuelType = history?.entries[0]?.fuelType ?? null;
    if (!latestFuelType) return null;
    const comparable = history?.entries.filter((entry) => entry.fuelType === latestFuelType) ?? [];
    if (comparable.length < 2) return null;
    const entry = comparable.reduce((lowest, current) => current.totalPaid / current.gallons < lowest.totalPaid / lowest.gallons ? current : lowest);
    return { entry, count: comparable.length, pricePerGallon: entry.totalPaid / entry.gallons, fuelType: latestFuelType };
  }, [history]);

  const tripMpg = history?.averageMpg ?? manualResult?.mpg ?? null;
  const tripDistanceValue = numberFrom(tripMiles);
  const tripPriceValue = numberFrom(tripPrice);
  const tripEstimate = tripMpg && tripMpg > 0 && tripDistanceValue > 0 && tripPriceValue > 0
    ? { gallons: tripDistanceValue / tripMpg, cost: (tripDistanceValue / tripMpg) * tripPriceValue }
    : null;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventType: "page_view", calculatorSlug: "fuel-mileage" }) }).catch(() => undefined);
    fetch("/api/fuel-history", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          if (!cancelled) setLoadState("guest");
          return null;
        }
        if (!response.ok) throw new Error("Could not load your fuel log.");
        return await response.json() as FuelHistory;
      })
      .then((data) => {
        if (cancelled || !data?.ok) return;
        setHistory(data);
        setLoadState("signed-in");
        if (data.latestOdometer !== null) setManual((current) => current.start.trim() ? current : { ...current, start: String(data.latestOdometer) });
      })
      .catch(() => { if (!cancelled) { setLoadState("error"); setHistoryMessage("Your saved fuel log could not load. Manual calculations still work."); } });
    fetch("/api/toolkit")
      .then(async (response) => response.ok ? await response.json() as { ok?: boolean; slugs?: string[] } : null)
      .then((data) => { if (!cancelled && data?.ok) setSavedToToolkit(Array.isArray(data.slugs) && data.slugs.includes("fuel-mileage")); else if (!cancelled && data === null) setSavedToToolkit(false); })
      .catch(() => { if (!cancelled) setSavedToToolkit(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (tripPriceTouched) return;
    const suggestedPrice = recentAveragePrice ?? manualResult?.pricePerGallon ?? null;
    setTripPrice(suggestedPrice && suggestedPrice > 0 ? suggestedPrice.toFixed(2) : "");
  }, [recentAveragePrice, manualResult?.pricePerGallon, tripPriceTouched]);

  async function toggleSaved() {
    if (savedToToolkit === null) return;
    const next = !savedToToolkit;
    setSavedToToolkit(next);
    const response = await fetch("/api/toolkit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: "fuel-mileage", action: next ? "add" : "remove" }) });
    if (response.status === 401) {
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (!response.ok) setSavedToToolkit(!next);
  }

  async function saveFillUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLogError("");
    setNotice("");
    const odometerMiles = numberFrom(log.odometer);
    const gallons = numberFrom(log.gallons);
    const totalPaid = numberFrom(log.totalPaid);
    if (!Number.isFinite(odometerMiles) || odometerMiles <= 0 || !Number.isFinite(gallons) || gallons <= 0 || !Number.isFinite(totalPaid) || totalPaid <= 0) {
      setLogError("Enter a valid odometer reading, gallons added, and total paid.");
      return;
    }
    const wasEditing = editingId !== null;
    const payload = { id: editingId, odometerMiles, gallons, totalPaid, fullTank: log.fullTank, stationName: log.stationName, fuelType: log.fuelType };
    setSaving(true);
    try {
      const response = await fetch("/api/fuel-history", { method: wasEditing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as FuelHistory & { error?: string };
      if (response.status === 401) {
        window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (!response.ok || !data.ok) throw new Error(data.error || (wasEditing ? "Could not update this fill-up." : "Could not save this fill-up."));
      setHistory(data);
      setLoadState("signed-in");
      setManual((current) => ({ ...current, start: String(data.latestOdometer ?? odometerMiles) }));
      setEditingId(null);
      setLog({ odometer: "", gallons: "", totalPaid: "", fullTank: true, stationName: "", fuelType: "" });
      setNotice(wasEditing
        ? "Fill-up updated. Your MPG and spending summaries were recalculated."
        : data.latestEntryMpg !== null
          ? `Saved. This full-to-full interval measured ${formatNumber(data.latestEntryMpg, 1)} MPG.`
          : log.fullTank
            ? "Saved as a full-tank reading. Your next full tank will complete the MPG interval."
            : data.hasFullTankBaseline
              ? "Partial fill saved. Its gallons will count toward the next full-tank MPG reading."
              : "Partial fill saved. Log a full tank to establish your MPG baseline; this earlier partial cannot set one.");
      setView("log");
    } catch (error) {
      setLogError(error instanceof Error ? error.message : (wasEditing ? "Could not update this fill-up." : "Could not save this fill-up."));
    } finally {
      setSaving(false);
    }
  }

  function editSavedFillUp(entry: FuelEntry) {
    setEditingId(entry.id);
    setLog({
      odometer: String(entry.odometerMiles),
      gallons: String(entry.gallons),
      totalPaid: String(entry.totalPaid),
      fullTank: entry.fullTank,
      stationName: entry.stationName ?? "",
      fuelType: entry.fuelType ?? "",
    });
    setLogError("");
    setNotice("");
    setPendingDeleteId(null);
    setResetConfirm(false);
    setHistoryActionError("");
    setView("log");
  }

  function cancelEdit() {
    setEditingId(null);
    setLog({ odometer: "", gallons: "", totalPaid: "", fullTank: true, stationName: "", fuelType: "" });
    setLogError("");
    setNotice("");
  }

  async function removeSavedFillUp(id: number) {
    setHistoryActionError("");
    setHistoryActionBusy(true);
    try {
      const response = await fetch("/api/fuel-history", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
      const data = await response.json() as FuelHistory & { error?: string };
      if (response.status === 401) {
        window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not remove this fill-up.");
      setHistory(data);
      setManual((current) => ({ ...current, start: data.latestOdometer === null ? "" : String(data.latestOdometer) }));
      if (editingId === id) {
        setEditingId(null);
        setLog({ odometer: "", gallons: "", totalPaid: "", fullTank: true, stationName: "", fuelType: "" });
      }
      setPendingDeleteId(null);
      setNotice("Fill-up removed. Your MPG and spending summaries were recalculated.");
    } catch (error) {
      setHistoryActionError(error instanceof Error ? error.message : "Could not remove this fill-up.");
    } finally {
      setHistoryActionBusy(false);
    }
  }

  async function resetSavedFuelData() {
    setHistoryActionError("");
    setHistoryActionBusy(true);
    try {
      const response = await fetch("/api/fuel-history", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "reset" }) });
      const data = await response.json() as FuelHistory & { error?: string };
      if (response.status === 401) {
        window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not clear your fuel log.");
      setHistory(data);
      setManual({ start: "", end: "", gallons: "", totalPaid: "" });
      setLog({ odometer: "", gallons: "", totalPaid: "", fullTank: true, stationName: "", fuelType: "" });
      setEditingId(null);
      setTripMiles("");
      setTripPrice("");
      setTripPriceTouched(false);
      setPendingDeleteId(null);
      setResetConfirm(false);
      setView("log");
      setNotice("All saved fuel entries cleared. Log a full tank to start a new tracking cycle.");
    } catch (error) {
      setHistoryActionError(error instanceof Error ? error.message : "Could not clear your fuel log.");
    } finally {
      setHistoryActionBusy(false);
    }
  }

  async function copyManualResult() {
    if (!manualResult) return;
    const lines = [
      "CalcForged Fuel Mileage Calculator",
      `Distance: ${formatNumber(manualResult.distance, 1)} miles`,
      `Fuel economy: ${formatNumber(manualResult.mpg, 1)} MPG`,
      manualResult.totalPaid === null ? "Fuel cost: not entered" : `Fuel cost: ${formatCurrency(manualResult.totalPaid)}`,
      manualResult.costPerMile === null ? "Cost per mile: not available" : `Cost per mile: ${formatCurrency(manualResult.costPerMile)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setNotice("Calculation copied.");
    } catch {
      setNotice("Your browser could not copy this result.");
    }
  }

  const isSignedIn = loadState === "signed-in";
  const loginUrl = "/login?return_to=%2Fcalculators%2Fautomotive%2Ffuel-mileage";

  return (
    <section className={`${styles.calculator} fuel-print-container`} id="calculator" aria-label="Fuel mileage calculator">
      <section id="fuel-print-sheet" className={styles.printSheet}>
        <div className={styles.printMasthead}><strong>CALCFORGED</strong><span>FUEL MILEAGE / MANUAL INTERVAL</span></div>
        <h1>Fuel mileage report</h1>
        <p className={styles.printSubhead}>Odometer readings and pump cost used for this calculation.</p>
        <div className={styles.printHero}><span>FUEL ECONOMY</span><strong>{manualResult ? `${formatNumber(manualResult.mpg, 1)} MPG` : "No calculation yet"}</strong></div>
        <div className={styles.printGrid}>
          <div><span>Starting odometer</span><strong>{manual.start.trim() ? `${formatNumber(Number(manual.start), 1)} mi` : "Not entered"}</strong></div>
          <div><span>Ending odometer</span><strong>{manual.end.trim() ? `${formatNumber(Number(manual.end), 1)} mi` : "Not entered"}</strong></div>
          <div><span>Distance</span><strong>{manualResult ? `${formatNumber(manualResult.distance, 1)} mi` : "Not calculated"}</strong></div>
          <div><span>Gallons used</span><strong>{manual.gallons.trim() ? `${formatNumber(Number(manual.gallons), 2)} gal` : "Not entered"}</strong></div>
          <div><span>Total paid</span><strong>{manualResult?.totalPaid === null || !manualResult ? "Not entered" : formatCurrency(manualResult.totalPaid)}</strong></div>
          <div><span>Cost per mile</span><strong>{manualResult?.costPerMile === null || !manualResult ? "Not calculated" : `${formatCurrency(manualResult.costPerMile)} / mi`}</strong></div>
          <div><span>Average pump price</span><strong>{manualResult?.pricePerGallon === null || !manualResult ? "Not calculated" : `${formatCurrency(manualResult.pricePerGallon)} / gal`}</strong></div>
        </div>
        <p className={styles.printFootnote}>Distance is the ending reading minus the starting reading. MPG is distance divided by gallons used. For the most reliable per-tank result, use a consistent full-to-full method and include partial-fill gallons in the interval.</p>
      </section>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>CALCFORGED / AUTOMOTIVE</p>
          <h2>Fuel mileage, without the guesswork.</h2>
          <p className={styles.headerCopy}>Calculate one interval, or keep a small, useful log of what the last five stops cost.</p>
        </div>
        <button type="button" className={styles.saveTool} onClick={toggleSaved} disabled={savedToToolkit === null} aria-label={savedToToolkit ? "Remove Fuel Mileage Calculator from my toolkit" : "Save Fuel Mileage Calculator to my toolkit"}>
          <span aria-hidden="true">{savedToToolkit ? "★" : "☆"}</span>{savedToToolkit ? "Saved" : "Save tool"}
        </button>
      </header>

      <div className={styles.instrument}>
        <div className={styles.instrumentMeta}><span>FUEL / ODOMETER</span><span>US MILES · GALLONS</span></div>
        <div className={styles.instrumentReadouts}>
          <div className={styles.primaryReadout}>
            <span>LAST FULL-TO-FULL MPG</span>
            <strong>{history?.lastFullMpg ? formatNumber(history.lastFullMpg, 1) : "--.-"}</strong>
            <em>MPG</em>
          </div>
          <div className={styles.instrumentStats}>
            <div><span>RECENT AVERAGE</span><strong>{history?.averageMpg ? `${formatNumber(history.averageMpg, 1)} MPG` : "Waiting for a full-tank interval"}</strong></div>
            <div><span>LAST ODOMETER</span><strong>{history?.latestOdometer !== null && history?.latestOdometer !== undefined ? `${formatNumber(history.latestOdometer, 1)} mi` : isSignedIn ? "No reading saved" : "Manual mode"}</strong></div>
          </div>
        </div>
        <div className={styles.instrumentFoot}><span>Full tank to full tank gives the cleanest reading.</span><span aria-hidden="true">CF / 01</span></div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Fuel calculation mode">
        <button type="button" role="tab" aria-selected={view === "manual"} className={view === "manual" ? styles.activeTab : ""} onClick={() => setView("manual")}>Manual calculation</button>
        {isSignedIn && <button type="button" role="tab" aria-selected={view === "log"} className={view === "log" ? styles.activeTab : ""} onClick={() => setView("log")}>Saved fill-ups</button>}
        <span className={styles.tabNote}>{isSignedIn ? "Your last five fill-ups are saved to your account." : loadState === "loading" ? "Checking account access…" : "Manual mode is available without an account."}</span>
      </div>

      {historyMessage && <p className={styles.inlineNotice} role="status">{historyMessage}</p>}

      {view === "manual" && (
        <div className={styles.mainGrid}>
          <form className={styles.formPanel} onSubmit={(event) => event.preventDefault()}>
            <div className={styles.sectionHeading}><p>ONE INTERVAL</p><h3>Enter the readings</h3><span>Use the same odometer and fuel units each time.</span></div>
            <label className={styles.field}><span>Starting odometer</span><div className={styles.inputWrap}><input type="number" min="0" max="1000000" step="0.1" value={manual.start} onChange={(event) => setManual((current) => ({ ...current, start: event.target.value }))} placeholder="For example, 42,180" /><em>mi</em></div><small>Signed-in users can reuse their latest saved reading.</small></label>
            <label className={styles.field}><span>Ending odometer</span><div className={styles.inputWrap}><input type="number" min="0" max="1000000" step="0.1" value={manual.end} onChange={(event) => setManual((current) => ({ ...current, end: event.target.value }))} placeholder="For example, 42,515" /><em>mi</em></div></label>
            <label className={styles.field}><span>Gallons used</span><div className={styles.inputWrap}><input type="number" min="0.01" max="500" step="0.001" value={manual.gallons} onChange={(event) => setManual((current) => ({ ...current, gallons: event.target.value }))} placeholder="Total for this interval" /><em>gal</em></div><small>For full-to-full tracking, include gallons from any partial fills between the readings.</small></label>
            <label className={styles.field}><span>Total paid <small>(optional)</small></span><div className={styles.inputWrap}><em className={styles.prefix}>$</em><input type="number" min="0" max="5000" step="0.01" value={manual.totalPaid} onChange={(event) => setManual((current) => ({ ...current, totalPaid: event.target.value }))} placeholder="Amount at the pump" /></div></label>
            <p className={styles.formHint}>MPG is distance divided by gallons. Cost per mile and price per gallon appear when you enter what you paid.</p>
          </form>

          <div className={styles.resultPanel} aria-live="polite">
            <div className={styles.resultTop}><div><p>YOUR RESULT</p><h3>Interval summary</h3></div><span>LIVE</span></div>
            {manualResult ? (
              <>
                <div className={styles.resultHero}><strong>{formatNumber(manualResult.mpg, 1)}</strong><span>miles per gallon</span></div>
                <div className={styles.resultMetrics}>
                  <div><span>Distance</span><strong>{formatNumber(manualResult.distance, 1)} mi</strong></div>
                  <div><span>Total fuel</span><strong>{formatNumber(numberFrom(manual.gallons), 2)} gal</strong></div>
                  <div><span>Fuel cost</span><strong>{manualResult.totalPaid === null ? "Add pump total" : formatCurrency(manualResult.totalPaid)}</strong></div>
                  <div><span>Cost per mile</span><strong>{manualResult.costPerMile === null ? "Add pump total" : `${formatCurrency(manualResult.costPerMile)} / mi`}</strong></div>
                  <div><span>Price per gallon</span><strong>{manualResult.pricePerGallon === null ? "Add pump total" : `${formatCurrency(manualResult.pricePerGallon)} / gal`}</strong></div>
                </div>
                <div className={styles.resultActions}><button type="button" onClick={copyManualResult}>Copy result</button><button type="button" onClick={() => window.print()}>Print</button></div>
              </>
            ) : (
              <div className={styles.emptyResult}><span aria-hidden="true">MPG</span><p>Enter a starting reading, ending reading, and gallons used to see your fuel economy.</p></div>
            )}
            {notice && view === "manual" && <p className={styles.inlineNotice} role="status">{notice}</p>}
          </div>
        </div>
      )}

      {view === "log" && isSignedIn && (
        <div className={styles.logGrid}>
          <form className={styles.formPanel} onSubmit={saveFillUp}>
            <div className={styles.sectionHeading}><p>ACCOUNT FUEL LOG</p><h3>{editingId === null ? "Save a fill-up" : "Edit fill-up"}</h3><span>{editingId === null ? "One vehicle for now. The latest five stops appear in your log." : "Update the receipt details or correct the odometer reading."}</span></div>
            <label className={styles.field}><span>Odometer at the pump</span><div className={styles.inputWrap}><input type="number" min="0" max="1000000" step="0.1" required value={log.odometer} onChange={(event) => setLog((current) => ({ ...current, odometer: event.target.value }))} placeholder="Current reading" /><em>mi</em></div></label>
            <label className={styles.field}><span>Gallons added</span><div className={styles.inputWrap}><input type="number" min="0.01" max="500" step="0.001" required value={log.gallons} onChange={(event) => setLog((current) => ({ ...current, gallons: event.target.value }))} placeholder="Receipt quantity" /><em>gal</em></div></label>
            <label className={styles.field}><span>Total paid</span><div className={styles.inputWrap}><em className={styles.prefix}>$</em><input type="number" min="0.01" max="5000" step="0.01" required value={log.totalPaid} onChange={(event) => setLog((current) => ({ ...current, totalPaid: event.target.value }))} placeholder="Receipt total" /></div></label>
            <label className={styles.field}><span>Station name <small>(optional)</small></span><div className={styles.inputWrap}><input type="text" maxLength={80} value={log.stationName} onChange={(event) => setLog((current) => ({ ...current, stationName: event.target.value }))} placeholder="For example, Costco or Shell" /></div></label>
            <label className={styles.field}><span>Fuel type <small>(optional)</small></span><div className={styles.inputWrap}><select value={log.fuelType} onChange={(event) => setLog((current) => ({ ...current, fuelType: event.target.value }))}><option value="">Not specified</option><option value="regular">Regular</option><option value="midgrade">Midgrade</option><option value="premium">Premium</option><option value="diesel">Diesel</option><option value="e85">E85</option><option value="other">Other</option></select></div></label>
            <label className={styles.fullTankChoice}><input type="checkbox" checked={log.fullTank} onChange={(event) => setLog((current) => ({ ...current, fullTank: event.target.checked }))} /><span><strong>Tank is full</strong><small>Mark partial fills off. After your first full tank, their gallons count toward the next full-to-full MPG result.</small></span></label>
            {logError && <p className={styles.error} role="alert">{logError}</p>}
            {notice && view === "log" && <p className={styles.inlineNotice} role="status">{notice}</p>}
            <div className={styles.formActions}><button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? "Saving…" : editingId === null ? "Save fill-up" : "Save changes"}</button>{editingId !== null && <button className={styles.softAction} type="button" onClick={cancelEdit} disabled={saving}>Cancel edit</button>}</div>
          </form>

          <div className={styles.logPanel}>
            <div className={styles.logSummary}><div><span>SPEND / LAST FIVE</span><strong>{history?.entries.length ? formatCurrency(history.totalSpentLastFive) : "No fuel stops yet"}</strong></div><div><span>LAST FULL-TO-FULL</span><strong>{history?.lastFullMpg ? `${formatNumber(history.lastFullMpg, 1)} MPG` : "Not measured yet"}</strong></div></div>
            {lowestComparableStop && <div className={styles.lowestPrice}><div><span>LOWEST {fuelTypeLabel(lowestComparableStop.fuelType).toUpperCase()} PRICE</span><strong>{formatCurrency(lowestComparableStop.pricePerGallon)} / gal</strong></div><small>{lowestComparableStop.entry.stationName ? `${lowestComparableStop.entry.stationName} · ` : ""}lowest of {lowestComparableStop.count} matching recent receipts</small></div>}
            <div className={styles.ledgerHeading}>
              <div><p>FILL-UP RECORD</p><h3>Recent stops</h3></div>
              <div className={styles.resetControls}><span>{history?.entries.length ?? 0} of 5</span><button type="button" className={styles.resetButton} onClick={() => { setResetConfirm(true); setPendingDeleteId(null); setHistoryActionError(""); }} disabled={!history?.entries.length || historyActionBusy} aria-expanded={resetConfirm}>Reset data</button></div>
            </div>
            {resetConfirm && <div className={styles.resetConfirm} role="group" aria-label="Confirm fuel log reset">
              <div><strong>Clear all saved fuel entries?</strong><p>This clears this fuel log and its MPG baseline. It cannot be undone.</p></div>
              <div className={styles.resetActions}><button type="button" className={styles.softAction} onClick={() => setResetConfirm(false)} disabled={historyActionBusy}>Cancel</button><button type="button" className={styles.dangerAction} onClick={() => void resetSavedFuelData()} disabled={historyActionBusy}>{historyActionBusy ? "Clearing…" : "Clear all"}</button></div>
            </div>}
            {historyActionError && <p className={styles.error} role="alert">{historyActionError}</p>}
            {history?.entries.length ? (
              <ul className={styles.ledgerList}>
                {history.entries.map((entry) => <li key={entry.id}>
                  <div className={styles.ledgerPlace}><strong>{formatNumber(entry.odometerMiles, 1)} mi</strong><small>{[entry.stationName, fuelTypeLabel(entry.fuelType), entry.fullTank ? "Full tank" : "Partial fill", formatDate(entry.createdAt)].filter(Boolean).join(" · ")}</small></div>
                  <div className={styles.ledgerAmount}><span>{formatNumber(entry.gallons, 2)} gal · {formatCurrency(entry.totalPaid / entry.gallons)}/gal</span><strong>{formatCurrency(entry.totalPaid)}</strong></div>
                  <div className={styles.ledgerMpg}>{entry.intervalMpg !== null ? <><strong>{formatNumber(entry.intervalMpg, 1)} MPG</strong><small>{formatNumber(entry.intervalMiles ?? 0, 1)} mi interval</small></> : <small>{entry.fullTank ? "Starting full tank" : "Counts toward next full tank"}</small>}</div>
                  {pendingDeleteId === entry.id ? <div className={styles.entryConfirm} role="group" aria-label={`Confirm delete for fill-up at ${formatNumber(entry.odometerMiles, 1)} miles`}><span>Remove this fill-up?</span><button type="button" className={styles.softAction} onClick={() => setPendingDeleteId(null)} disabled={historyActionBusy}>Cancel</button><button type="button" className={styles.dangerAction} onClick={() => void removeSavedFillUp(entry.id)} disabled={historyActionBusy}>{historyActionBusy ? "Removing…" : "Delete entry"}</button></div> : <div className={styles.entryActions}><button type="button" className={styles.editButton} onClick={() => editSavedFillUp(entry)} disabled={historyActionBusy || saving} title="Edit this fill-up" aria-label={`Edit fill-up at ${formatNumber(entry.odometerMiles, 1)} miles`}><Pencil size={14} aria-hidden="true" /></button><button type="button" className={styles.deleteButton} onClick={() => { setPendingDeleteId(entry.id); setResetConfirm(false); setHistoryActionError(""); }} disabled={historyActionBusy || saving} title="Delete this fill-up" aria-label={`Delete fill-up at ${formatNumber(entry.odometerMiles, 1)} miles`}><Trash2 size={15} aria-hidden="true" /></button></div>}
                </li>)}
              </ul>
            ) : (
              <div className={styles.emptyLedger}><span>01</span><p>Your first full-tank entry sets the baseline. MPG appears after you log the next full tank.</p></div>
            )}
            {history?.averageMpg ? <p className={styles.averageNote}>Average across completed full-to-full intervals: <strong>{formatNumber(history.averageMpg, 1)} MPG</strong>.</p> : null}
          </div>
        </div>
      )}

      {loadState === "guest" && <aside className={styles.signInNote}><div><strong>Keep your last five fill-ups together.</strong><p>Manual calculations work without an account. Sign in to save odometer readings and pump costs.</p></div><Link href={loginUrl}>Sign in</Link></aside>}
      {loadState === "error" && <p className={styles.inlineNotice} role="status">Your manual calculator is ready. Sign in again later to load saved fill-ups.</p>}

      <section className={styles.tripPanel} aria-labelledby="fuel-trip-heading">
        <div><p className={styles.tripEyebrow}>PLAN A DRIVE</p><h3 id="fuel-trip-heading">Estimate a trip’s fuel cost</h3><p>Uses your saved average MPG, or the manual MPG result if you have not logged a full-tank interval yet.</p></div>
        <div className={styles.tripInputs}>
          <label className={styles.field}><span>Trip distance</span><div className={styles.inputWrap}><input type="number" min="1" max="100000" step="1" value={tripMiles} onChange={(event) => setTripMiles(event.target.value)} placeholder="For example, 240" /><em>mi</em></div></label>
          <label className={styles.field}><span>Fuel price</span><div className={styles.inputWrap}><em className={styles.prefix}>$</em><input type="number" min="0.01" max="100" step="0.01" value={tripPrice} onChange={(event) => { setTripPriceTouched(true); setTripPrice(event.target.value); }} placeholder="Per gallon" /></div></label>
          <div className={styles.tripAnswer}><span>ESTIMATED FUEL COST</span><strong>{tripEstimate ? formatCurrency(tripEstimate.cost) : "Add trip details"}</strong>{tripEstimate && <small>About {formatNumber(tripEstimate.gallons, 1)} gallons at {formatNumber(tripMpg ?? 0, 1)} MPG</small>}</div>
        </div>
        {recentAveragePrice !== null && <p className={styles.tripFoot}>Fuel price uses a weighted average of recent receipts. When your latest fill-up has a fuel type, only matching receipts are included. You can change it for this trip.</p>}
      </section>

      <section className={styles.nearbyPanel} aria-labelledby="fuel-nearby-heading">
        <div><p className={styles.tripEyebrow}>NEARBY STATIONS</p><h3 id="fuel-nearby-heading">Find a gas station near you</h3><p>Open a Google Maps search for nearby stations. CalcForged does not ask for or store your location.</p></div>
        <a href="https://www.google.com/maps/search/?api=1&query=gas%20stations%20near%20me" target="_blank" rel="noopener noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a>
        <small>Maps may ask for your location. This link does not filter to an exact mile radius or guarantee current fuel prices.</small>
      </section>
      {!isSignedIn && loadState !== "loading" && <p className={styles.bottomNote}>Fuel prices vary by station. Enter the amount you actually paid for the most useful cost estimate.</p>}
    </section>
  );
}
