import type { Charts } from "../components/MainContainer";
import type { List } from "./makelists";
import type { InDataLists } from "./processrawdata";

function setFundsList(
	fund: number[],
	lists: List,
	inDataLists: InDataLists,
	from: Charts
): string {
	return fund.length === inDataLists.funds.size
		? `all funds selected${
				from === "timeline"
					? " (select a fund for highlighting the timeline)"
					: ""
		  }`
		: fund.reduce(function (acc, curr, index) {
				return (
					acc +
					(index >= fund.length - 2
						? index > fund.length - 2
							? lists.fundNames[curr]
							: lists.fundNames[curr] + " and "
						: lists.fundNames[curr] + ", ")
				);
		  }, "");
}

export default setFundsList;
