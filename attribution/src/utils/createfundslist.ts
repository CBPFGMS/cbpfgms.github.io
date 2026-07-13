import type { List } from "./makelists";

type CreateFundsListParams = {
	funds: number[];
	lists: List;
};

function createFundsList({ funds, lists }: CreateFundsListParams): string {
	const sortedFundNames = funds
		.map(fund => lists.fundNames[fund])
		.sort((a, b) => a.localeCompare(b));
	const fundsList =
		sortedFundNames.length === 1
			? sortedFundNames[0]
			: sortedFundNames.slice(0, -1).join(", ") +
				" and " +
				sortedFundNames.slice(-1);
	return fundsList;
}

export default createFundsList;
