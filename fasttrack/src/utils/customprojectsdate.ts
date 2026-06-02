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
	const monthsToSubtract = currentDay > 7 ? 1 : 2;
	const targetDate = new Date(
		today.getFullYear(),
		today.getMonth() - monthsToSubtract,
		1,
	);
	const targetMonthIndex = targetDate.getMonth();
	const targetMonthName = months[targetMonthIndex];

	const dayString = targetMonthIndex === 1 ? "28th" : "30th";

	return `${dayString} ${targetMonthName}`;
}
