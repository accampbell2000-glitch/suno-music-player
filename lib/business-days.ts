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
