import type {
	Data,
	InDataLists,
	TotalBeneficiariesData,
} from "./processrawdata";
import type { List } from "./makelists";
import { simpleWarn } from "./warninvalid";
import type { Tranche } from "../components/MainContainer";

type ProcessDataRegionsParams = {
	data: Data;
	fund: number[];
	lists: List;
	status: number[];
	totalBeneficiariesData: TotalBeneficiariesData;
	tranche: Tranche;
	inDataLists: InDataLists;
};

export type RegionsDatum = {
	region: string;
	funds: Set<number>;
	budget: number;
	targeted: number;
	reached: number;
	reachedProjects: number;
};

function processDataRegions({
	data,
	fund,
	lists,
	status,
	totalBeneficiariesData,
	tranche,
	inDataLists,
}: ProcessDataRegionsParams): RegionsDatum[] {
	const dataRegions: RegionsDatum[] = [];

	data.forEach(row => {
		if (
			fund.includes(row.fund) &&
			status.includes(row.projectStatus) &&
			(tranche === "all" ||
				inDataLists.projectsPerTranche[tranche]?.has(row.projectCode))
		) {
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
						reached: 0,
						reachedProjects: 0,
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
			thisRegion.targeted += totalBeneficiariesData[pf].targeted;
			thisRegion.reached += totalBeneficiariesData[pf].reached;
			thisRegion.reachedProjects +=
				totalBeneficiariesData[pf].reachedProjects;
		} else {
			simpleWarn(`Pooled fund code ${pf} not found in the regions data`);
		}
	});

	return dataRegions;
}

export default processDataRegions;
