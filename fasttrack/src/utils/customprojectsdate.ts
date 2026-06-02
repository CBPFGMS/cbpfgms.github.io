export function getCustomProjectsDate(today: Date): string {
	const months: string[] = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	const currentDay = today.getDate();

	// Determine the target month offset
	// If > 7: We want the last day of the past month (offset = 0)
	// If <= 7: We want the last day of 2 months ago (offset = -1)
	const monthOffset = currentDay > 7 ? 0 : -1;

	// Passing 0 as the day gives us the last day of the specified month
	const targetDate = new Date(
		today.getFullYear(),
		today.getMonth() + monthOffset,
		0,
	);

	const lastDay = targetDate.getDate();
	const targetMonthName = months[targetDate.getMonth()];

	// Add the correct ordinal suffix (st, nd, rd, th)
	const suffix = getOrdinalSuffix(lastDay);

	return `${lastDay}${suffix} ${targetMonthName}`;
}

// Helper function to get "st", "nd", "rd", or "th"
function getOrdinalSuffix(day: number): string {
	if (day > 3 && day < 21) return "th";
	switch (day % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}
