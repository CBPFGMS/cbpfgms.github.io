import type { List } from "./makelists";

type CreateDonorsListParams = {
	donors: number[];
	lists: List;
};

function createDonorsList({ donors, lists }: CreateDonorsListParams): string {
	const sortedDonorsNames = donors
		.map(fund => lists.donorGMSNames[fund])
		.sort((a, b) => a.localeCompare(b));
	const donorsList =
		sortedDonorsNames.length === 1
			? sortedDonorsNames[0]
			: sortedDonorsNames.slice(0, -1).join(", ") +
				" and " +
				sortedDonorsNames.slice(-1);
	return donorsList;
}

export default createDonorsList;
