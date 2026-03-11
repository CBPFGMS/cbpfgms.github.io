import type { Data } from "./processrawdata";
import type { List } from "./makelists";
import type { Statuses } from "../components/MainContainer";

type ProcessDataRegionsParams = {
	data: Data;
	fund: number[];
	lists: List;
	status: Statuses[];
};

export type RegionsDatum = {
	region: string;
	funds: Set<number>;
	budget: number;
	targeted: number;
};

function processDataRegions({
	data,
	fund,
	lists,
	status,
}: ProcessDataRegionsParams): RegionsDatum[] {
	const dataRegions: RegionsDatum[] = [];

	data.forEach(row => {
		if (fund.includes(row.fund) && status.includes(row.projectStatus)) {
			const thisRegion = lists.regions.find(d =>
				d.funds.has(row.fund),
			)?.regionName;
			if (thisRegion) {
				const foundRegion = dataRegions.find(
					d => d.region === thisRegion,
				);
				if (foundRegion) {
					foundRegion.funds.add(row.fund);
					foundRegion.budget += row.budget;
					foundRegion.targeted +=
						row.targeted.boys +
						row.targeted.girls +
						row.targeted.men +
						row.targeted.women;
				} else {
					dataRegions.push({
						region: thisRegion,
						funds: new Set([row.fund]),
						budget: row.budget,
						targeted:
							row.targeted.boys +
							row.targeted.girls +
							row.targeted.men +
							row.targeted.women,
					});
				}
			}
		}
	});

	return dataRegions;
}

export default processDataRegions;
