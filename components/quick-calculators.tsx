"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * QuickCalculators — a basic and a scientific calculator embedded on the
 * homepage. Expression evaluation uses a small shunting-yard parser (no eval),
 * with proper precedence, parentheses, trig (degrees or radians), logs, and
 * power. Both panels share the engine; they differ in the button sets.
 */

type Token = { t: "num"; v: number } | { t: "op"; v: string } | { t: "fn"; v: string } | { t: "paren"; v: "(" | ")" };

const FUNCTIONS: Record<string, (x: number, deg: boolean) => number> = {
	sin: (x, deg) => Math.sin(deg ? (x * Math.PI) / 180 : x),
	cos: (x, deg) => Math.cos(deg ? (x * Math.PI) / 180 : x),
	tan: (x, deg) => Math.tan(deg ? (x * Math.PI) / 180 : x),
	asin: (x, deg) => (deg ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
	acos: (x, deg) => (deg ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
	atan: (x, deg) => (deg ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
	log: (x) => Math.log10(x),
	ln: (x) => Math.log(x),
	sqrt: (x) => Math.sqrt(x),
	abs: (x) => Math.abs(x),
};

const CONSTANTS: Record<string, number> = { π: Math.PI, e: Math.E };

function tokenize(src: string): Token[] | null {
	const tokens: Token[] = [];
	let i = 0;
	while (i < src.length) {
		const ch = src[i];
		if (ch === " ") { i += 1; continue; }
		if (/[0-9.]/.test(ch)) {
			let num = "";
			while (i < src.length && /[0-9.]/.test(src[i])) { num += src[i]; i += 1; }
			const value = Number(num);
			if (!Number.isFinite(value)) return null;
			tokens.push({ t: "num", v: value });
			continue;
		}
		if (/[a-zπ]/i.test(ch)) {
			let name = "";
			while (i < src.length && /[a-z0-9]/i.test(src[i])) { name += src[i]; i += 1; }
			const lower = name.toLowerCase();
			if (lower === "pi" || ch === "π") tokens.push({ t: "num", v: CONSTANTS[lower === "pi" ? "π" : lower] ?? Math.PI });
			else if (lower === "e") tokens.push({ t: "num", v: Math.E });
			else if (FUNCTIONS[lower]) tokens.push({ t: "fn", v: lower });
			else return null;
			continue;
		}
		if ("+-*/^%".includes(ch)) { tokens.push({ t: "op", v: ch }); i += 1; continue; }
		if (ch === "(" || ch === ")") { tokens.push({ t: "paren", v: ch }); i += 1; continue; }
		return null;
	}
	return tokens.length ? tokens : null;
}

const PRECEDENCE: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 3, "^": 4 };

function evaluate(src: string, deg: boolean): number | null {
	const tokens = tokenize(src);
	if (!tokens) return null;
	// shunting-yard to RPN
	const output: Token[] = [];
	const stack: Token[] = [];
	let prev: Token | null = null;
	for (const token of tokens) {
		if (token.t === "num") { output.push(token); }
		else if (token.t === "fn") { stack.push(token); }
		else if (token.t === "paren" && token.v === "(") { stack.push(token); }
		else if (token.t === "paren" && token.v === ")") {
			while (stack.length && !(stack[stack.length - 1].t === "paren" && (stack[stack.length - 1] as { v: string }).v === "(")) output.push(stack.pop() as Token);
			if (!stack.length) return null;
			stack.pop();
			if (stack.length && stack[stack.length - 1].t === "fn") output.push(stack.pop() as Token);
		} else {
			// unary minus / plus
			const unary = (token.v === "-" || token.v === "+") && (!prev || prev.t === "op" || (prev.t === "paren" && prev.v === "("));
			if (unary) {
				output.push({ t: "num", v: 0 });
				stack.push({ t: "op", v: token.v === "-" ? "u-" : "u+" });
			} else {
				while (stack.length && stack[stack.length - 1].t === "op" && PRECEDENCE[(stack[stack.length - 1] as { v: string }).v] >= PRECEDENCE[token.v] && token.v !== "^") output.push(stack.pop() as Token);
				stack.push(token);
			}
		}
		prev = token;
	}
	while (stack.length) {
		const top = stack.pop() as Token;
		if (top.t === "paren") return null;
		output.push(top);
	}
	// evaluate RPN
	const values: number[] = [];
	for (const token of output) {
		if (token.t === "num") values.push(token.v);
		else if (token.t === "fn") {
			const x = values.pop();
			if (x === undefined) return null;
			const result = FUNCTIONS[token.v](x, deg);
			if (!Number.isFinite(result) && !Number.isNaN(result)) return null;
			values.push(result);
		} else {
			if (token.v === "u-") { const x = values.pop(); if (x === undefined) return null; values.push(-x); continue; }
			if (token.v === "u+") { continue; }
			const b = values.pop();
			const a = values.pop();
			if (a === undefined || b === undefined) return null;
			if (token.v === "+") values.push(a + b);
			else if (token.v === "-") values.push(a - b);
			else if (token.v === "*") values.push(a * b);
			else if (token.v === "/") { if (b === 0) return null; values.push(a / b); }
			else if (token.v === "%") { if (b === 0) return null; values.push(a % b); }
			else if (token.v === "^") values.push(Math.pow(a, b));
			else return null;
		}
	}
	if (values.length !== 1) return null;
	const result = values[0];
	if (!Number.isFinite(result)) return null;
	return result;
}

const pretty = (value: number): string => {
	if (Number.isInteger(value) && Math.abs(value) < 1e15) return String(value);
	const rounded = Math.round(value * 1e10) / 1e10;
	return String(rounded);
};

type Key = { label?: string; push?: string; action?: "equals" | "clear" | "back" | "toggle"; kind?: "op" | "fn" | "wide" | "eq" | "deg" };

const BASIC_KEYS: Key[] = [
	{ label: "C", action: "clear", kind: "fn" }, { label: "⌫", action: "back", kind: "fn" }, { label: "%", push: "%", kind: "op" }, { label: "÷", push: "÷", kind: "op" },
	{ label: "7", push: "7" }, { label: "8", push: "8" }, { label: "9", push: "9" }, { label: "×", push: "×", kind: "op" },
	{ label: "4", push: "4" }, { label: "5", push: "5" }, { label: "6", push: "6" }, { label: "−", push: "-", kind: "op" },
	{ label: "1", push: "1" }, { label: "2", push: "2" }, { label: "3", push: "3" }, { label: "+", push: "+", kind: "op" },
	{ label: "0", push: "0" }, { label: ".", push: "." }, { label: "(", push: "(" }, { label: ")", push: ")" },
	{ label: "=", action: "equals", kind: "eq" },
];

export function QuickCalculators() {
	const [basic, setBasic] = useState("");
	const [sci, setSci] = useState("");
	const [deg, setDeg] = useState(true);

	const basicResult = useMemo(() => { const r = evaluate(basic.replace(/÷/g, "/").replace(/×/g, "*"), deg); return r === null ? null : pretty(r); }, [basic, deg]);
	const sciResult = useMemo(() => { const r = evaluate(sci, deg); return r === null ? null : pretty(r); }, [sci, deg]);

	const press = useCallback((setter: React.Dispatch<React.SetStateAction<string>>, state: string, key: Key) => {
		if (key.action === "clear") { setter(""); return; }
		if (key.action === "back") { setter(state.slice(0, -1)); return; }
		if (key.action === "equals") { const r = evaluate(state.replace(/÷/g, "/").replace(/×/g, "*"), deg); if (r !== null) setter(pretty(r)); return; }
		setter(state + (key.push ?? ""));
	}, [deg]);

	const sciKeys: Key[] = [
		{ label: "C", action: "clear", kind: "fn" }, { label: "⌫", action: "back", kind: "fn" }, { label: "(", push: "(" }, { label: ")", push: ")" }, { label: "÷", push: "÷", kind: "op" },
		{ label: "sin", push: "sin(", kind: "fn" }, { label: "cos", push: "cos(", kind: "fn" }, { label: "tan", push: "tan(", kind: "fn" }, { label: "π", push: "π" }, { label: "×", push: "×", kind: "op" },
		{ label: "DEG/RAD", action: "clear", kind: "deg" }, { label: "asin", push: "asin(", kind: "fn" }, { label: "log", push: "log(", kind: "fn" }, { label: "ln", push: "ln(", kind: "fn" }, { label: "−", push: "-", kind: "op" },
		{ label: "√", push: "sqrt(", kind: "fn" }, { label: "x²", push: "^2", kind: "fn" }, { label: "xʸ", push: "^", kind: "fn" }, { label: "e", push: "e" }, { label: "+", push: "+", kind: "op" },
		{ label: "7", push: "7" }, { label: "8", push: "8" }, { label: "9", push: "9" }, { label: "abs", push: "abs(", kind: "fn" }, { label: "1/x", push: "1÷", kind: "fn" },
		{ label: "4", push: "4" }, { label: "5", push: "5" }, { label: "6", push: "6" }, { label: "(", push: "(" }, { label: ")", push: ")" },
		{ label: "1", push: "1" }, { label: "2", push: "2" }, { label: "3", push: "3" }, { label: "0", push: "0" }, { label: ".", push: "." },
		{ label: "=", action: "equals", kind: "eq" },
	];

	const panel = (
		title: string,
		state: string,
		result: string | null,
		setter: React.Dispatch<React.SetStateAction<string>>,
		keys: Key[],
		isSci: boolean,
	) => (
		<div className="cf-quick-panel" tabIndex={0}
			onKeyDown={(event) => {
				if (event.key === "Enter") { event.preventDefault(); press(setter, state, { action: "equals" }); }
				else if (event.key === "Escape") { event.preventDefault(); setter(""); }
				else if (event.key === "Backspace") { event.preventDefault(); setter(state.slice(0, -1)); }
				else if (/^[0-9.+\-*/()^%]$/.test(event.key)) { event.preventDefault(); setter(state + (event.key === "*" ? "×" : event.key === "/" ? "÷" : event.key)); }
			}}>
			<div className="cf-quick-head"><span className="cf-kicker">{title}</span>{isSci && <button type="button" className={`cf-deg-toggle${deg ? " is-deg" : ""}`} onClick={() => setDeg((d) => !d)} aria-label="Toggle degrees or radians">{deg ? "DEG" : "RAD"}</button>}</div>
			<div className="cf-quick-display" aria-live="polite">
				<span className="cf-quick-expr">{state || "0"}</span>
				<span className="cf-quick-result">{result !== null && state ? `= ${result}` : "\u00A0"}</span>
			</div>
			<div className={`cf-quick-keys ${isSci ? "is-sci" : ""}`}>
				{keys.map((key, index) => {
					const isToggle = key.kind === "deg";
					return <button key={`${key.label}-${index}`} type="button" className={`cf-qkey${key.kind ? ` is-${key.kind}` : ""}`} onClick={() => (isToggle ? setDeg((d) => !d) : press(setter, state, key))}>{isToggle ? (deg ? "DEG" : "RAD") : key.label}</button>;
				})}
			</div>
		</div>
	);

	return (
		<div className="cf-quick-grid">
			{panel("Basic", basic, basicResult, setBasic, BASIC_KEYS, false)}
			{panel("Scientific", sci, sciResult, setSci, sciKeys, true)}
		</div>
	);
}
