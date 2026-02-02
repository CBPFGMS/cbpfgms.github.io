import * as d3 from "d3";
import { readFileSync } from "fs";
import { writeFileSync } from "fs";

const years = d3.range(2015, 2027);
const levels = d3.range(1, 7);

years.forEach(year => {
	const csvRaw = readFileSync(`./ProjectSummaryAggV2_${year}.csv`, "utf8");
	const csv = d3.csvParse(csvRaw);
	csv.forEach(row => {
		levels.forEach(level => {
			if (row[`AdmLocBenClustAgg${level}`] !== "") {
				row[`AdmLocBenReachedClustAgg${level}`] = multiplyNumbers(
					row[`AdmLocBenClustAgg${level}`],
				);
			} else {
				row[`AdmLocBenReachedClustAgg${level}`] = null;
			}
		});
	});
	const csvString = d3.csvFormat(csv);
	writeFileSync(`./ProjectSummaryAggV2_${year}.csv`, csvString, "utf8");
});

function multiplyNumbers(str) {
	// Generate a random factor between 0.75 and 1.25
	const randomFactor = Math.random() * 0.25 + 0.8;

	// Function to process a single group of numbers
	function processGroup(group) {
		return group
			.split("##")
			.map(num => Math.round(Number(num) * randomFactor))
			.join("##");
	}

	// Check if the string contains the triple pipeline separator
	if (str.includes("|||")) {
		const parts = str.split("|||");
		return parts.map(processGroup).join("|||");
	} else {
		return processGroup(str);
	}
}
