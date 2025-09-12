import { timeFormat } from "d3";
import { select } from "d3";

export function createTopText(
	minDate: Date,
	maxDate: Date,
	maxNumberOfCalls: number
) {
	const formatDate = timeFormat("%B %d, %Y");
	select("#fromDate").text(formatDate(minDate));
	select("#toDate").text(formatDate(maxDate));
	const daysDiff = Math.ceil(
		(maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
	);
	select("#numberOfDays").text(daysDiff);
	select("#maxNumberOfCalls").text(maxNumberOfCalls);
}
