import { type ListObj } from "./makelists";

export function makeYearsList(dataArray: number[]): ListObj {
	const yearsList: ListObj = {};
	dataArray.forEach(year => {
		yearsList[year] = year.toString();
	});
	return yearsList;
}
