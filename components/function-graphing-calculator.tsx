"use client";

import { useMemo, useState } from "react";
import {
	compileFunctionExpression,
	sampleFunctionGraph,
	type AngleMode,
	type GraphPlot,
} from "@/lib/function-graph";

const WIDTH = 720;
const HEIGHT = 360;
const MARGIN = { top: 18, right: 18, bottom: 38, left: 54 };
const PRESETS = [
	{ label: "x²", expression: "x^2" },
	{ label: "sin(x)", expression: "sin(x)" },
	{ label: "1/x", expression: "1/x" },
	{ label: "√x", expression: "sqrt(x)" },
];

function niceStep(range: number, targetTicks = 5): number {
	const raw = range / targetTicks;
	const power = 10 ** Math.floor(Math.log10(raw || 1));
	const normalized = raw / power;
	return (normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : normalized < 7.5 ? 5 : 10) * power;
}

function ticks(min: number, max: number): number[] {
	const step = niceStep(max - min);
	const first = Math.ceil(min / step) * step;
	const values: number[] = [];
	for (let value = first; value <= max + step * 1e-8 && values.length < 30; value += step)
		values.push(Math.abs(value) < step * 1e-10 ? 0 : value);
	return values;
}

function tickLabel(value: number): string {
	if (Math.abs(value) < 1e-8) return "0";
	return Number(value.toPrecision(4)).toString();
}

function makePath(plot: GraphPlot, xMin: number, xMax: number): string[] {
	const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
	const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
	const x = (value: number) => MARGIN.left + ((value - xMin) / (xMax - xMin)) * plotWidth;
	const y = (value: number) => MARGIN.top + ((plot.yMax - value) / (plot.yMax - plot.yMin)) * plotHeight;
	return plot.segments.map((segment) =>
		segment
			.map((point, index) => `${index ? "L" : "M"}${x(point.x).toFixed(2)},${y(point.y).toFixed(2)}`)
			.join(" "),
	);
}

export function FunctionGraphingCalculator({ compact = false, idPrefix = "function-graph" }: { compact?: boolean; idPrefix?: string }) {
	const id = idPrefix;
	const [expression, setExpression] = useState("x^2");
	const [minimum, setMinimum] = useState("-10");
	const [maximum, setMaximum] = useState("10");
	const [angleMode, setAngleMode] = useState<AngleMode>("radians");
	const min = Number(minimum);
	const max = Number(maximum);
	const rangeError =
		minimum.trim() === "" || maximum.trim() === "" || !Number.isFinite(min) || !Number.isFinite(max)
			? "Enter finite x-axis limits."
			: min >= max
				? "The x minimum must be less than the x maximum."
				: Math.abs(min) > 100000 || Math.abs(max) > 100000
					? "Keep each x-axis limit between −100,000 and 100,000."
					: "";
	const compiled = useMemo(() => {
		try {
			return { evaluate: compileFunctionExpression(expression, angleMode), error: "" };
		} catch (error) {
			return {
				evaluate: null,
				error: error instanceof Error ? error.message : "Check the function expression.",
			};
		}
	}, [expression, angleMode]);
	const plot = useMemo(() => {
		if (!compiled.evaluate || rangeError) return null;
		try {
			return sampleFunctionGraph(compiled.evaluate, min, max);
		} catch {
			return null;
		}
	}, [compiled.evaluate, max, min, rangeError]);
	const xTicks = useMemo(() => (rangeError ? [] : ticks(min, max)), [max, min, rangeError]);
	const yTicks = useMemo(() => (plot ? ticks(plot.yMin, plot.yMax) : []), [plot]);
	const paths = useMemo(
		() => (plot && !rangeError ? makePath(plot, min, max) : []),
		[plot, min, max, rangeError],
	);
	const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
	const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
	const mapX = (value: number) => MARGIN.left + ((value - min) / (max - min)) * plotWidth;
	const mapY = (value: number) =>
		plot ? MARGIN.top + ((plot.yMax - value) / (plot.yMax - plot.yMin)) * plotHeight : 0;
	const xAxis = plot && plot.yMin <= 0 && plot.yMax >= 0 ? mapY(0) : null;
	const yAxis = min <= 0 && max >= 0 ? mapX(0) : null;
	const error = rangeError || compiled.error;
	const hasPlot = Boolean(plot?.segments.length);

	return (
		<section className={`cf-graph-panel${compact ? " is-compact" : ""}`} aria-labelledby={`${id}-title`}>
			<div className="cf-graph-heading">
				<div>
					<p className="cf-quick-brandline">
						<span className="cf-quick-brandmark" aria-hidden="true">CF</span>
						<span className="cf-quick-brandname">CALCFORGED</span>
						<span className="cf-quick-model">GRAPH</span>
					</p>
					<h3 id={`${id}-title`}>Function graph</h3>
				</div>
				<button
					type="button"
					className="cf-graph-angle"
					aria-pressed={angleMode === "degrees"}
					onClick={() => setAngleMode((current) => current === "radians" ? "degrees" : "radians")}
				>
					{angleMode === "radians" ? "RAD" : "DEG"}
				</button>
			</div>
			<div className="cf-graph-controls">
				<label className="cf-graph-expression" htmlFor={`${id}-expression`}>
					<span>y = f(x)</span>
					<input
						id={`${id}-expression`}
						value={expression}
						maxLength={160}
						autoComplete="off"
						spellCheck={false}
						onChange={(event) => setExpression(event.target.value)}
						aria-describedby={`${id}-syntax`}
					/>
				</label>
				<label className="cf-graph-bound" htmlFor={`${id}-xmin`}>
					<span>x min</span>
					<input id={`${id}-xmin`} type="number" step="any" value={minimum} onChange={(event) => setMinimum(event.target.value)} />
				</label>
				<label className="cf-graph-bound" htmlFor={`${id}-xmax`}>
					<span>x max</span>
					<input id={`${id}-xmax`} type="number" step="any" value={maximum} onChange={(event) => setMaximum(event.target.value)} />
				</label>
			</div>
			<p className="cf-graph-syntax" id={`${id}-syntax`}>
				Use x, numbers, + − * / ^, parentheses, pi, e, sin, cos, tan, sqrt, log, ln, and abs. Use * for multiplication.
			</p>
			<fieldset className="cf-graph-presets">
				<legend className="sr-only">Sample functions</legend>
				{PRESETS.map((preset) => (
					<button key={preset.expression} type="button" onClick={() => setExpression(preset.expression)}>
						{preset.label}
					</button>
				))}
			</fieldset>
			<div className="cf-graph-screen">
				<svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby={`${id}-graph-title ${id}-graph-description`}>
					<title id={`${id}-graph-title`}>{`Graph of y = ${expression || "f(x)"}`}</title>
					<desc id={`${id}-graph-description`}>
						{hasPlot
							? `Function plotted from x ${minimum} to ${maximum}; the vertical scale fits the sampled values.`
							: error || "No real values to plot in this range."}
					</desc>
					<rect x={MARGIN.left} y={MARGIN.top} width={plotWidth} height={plotHeight} className="cf-graph-paper" />
					{yTicks.map((value) => (
						<g key={`y-${value}`}>
							<line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={mapY(value)} y2={mapY(value)} className="cf-graph-gridline" />
							<text x={MARGIN.left - 9} y={mapY(value) + 4} textAnchor="end" className="cf-graph-tick">{tickLabel(value)}</text>
						</g>
					))}
					{xTicks.map((value) => (
						<g key={`x-${value}`}>
							<line x1={mapX(value)} x2={mapX(value)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} className="cf-graph-gridline" />
							<text x={mapX(value)} y={HEIGHT - MARGIN.bottom + 19} textAnchor="middle" className="cf-graph-tick">{tickLabel(value)}</text>
						</g>
					))}
					{xAxis !== null && <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={xAxis} y2={xAxis} className="cf-graph-axis" />}
					{yAxis !== null && <line x1={yAxis} x2={yAxis} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} className="cf-graph-axis" />}
					{paths.map((path) => <path key={path} d={path} className="cf-graph-curve" />)}
				</svg>
				{error ? (
					<p className="cf-graph-message is-error" role="status">{error}</p>
				) : !hasPlot ? (
					<p className="cf-graph-message" role="status">No real values to plot in this x range.</p>
				) : null}
			</div>
			<div className="cf-graph-foot">
				<span>{hasPlot ? `${paths.length} connected plot segment${paths.length === 1 ? "" : "s"}` : "Plot updates as you type"}</span>
				<span>Angles: {angleMode}</span>
			</div>
		</section>
	);
}
