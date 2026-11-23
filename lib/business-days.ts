export type BusinessDaysCalculation = {
	businessDays: number | string;
	calendarDays: number | string;
	weekendDays: number | string;
	countingRule: string;
	validation: string;
};

const MILLISECONDS_PER_DAY = 86_400_000;
const COUNTING_RULE =
	"The earlier date is not counted; the later date is counted if it is a weekday. Public holidays are not excluded.";

function parseDate(value: string | undefined): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (year < 1 || year > 9999) return null;

	const date = new Date(0);
	date.setUTCFullYear(year, month - 1, day);
	date.setUTCHours(0, 0, 0, 0);
	return date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
		? date
		: null;
}

function emptyResult(validation: string): BusinessDaysCalculation {
	return {
		businessDays: "",
		calendarDays: "",
		weekendDays: "",
		countingRule: "",
		validation,
	};
}

export function toIso(date: Date): string {
	const year = String(date.getUTCFullYear()).padStart(4, "0");
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function laterOfDates(
	startInput: string | undefined,
	endInput: string | undefined,
): Date | null {
	const start = parseDate(startInput);
	const end = parseDate(endInput);
	if (!start || !end) return null;
	return start <= end ? end : start;
}

export type BusinessDaysFromCalculation = {
	businessDays: number;
	calendarDays: number;
	weekendDays: number;
	resultDate: string;
	weekday: string;
	countingRule: string;
	validation: string;
};

function emptyFromResult(validation: string): BusinessDaysFromCalculation {
	return {
		businessDays: 0,
		calendarDays: 0,
		weekendDays: 0,
		resultDate: "",
		weekday: "",
		countingRule: "",
		validation,
	};
}

export function calculateBusinessDaysFrom(
	startInput: string | undefined,
	directionInput: string | undefined,
	amountInput: string | number | undefined,
): BusinessDaysFromCalculation {
	const start = parseDate(startInput);
	if (!start)
		return emptyFromResult(
			"Enter a valid starting date in YYYY-MM-DD format, such as 2026-11-09.",
		);

	const direction = directionInput === "subtract" ? -1 : 1;
	const amount = Number(amountInput);
	if (!Number.isInteger(amount) || amount < 0 || amount > 250000)
		return emptyFromResult(
			"Enter a whole number of business days from 0 to 250,000.",
		);

	let result = new Date(start.getTime());
	let remaining = amount;
	while (remaining > 0) {
		result = new Date(result.getTime() + direction * MILLISECONDS_PER_DAY);
		const weekday = result.getUTCDay();
		if (weekday !== 0 && weekday !== 6) remaining--;
		if (result.getUTCFullYear() < 1 || result.getUTCFullYear() > 9999)
			return emptyFromResult(
				"That result is outside the supported date range (years 1 through 9999).",
			);
	}

	const earlier = direction === 1 ? start : result;
	const later = direction === 1 ? result : start;
	const span = calculateBusinessDays(toIso(earlier), toIso(later));
	const weekdayName = result.toLocaleDateString("en-US", {
		timeZone: "UTC",
		weekday: "long",
	});

	return {
		businessDays: amount,
		calendarDays: Number(span.calendarDays),
		weekendDays: Number(span.weekendDays),
		resultDate: toIso(result),
		weekday: weekdayName,
		countingRule:
			direction === 1
				? "Business days are added one weekday at a time, starting the day after the start date and skipping Saturdays and Sundays. Public holidays are not excluded."
				: "Business days are subtracted one weekday at a time, starting the day before the start date and skipping Saturdays and Sundays. Public holidays are not excluded.",
		validation: "",
	};
}

export function calculateBusinessDays(
	startInput: string | undefined,
	endInput: string | undefined,
): BusinessDaysCalculation {
	const start = parseDate(startInput);
	const end = parseDate(endInput);
	if (!start || !end)
		return emptyResult("Enter both dates in YYYY-MM-DD format, such as 2026-11-09.");

	const earlier = start <= end ? start : end;
	const later = start <= end ? end : start;
	const calendarDays = Math.round(
		(later.getTime() - earlier.getTime()) / MILLISECONDS_PER_DAY,
	);
	let businessDays = Math.floor(calendarDays / 7) * 5;
	const remainingDays = calendarDays % 7;
	for (let offset = 1; offset <= remainingDays; offset++) {
		const weekday = (earlier.getUTCDay() + offset) % 7;
		if (weekday !== 0 && weekday !== 6) businessDays++;
	}

	return {
		businessDays,
		calendarDays,
		weekendDays: calendarDays - businessDays,
		countingRule: COUNTING_RULE,
		validation: "",
	};
}
