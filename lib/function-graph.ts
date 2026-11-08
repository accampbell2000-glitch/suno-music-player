export type AngleMode = "radians" | "degrees";
export type GraphPoint = { x: number; y: number };
export type GraphPlot = {
	segments: GraphPoint[][];
	yMin: number;
	yMax: number;
};

type Token =
	| { type: "number"; value: number }
	| { type: "name"; value: string }
	| { type: "operator"; value: "+" | "-" | "*" | "/" | "^" }
	| { type: "left" | "right" };

type ExpressionNode =
	| { type: "number"; value: number }
	| { type: "x" }
	| { type: "constant"; value: number }
	| { type: "unary"; operator: "+" | "-"; value: ExpressionNode }
	| {
			type: "binary";
			operator: "+" | "-" | "*" | "/" | "^";
			left: ExpressionNode;
			right: ExpressionNode;
	  }
	| { type: "call"; name: string; value: ExpressionNode };

const FUNCTIONS = new Set(["sin", "cos", "tan", "sqrt", "log", "ln", "abs"]);

export class GraphExpressionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "GraphExpressionError";
	}
}

function tokenize(source: string): Token[] {
	const expression = source.trim();
	if (!expression) throw new GraphExpressionError("Enter a function of x.");
	if (expression.length > 160)
		throw new GraphExpressionError("Keep the function under 160 characters.");
	const tokens: Token[] = [];
	let index = 0;
	while (index < expression.length) {
		const rest = expression.slice(index);
		if (/^\s/.test(rest)) {
			index += 1;
			continue;
		}
		const numeric = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
		if (numeric) {
			const value = Number(numeric[0]);
			if (!Number.isFinite(value))
				throw new GraphExpressionError("Use finite numeric values.");
			tokens.push({ type: "number", value });
			index += numeric[0].length;
			continue;
		}
		const name = rest.match(/^(?:[a-zA-Z]+|π)/);
		if (name) {
			tokens.push({ type: "name", value: name[0].toLowerCase() });
			index += name[0].length;
			continue;
		}
		const character = expression[index];
		if ("+-*/^".includes(character)) {
			tokens.push({ type: "operator", value: character as "+" | "-" | "*" | "/" | "^" });
			index += 1;
			continue;
		}
		if (character === "(") tokens.push({ type: "left" });
		else if (character === ")") tokens.push({ type: "right" });
		else
			throw new GraphExpressionError(
				`“${character}” is not supported. Use x, numbers, operators, and the listed functions.`,
			);
		index += 1;
	}
	if (tokens.length > 128)
		throw new GraphExpressionError("Use a shorter function expression.");
	return tokens;
}

function parseExpression(tokens: Token[]): ExpressionNode {
	let cursor = 0;
	const peek = () => tokens[cursor];
	const take = () => tokens[cursor++];

	function primary(): ExpressionNode {
		const token = take();
		if (!token) throw new GraphExpressionError("Complete the function expression.");
		if (token.type === "number") return { type: "number", value: token.value };
		if (token.type === "left") {
			const value = additive();
			if (take()?.type !== "right")
				throw new GraphExpressionError("Add a closing parenthesis.");
			return value;
		}
		if (token.type === "name") {
			if (token.value === "x") return { type: "x" };
			if (token.value === "pi" || token.value === "π")
				return { type: "constant", value: Math.PI };
			if (token.value === "e") return { type: "constant", value: Math.E };
			if (!FUNCTIONS.has(token.value))
				throw new GraphExpressionError(`“${token.value}” is not a supported name.`);
			if (peek()?.type !== "left")
				throw new GraphExpressionError(
					`Write ${token.value} with parentheses, for example ${token.value}(x).`,
				);
			take();
			const value = additive();
			if (take()?.type !== "right")
				throw new GraphExpressionError("Add a closing parenthesis to the function.");
			return { type: "call", name: token.value, value };
		}
		if (token.type === "right")
			throw new GraphExpressionError("Check the parentheses in the function.");
		throw new GraphExpressionError("Add a value between the operators.");
	}

	function power(): ExpressionNode {
		const left = primary();
		const next = peek();
		if (next?.type === "operator" && next.value === "^") {
			take();
			return { type: "binary", operator: "^", left, right: unary() };
		}
		return left;
	}

	function unary(): ExpressionNode {
		const token = peek();
		if (token?.type === "operator" && (token.value === "+" || token.value === "-")) {
			take();
			return { type: "unary", operator: token.value, value: unary() };
		}
		return power();
	}

	function multiplicative(): ExpressionNode {
		let node = unary();
		while (true) {
			const next = peek();
			if (next?.type !== "operator" || (next.value !== "*" && next.value !== "/")) break;
			take();
			node = { type: "binary", operator: next.value, left: node, right: unary() };
		}
		return node;
	}

	function additive(): ExpressionNode {
		let node = multiplicative();
		while (true) {
			const next = peek();
			if (next?.type !== "operator" || (next.value !== "+" && next.value !== "-")) break;
			take();
			node = { type: "binary", operator: next.value, left: node, right: multiplicative() };
		}
		return node;
	}

	const root = additive();
	if (cursor < tokens.length) {
		if (peek()?.type === "right")
			throw new GraphExpressionError("Remove the unmatched closing parenthesis.");
		throw new GraphExpressionError(
			"Put an operator between values, for example 2*x.",
		);
	}
	return root;
}

function evaluateNode(node: ExpressionNode, x: number, mode: AngleMode): number {
	switch (node.type) {
		case "number":
		case "constant":
			return node.value;
		case "x":
			return x;
		case "unary": {
			const value = evaluateNode(node.value, x, mode);
			return node.operator === "-" ? -value : value;
		}
		case "binary": {
			const left = evaluateNode(node.left, x, mode);
			const right = evaluateNode(node.right, x, mode);
			switch (node.operator) {
				case "+": return left + right;
				case "-": return left - right;
				case "*": return left * right;
				case "/": return left / right;
				case "^": return left ** right;
			}
		return Number.NaN;
		}
		case "call": {
			const value = evaluateNode(node.value, x, mode);
			const angle = mode === "degrees" ? (value * Math.PI) / 180 : value;
		switch (node.name) {
			case "sin": return Math.sin(angle);
			case "cos": return Math.cos(angle);
			case "tan": return Math.tan(angle);
			case "sqrt": return Math.sqrt(value);
			case "log": return Math.log10(value);
			case "ln": return Math.log(value);
			case "abs": return Math.abs(value);
		}
		return Number.NaN;
	}
}
return Number.NaN;
}

export function compileFunctionExpression(
	source: string,
	mode: AngleMode = "radians",
): (x: number) => number {
	const root = parseExpression(tokenize(source));
	return (x) => {
		if (!Number.isFinite(x)) return Number.NaN;
		const value = evaluateNode(root, x, mode);
		return Number.isFinite(value) ? value : Number.NaN;
	};
}

function median(values: number[]): number {
	const middle = Math.floor(values.length / 2);
	return values.length % 2
		? values[middle]
		: (values[middle - 1] + values[middle]) / 2;
}

export function sampleFunctionGraph(
	evaluate: (x: number) => number,
	xMin: number,
	xMax: number,
	sampleCount = 601,
): GraphPlot {
	if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || xMin >= xMax)
		throw new RangeError("The x minimum must be less than the x maximum.");
	if (!Number.isInteger(sampleCount) || sampleCount < 2 || sampleCount > 2001)
		throw new RangeError("Use between 2 and 2,001 graph samples.");
	const points = Array.from({ length: sampleCount }, (_, index) => {
		const x = xMin + ((xMax - xMin) * index) / (sampleCount - 1);
		const y = evaluate(x);
		return Number.isFinite(y) ? { x, y } : null;
	});
	const finiteValues = points
		.filter((point): point is GraphPoint => point !== null)
		.map((point) => point.y);
	if (!finiteValues.length) return { segments: [], yMin: -1, yMax: 1 };

	const center = median([...finiteValues].sort((a, b) => a - b));
	const mad = median(finiteValues.map((value) => Math.abs(value - center)).sort((a, b) => a - b));
	const radius = Math.max(mad * 6, Math.abs(center) * 0.1, 1e-8);
	let yMin = Math.max(Math.min(...finiteValues), center - radius);
	let yMax = Math.min(Math.max(...finiteValues), center + radius);
	if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
		yMin = -1;
		yMax = 1;
	}
	if (yMin === yMax) {
		const padding = Math.max(1, Math.abs(yMin) * 0.1);
		yMin -= padding;
		yMax += padding;
	} else {
		const padding = (yMax - yMin) * 0.08;
		yMin -= padding;
		yMax += padding;
	}
	const ySpan = yMax - yMin;
	const segments: GraphPoint[][] = [];
	let segment: GraphPoint[] = [];
	const flush = () => {
		if (segment.length > 1) segments.push(segment);
		segment = [];
	};
	for (const point of points) {
		if (!point || point.y < yMin || point.y > yMax) {
			flush();
			continue;
		}
		const previous = segment[segment.length - 1];
		if (previous && Math.abs(point.y - previous.y) > ySpan * 0.9) flush();
		segment.push(point);
	}
	flush();
	return { segments, yMin, yMax };
}
