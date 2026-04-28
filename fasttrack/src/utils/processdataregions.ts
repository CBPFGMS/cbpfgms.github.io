import type {
	Data,
	InDataLists,
	TotalBeneficiariesData,
} from "./processrawdata";
import type { List } from "./makelists";
import { simpleWarn } from "./warninvalid";

type ProcessDataRegionsParams = {
	data: Data;
	fund: number[];
	lists: List;
	status: number[];
	totalBeneficiariesData: TotalBeneficiariesData;
	inDataLists: InDataLists;
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
	inDataLists,
	totalBeneficiariesData,
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
				} else {
					dataRegions.push({
						region: thisRegion,
						funds: new Set([row.fund]),
						budget: row.budget,
						targeted: 0,
					});
				}
			}
		}
	});

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			return;
		}

		const thisRegion = dataRegions.find(d => d.funds.has(pf));
		if (thisRegion) {
			const allStatuses = [...inDataLists.statusesPerFund[pf]];
			const fundHasAllStatuses = allStatuses.every(pfStatus =>
				status.includes(pfStatus),
			);
			if (fundHasAllStatuses) {
				thisRegion.targeted += totalBeneficiariesData[pf].all;
			} else {
				status.forEach(st => {
					thisRegion.targeted += totalBeneficiariesData[pf][st] || 0;
				});
			}
		} else {
			simpleWarn(`Pooled fund code ${pf} not found in the regions data`);
		}
	});

	return dataRegions;
}

export default processDataRegions;
