"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, Gauge, MapPin, Navigation2, Route, ShieldAlert, Trash2 } from "lucide-react";
import styles from "./gig-driver-mileage.module.css";
import { calculateHoursWorked, calculateShiftEconomics, gpsErrorMessage, gpsSegmentMiles, validateShiftBasis, validateShiftInputs, type GigMileageInputMethod } from "@/lib/gig-driver-mileage";

type SavedMileageRecord = {
  id: number;
  miles: number;
  startedAt: string;
  endedAt: string;
  inputMethod: GigMileageInputMethod;
  createdAt: string;
  grossEarnings: number | null;
  hoursWorked: number | null;
  fuelMpg: number | null;
  fuelPricePerGallon: number | null;
};

type HistoryResponse = { ok: boolean; records: SavedMileageRecord[]; sevenDayMiles: number; error?: string };
type FuelEntry = { gallons: number; totalPaid: number; intervalMpg: number | null };
type FuelResponse = { ok: boolean; entries: FuelEntry[]; lastFullMpg: number | null; averageMpg: number | null; error?: string };
type Coordinate = { latitude: number; longitude: number };

const TRACKER_PATH = "/calculators/business/gig-driver-mileage-tracker";
const FUEL_PATH = "/calculators/automotive/fuel-mileage";
const formatMiles = (miles: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(miles);
const formatMoney = (amount: number, maximumFractionDigits = 2) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: Math.min(2, maximumFractionDigits), maximumFractionDigits }).format(amount);
const localInputTime = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};
const formatDateTime = (value: string) => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
const formatPumpPrice = (entry: FuelEntry) => entry.gallons > 0 ? `$${(entry.totalPaid / entry.gallons).toFixed(2)}/gal` : null;
const pumpPriceNumber = (entry: FuelEntry | undefined) => entry && entry.gallons > 0 ? entry.totalPaid / entry.gallons : null;

export function GigDriverMileageTracker() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [fuel, setFuel] = useState<FuelResponse | null>(null);
  const [fuelUnavailable, setFuelUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [manualError, setManualError] = useState("");
  const [gpsError, setGpsError] = useState("");
  const [gpsStatus, setGpsStatus] = useState("");
  const [startOdometer, setStartOdometer] = useState("");
  const [endOdometer, setEndOdometer] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [grossEarningsInput, setGrossEarningsInput] = useState("");
  const [fuelMpgInput, setFuelMpgInput] = useState("");
  const [fuelPriceInput, setFuelPriceInput] = useState("");
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsMiles, setGpsMiles] = useState(0);
  const [gpsStartedAt, setGpsStartedAt] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastCoordinate = useRef<Coordinate | null>(null);
  const gpsDistance = useRef(0);
  const fuelInputsInitialized = useRef(false);

  const loginReturn = useMemo(() => `/login?return_to=${encodeURIComponent(TRACKER_PATH)}`, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [mileageResponse, fuelResponse] = await Promise.all([
        fetch("/api/gig-driver-mileage", { cache: "no-store" }),
        fetch("/api/fuel-history", { cache: "no-store" }).catch(() => null),
      ]);
      if (mileageResponse.status === 401) {
        window.location.href = loginReturn;
        return;
      }
      const mileageData = await mileageResponse.json() as HistoryResponse;
      if (!mileageResponse.ok || !mileageData.ok) throw new Error(mileageData.error || "Could not load your mileage history.");
      setHistory(mileageData);
      if (fuelResponse?.ok) {
        const fuelData = await fuelResponse.json() as FuelResponse;
        if (fuelData.ok) {
          setFuel(fuelData);
          if (!fuelInputsInitialized.current) {
            const mpg = fuelData.lastFullMpg ?? fuelData.averageMpg;
            const price = pumpPriceNumber(fuelData.entries?.[0]);
            if (mpg !== null && mpg > 0) setFuelMpgInput(String(Number(mpg.toFixed(2))));
            if (price !== null && price > 0) setFuelPriceInput(String(Number(price.toFixed(4))));
            fuelInputsInitialized.current = true;
          }
        } else {
          setFuelUnavailable(true);
          fuelInputsInitialized.current = true;
        }
      } else {
        setFuelUnavailable(true);
        fuelInputsInitialized.current = true;
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load your mileage history.");
    } finally {
      setLoading(false);
    }
  }, [loginReturn]);

  useEffect(() => {
    const now = new Date();
    setStartedAt(localInputTime(new Date(now.getTime() - 60 * 60_000)));
    setEndedAt(localInputTime(now));
    void loadData();
  }, [loadData]);

  useEffect(() => () => {
    if (watchId.current !== null && typeof navigator !== "undefined" && navigator.geolocation) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    lastCoordinate.current = null;
    gpsDistance.current = 0;
  }, []);

  const submitRecord = useCallback(async (payload: Record<string, unknown>, successMessage: string) => {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/gig-driver-mileage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as HistoryResponse;
      if (response.status === 401) {
        window.location.href = loginReturn;
        return false;
      }
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not save this shift record.");
      setHistory(data);
      setNotice(successMessage);
      return true;
    } catch (error) {
      setManualError(error instanceof Error ? error.message : "Could not save this shift record.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [loginReturn]);

  async function saveManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManualError("");
    setNotice("");
    const start = Number(startOdometer);
    const end = Number(endOdometer);
    if (!Number.isFinite(start) || start < 0 || start > 1_000_000 || !Number.isFinite(end) || end < 0 || end > 1_000_000) {
      setManualError("Enter both odometer readings between 0 and 1,000,000 miles.");
      return;
    }
    if (end <= start) {
      setManualError("The ending odometer reading must be higher than the starting reading.");
      return;
    }
    const startDate = new Date(startedAt);
    const endDate = new Date(endedAt);
    if (!startedAt || !endedAt || !Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) {
      setManualError("Enter both the trip start and end times.");
      return;
    }
    if (endDate <= startDate) {
      setManualError("The trip end time must be after the start time.");
      return;
    }
    if (startDate.getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
      setManualError("Trips must start within the last seven days.");
      return;
    }
    if (endDate.getTime() > Date.now() + 60_000) {
      setManualError("The trip end time cannot be in the future.");
      return;
    }
    const hoursWorked = calculateHoursWorked(startDate.toISOString(), endDate.toISOString());
    const finance = validateShiftInputs(grossEarningsInput, hoursWorked, fuelMpgInput, fuelPriceInput);
    if (!finance.value) {
      setManualError(finance.error);
      return;
    }
    const saved = await submitRecord({
      inputMethod: "manual_odometer",
      startOdometer: start,
      endOdometer: end,
      startedAt: startDate.toISOString(),
      endedAt: endDate.toISOString(),
      ...finance.value,
    }, "Shift and mileage saved to your seven-day log.");
    if (saved) {
      setStartOdometer("");
      setEndOdometer("");
      setGrossEarningsInput("");
      const now = new Date();
      setStartedAt(localInputTime(new Date(now.getTime() - 60 * 60_000)));
      setEndedAt(localInputTime(now));
    }
  }

  function startGps() {
    setGpsError("");
    setNotice("");
    const basis = validateShiftBasis(grossEarningsInput, fuelMpgInput, fuelPriceInput);
    if (!basis.value) {
      setGpsError(basis.error);
      return;
    }
    if (!navigator.geolocation) {
      setGpsError("GPS is not available in this browser. Use the manual odometer readings below instead.");
      return;
    }
    gpsDistance.current = 0;
    lastCoordinate.current = null;
    setGpsMiles(0);
    setGpsStatus("Waiting for a GPS fix. Keep this page open while you travel.");
    setGpsStartedAt(new Date().toISOString());
    setGpsActive(true);
    try {
      watchId.current = navigator.geolocation.watchPosition((position) => {
        if (!position.coords || position.coords.accuracy > 100) {
          setGpsStatus("GPS signal is weak. Keep the page open or use manual odometer readings.");
          return;
        }
        const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        if (lastCoordinate.current) {
          const segment = gpsSegmentMiles(lastCoordinate.current, next);
          if (segment > 0.003) gpsDistance.current += segment;
        }
        lastCoordinate.current = next;
        setGpsMiles(gpsDistance.current);
        setGpsStatus("Recording in the foreground. Start and stop while parked.");
      }, (error) => {
        if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
        setGpsActive(false);
        setGpsStartedAt(null);
        setGpsStatus("");
        setGpsError(gpsErrorMessage(error.code));
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 });
    } catch {
      setGpsActive(false);
      setGpsStartedAt(null);
      setGpsStatus("");
      setGpsError("GPS could not start. Use the manual odometer readings below instead.");
    }
  }

  async function stopGps() {
    const ended = new Date();
    const started = gpsStartedAt;
    const hoursWorked = started ? calculateHoursWorked(started, ended.toISOString()) : null;
    const finance = validateShiftInputs(grossEarningsInput, hoursWorked, fuelMpgInput, fuelPriceInput);
    if (!finance.value) {
      setGpsError(finance.error);
      return;
    }
    if (watchId.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setGpsActive(false);
    setGpsError("");
    setGpsStatus("");
    const miles = Math.round(gpsDistance.current * 100) / 100;
    const startedCoordinate = lastCoordinate.current;
    lastCoordinate.current = null;
    gpsDistance.current = 0;
    if (!started || !startedCoordinate || miles <= 0) {
      setGpsMiles(0);
      setGpsStartedAt(null);
      setGpsError("No usable GPS mileage was recorded. Keep this page open while tracking, or enter your start and end odometer readings below.");
      return;
    }
    const saved = await submitRecord({ inputMethod: "foreground_gps", miles, startedAt: started, endedAt: ended.toISOString(), ...finance.value }, "GPS shift saved. Only miles, shift details, timestamps, and input method were kept.");
    setGpsMiles(0);
    setGpsStartedAt(null);
    if (saved) setGrossEarningsInput("");
    if (!saved) setGpsError("The GPS total could not be saved. You can retry by entering your odometer readings manually.");
  }

  async function removeRecord(id: number) {
    if (!window.confirm("Remove this mileage record?")) return;
    setLoadError("");
    setNotice("");
    try {
      const response = await fetch("/api/gig-driver-mileage", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json() as HistoryResponse;
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not remove this mileage record.");
      setHistory(data);
      setNotice("Mileage record removed.");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not remove this mileage record.");
    }
  }

  const manualMiles = startOdometer.trim() !== "" && endOdometer.trim() !== "" && Number(startOdometer) >= 0 && Number(endOdometer) > Number(startOdometer)
    ? Math.round((Number(endOdometer) - Number(startOdometer)) * 10) / 10
    : null;
  const lastFullMpg = fuel?.lastFullMpg ?? fuel?.averageMpg ?? null;
  const latestPumpPrice = fuel?.entries?.[0] ? formatPumpPrice(fuel.entries[0]) : null;
  const rollingTotals = useMemo(() => {
    const records = history?.records ?? [];
    let hoursWorked = 0;
    let afterFuel = 0;
    let afterFuelShiftCount = 0;
    for (const record of records) {
      const hours = record.hoursWorked ?? calculateHoursWorked(record.startedAt, record.endedAt);
      if (hours !== null) hoursWorked += hours;
      if (record.grossEarnings === null || hours === null || record.fuelMpg === null || record.fuelPricePerGallon === null) continue;
      const economics = calculateShiftEconomics({ miles: record.miles, grossEarnings: record.grossEarnings, hoursWorked: hours, fuelMpg: record.fuelMpg, fuelPricePerGallon: record.fuelPricePerGallon });
      if (economics) {
        afterFuel += economics.afterFuel;
        afterFuelShiftCount += 1;
      }
    }
    return { hoursWorked: Math.round(hoursWorked * 100) / 100, afterFuel: Math.round(afterFuel * 100) / 100, afterFuelShiftCount, shiftCount: records.length };
  }, [history?.records]);
  const currentShiftMiles = gpsActive ? gpsMiles : manualMiles;
  const manualHoursWorked = calculateHoursWorked(startedAt, endedAt);
  const gpsHoursWorked = gpsStartedAt ? calculateHoursWorked(gpsStartedAt, new Date().toISOString()) : null;
  const currentHoursWorked = gpsActive ? gpsHoursWorked : manualHoursWorked;
  const currentShiftInputs = validateShiftInputs(grossEarningsInput, currentHoursWorked, fuelMpgInput, fuelPriceInput).value;
  const liveEconomics = currentShiftMiles !== null && currentShiftInputs?.fuelMpg !== null && currentShiftInputs?.fuelMpg !== undefined && currentShiftInputs?.fuelPricePerGallon !== null && currentShiftInputs?.fuelPricePerGallon !== undefined
    ? calculateShiftEconomics({ miles: currentShiftMiles, grossEarnings: currentShiftInputs.grossEarnings, hoursWorked: currentShiftInputs.hoursWorked, fuelMpg: currentShiftInputs.fuelMpg, fuelPricePerGallon: currentShiftInputs.fuelPricePerGallon })
    : null;

  return (
    <section className={styles.tracker} aria-labelledby="gig-mileage-heading">
      <div className={styles.trackerTop}>
        <div>
          <p className={styles.trackerEyebrow}>CALCFORGED / BUSINESS</p>
          <h2 id="gig-mileage-heading">A clearer view of each shift.</h2>
        </div>
        <span className={styles.windowPill}><Clock3 aria-hidden="true" />Rolling 7-day log</span>
      </div>

      <div className={styles.safetyNote} role="note">
        <ShieldAlert aria-hidden="true" />
        <div><strong>For a safer start and stop</strong>Park before starting or stopping GPS tracking. GPS runs only while this page is open in the foreground; it does not track in the background or with your screen locked. If GPS is denied or unavailable, use the manual odometer fields.</div>
      </div>

      <div className={styles.workGrid}>
        <form className={styles.entryPanel} onSubmit={saveManual}>
          <div className={styles.panelHeading}>
            <div><p className={styles.mono}>Mileage + shift totals</p><h3>Log a shift or trip</h3><p>Enter the miles and total earnings. Hours fill automatically from shift start and finish. MPG and pump price can prefill from Fuel Mileage.</p></div>
            <span className={styles.modeStamp} aria-hidden="true"><Gauge /></span>
          </div>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Starting odometer</span>
              <span className={styles.inputWrap}><input type="number" inputMode="decimal" min="0" max="1000000" step="0.1" required value={startOdometer} onChange={(event) => setStartOdometer(event.target.value)} placeholder="42,180" aria-label="Starting odometer in miles" disabled={gpsActive || saving} /><span className={styles.unit}>MI</span></span>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Ending odometer</span>
              <span className={styles.inputWrap}><input type="number" inputMode="decimal" min="0" max="1000000" step="0.1" required value={endOdometer} onChange={(event) => setEndOdometer(event.target.value)} placeholder="42,236" aria-label="Ending odometer in miles" disabled={gpsActive || saving} /><span className={styles.unit}>MI</span></span>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Shift start</span>
              <span className={styles.inputWrap}><input type="datetime-local" required value={startedAt} onChange={(event) => setStartedAt(event.target.value)} aria-label="Shift start time" disabled={gpsActive || saving} /></span>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Shift finish</span>
              <span className={styles.inputWrap}><input type="datetime-local" required value={endedAt} onChange={(event) => setEndedAt(event.target.value)} aria-label="Shift finish time" disabled={gpsActive || saving} /></span>
            </label>
          </div>
          <div className={styles.mileagePreview}><span>Trip distance</span><strong>{manualMiles !== null ? `${formatMiles(manualMiles)} mi` : "Enter both readings"}</strong></div>

          <div className={styles.financeGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Total shift earnings</span>
              <span className={styles.inputWrap}><span className={styles.unit}>$</span><input type="number" inputMode="decimal" min="0" max="1000000" step="0.01" required value={grossEarningsInput} onChange={(event) => setGrossEarningsInput(event.target.value)} placeholder="145.00" aria-label="Total earnings for this shift" disabled={gpsActive || saving} /></span>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Hours worked (auto)</span>
              <span className={styles.inputWrap}><output className={styles.calculatedValue} aria-label="Hours worked, calculated from shift times">{currentHoursWorked !== null ? currentHoursWorked.toFixed(2) : "Set shift times"}</output><span className={styles.unit}>HR</span></span>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Fuel efficiency</span>
              <span className={styles.inputWrap}><input type="number" inputMode="decimal" min="0.1" max="500" step="0.1" value={fuelMpgInput} onChange={(event) => setFuelMpgInput(event.target.value)} placeholder="MPG" aria-label="Fuel efficiency in miles per gallon" disabled={gpsActive || saving} /><span className={styles.unit}>MPG</span></span>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Pump price</span>
              <span className={styles.inputWrap}><span className={styles.unit}>$</span><input type="number" inputMode="decimal" min="0.001" max="100" step="0.0001" value={fuelPriceInput} onChange={(event) => setFuelPriceInput(event.target.value)} placeholder="/ gallon" aria-label="Fuel price per gallon" disabled={gpsActive || saving} /><span className={styles.unit}>/GAL</span></span>
            </label>
          </div>
          <p className={styles.financeHint}>Hours are calculated from shift start to finish. MPG and pump price prefill from your saved Fuel Mileage log when available, and can be changed for this shift.</p>

          <section className={styles.resultPanel} aria-live="polite" aria-label="Fuel-only shift results">
            {liveEconomics ? <>
              <div className={styles.resultMain}>
                <span className={styles.resultEyebrow}>After fuel / hour</span>
                <strong>{formatMoney(liveEconomics.afterFuelPerHour)}</strong>
                <span>Based on {formatMiles(currentShiftMiles ?? 0)} miles and {currentShiftInputs?.hoursWorked.toFixed(2)} hours worked</span>
              </div>
              <div className={styles.resultRows}>
                <div className={styles.resultRow}><span>Total earnings</span><strong>{formatMoney(currentShiftInputs?.grossEarnings ?? 0)}</strong></div>
                <div className={styles.resultRow}><span>Fuel cost per mile</span><strong>{formatMoney(liveEconomics.fuelCostPerMile, 3)}/mi</strong></div>
                <div className={styles.resultRow}><span>Fuel cost for shift</span><strong>−{formatMoney(liveEconomics.fuelCost)}</strong></div>
                <div className={styles.resultRow}><span>After fuel</span><strong>{formatMoney(liveEconomics.afterFuel)}</strong></div>
              </div>
              <p className={styles.resultNote}>Fuel cost uses miles × pump price ÷ MPG, based on the values shown here. It covers fuel only, not maintenance or vehicle wear.</p>
            </> : <p className={styles.resultEmpty}>{currentShiftMiles === null ? "Enter both odometer readings or start GPS to see shift results." : "Enter total earnings, hours worked, MPG, and pump price to see your fuel cost per mile and earnings per hour after fuel. Fuel values from your log fill in when available."}</p>}
          </section>

          {manualError && <p className={styles.formError} role="alert">{manualError}</p>}
          <button className={styles.primaryButton} type="submit" disabled={saving || gpsActive}><Route aria-hidden="true" />{saving ? "Saving shift…" : "Save shift and mileage"}</button>
          <div className={styles.gpsBox}>
            <div className={styles.gpsHead}><strong>Optional foreground GPS</strong><span className={styles.foregroundTag}>Location stays on this device</span></div>
            <div className={styles.gpsRow}>
              {!gpsActive ? <button className={styles.gpsButton} type="button" onClick={startGps} disabled={saving}><Navigation2 aria-hidden="true" />Start GPS tracking</button> : <button className={`${styles.gpsButton} ${styles.gpsButtonStop}`} type="button" onClick={() => void stopGps()} disabled={saving}><MapPin aria-hidden="true" />Stop &amp; save while parked</button>}
              <span className={styles.gpsReadout}>{gpsActive ? `${formatMiles(gpsMiles)} mi` : "Manual odometer is always available"}</span>
            </div>
            {gpsStatus && <p className={styles.notice} role="status">{gpsStatus}</p>}
            {gpsError && <p className={styles.gpsError} role="alert">{gpsError}</p>}
            <p className={styles.gpsPrivacy}>The browser may ask for location permission. Route coordinates are used temporarily to estimate distance, then discarded; only miles, earnings, calculated hours, fuel inputs, timestamps, and input method are saved.</p>
          </div>
        </form>

        <aside className={styles.historyPanel} aria-labelledby="gig-mileage-history-heading">
          <div className={styles.historyHeader}>
            <div><p className={styles.mono}>Your recent shifts</p><h3 id="gig-mileage-history-heading">Last 7 days</h3><p>Older trips are removed automatically.</p></div>
            <div className={styles.totalStats} aria-label="Seven-day mileage and hours totals"><div className={styles.totalStat}><strong>{formatMiles(history?.sevenDayMiles ?? 0)}</strong><span>miles logged</span></div><div className={styles.totalStat}><strong>{rollingTotals.hoursWorked.toFixed(2)}</strong><span>hours logged</span></div></div>
          </div>
          {loadError && <p className={styles.loadError} role="alert">{loadError}</p>}
          {loading ? <div className={styles.loading} aria-live="polite"><span className={styles.mono}>Loading your log…</span></div> : history?.records.length ? (
            <ol className={styles.recordList}>
              {history.records.map((record) => {
                const recordHoursWorked = record.hoursWorked ?? calculateHoursWorked(record.startedAt, record.endedAt);
                const economics = record.grossEarnings !== null && recordHoursWorked !== null && record.fuelMpg !== null && record.fuelPricePerGallon !== null
                  ? calculateShiftEconomics({ miles: record.miles, grossEarnings: record.grossEarnings, hoursWorked: recordHoursWorked, fuelMpg: record.fuelMpg, fuelPricePerGallon: record.fuelPricePerGallon })
                  : null;
                return <li className={styles.record} key={record.id}>
                  <span className={styles.recordMarker} aria-hidden="true" />
                  <div>
                    <strong className={styles.recordDistance}>{formatMiles(record.miles)} mi</strong>
                    <span className={styles.recordTime}>{formatDateTime(record.startedAt)} – {formatDateTime(record.endedAt)}</span>
                    <span className={styles.recordMethod}>{record.inputMethod === "manual_odometer" ? <Gauge aria-hidden="true" /> : <Navigation2 aria-hidden="true" />}{record.inputMethod === "manual_odometer" ? "Manual odometer" : "Foreground GPS"}</span>
                    {record.grossEarnings !== null && <div className={styles.recordFinance}>
                      <span>Earned {formatMoney(record.grossEarnings)}</span>
                      {economics ? <>
                        <span>Fuel {formatMoney(economics.fuelCostPerMile, 3)}/mi</span>
                        <strong>{formatMoney(economics.afterFuel)} after fuel · {formatMoney(economics.afterFuelPerHour)}/hr</strong>
                      </> : <span>Fuel inputs not saved for this shift</span>}
                    </div>}
                  </div>
                  <button className={styles.deleteButton} type="button" onClick={() => void removeRecord(record.id)} aria-label={`Remove ${formatMiles(record.miles)} mile record`} title="Remove this record"><Trash2 aria-hidden="true" /></button>
                </li>;
              })}
            </ol>
          ) : <div className={styles.emptyHistory}><div><span><Route aria-hidden="true" /></span><strong>{loadError ? "Your log is waiting" : "No trips logged yet"}</strong><p>{loadError ? "Try loading the page again to see your saved trips." : "Save your first shift above. Your mileage stays separate from the fuel log."}</p></div></div>}
          {!loading && <div className={styles.weeklySummary} aria-label="Seven-day total earned after fuel">
            <div className={styles.weeklySummaryTitle}><span>7-day rolling total</span><span>Fuel only</span></div>
            <strong className={styles.weeklySummaryAmount}>{rollingTotals.afterFuelShiftCount > 0 ? formatMoney(rollingTotals.afterFuel) : "—"}</strong>
            <p className={styles.weeklySummaryNote}>{rollingTotals.afterFuelShiftCount > 0 ? `After-fuel earnings from ${rollingTotals.afterFuelShiftCount} of ${rollingTotals.shiftCount} saved shifts with earnings and fuel details.` : "Add earnings, MPG, and pump price to a shift to calculate your total after fuel."}</p>
          </div>}
        </aside>
      </div>

      {notice && <p className={styles.notice} role="status">{notice}</p>}
      <section className={styles.fuelContext} aria-labelledby="gig-fuel-context-heading">
        <div>
          <p className={styles.fuelEyebrow}>Fuel basis</p>
          <h3 id="gig-fuel-context-heading">Use your MPG and recent pump price.</h3>
          <p>{fuelUnavailable ? "The fuel log could not be read just now. You can enter MPG and pump price directly in the shift form." : fuel?.entries.length ? "Your saved MPG and recent pump price prefill the shift form. Change either value there when needed." : "No fuel readings are saved yet. Enter your actual MPG and pump price in the shift form, or add a fill-up in Fuel Mileage."}</p>
          <Link href={FUEL_PATH} className={styles.fuelLink}>Open Fuel Mileage <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <div className={styles.fuelStats}>
          <div className={styles.fuelStat}><span>Saved MPG</span><strong>{lastFullMpg !== null ? `${lastFullMpg.toFixed(1)} MPG` : "—"}</strong></div>
          <div className={styles.fuelStat}><span>Recent pump</span><strong>{latestPumpPrice ?? "—"}</strong></div>
        </div>
      </section>
    </section>
  );
}
