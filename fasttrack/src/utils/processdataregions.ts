import type {
	Data,
	InDataLists,
	TotalBeneficiariesData,
} from "./processrawdata";
import type { List } from "./makelists";
import { simpleWarn } from "./warninvalid";
import { capToFundTotal, sumSelectedStatuses } from "./processdatatopfigures";
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

	//same rule as the top figures: unique ("all") figures only when every
	//status in the filter is selected, otherwise the sum of the selected
	//statuses, limited to each fund's unique total
	const allStatusesSelected = [...inDataLists.projectStatuses].every(st =>
		status.includes(st),
	);

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			return;
		}

		//the region comes from the regions master list, not from the projects
		//in the selection, so every fund counted in the top figures is also
		//counted here and the regions always add up to the top figures
		const thisRegionName = lists.regions.find(d =>
			d.funds.has(pf),
		)?.regionName;

		if (!thisRegionName) {
			simpleWarn(`Pooled fund code ${pf} not found in the regions data`);
			return;
		}

		const fundFigures = allStatusesSelected
			? totalBeneficiariesData[pf].all
			: capToFundTotal(
					sumSelectedStatuses(totalBeneficiariesData, pf, status),
					totalBeneficiariesData[pf].all,
				);

		if (
			!fundFigures.targeted &&
			!fundFigures.reached &&
			!fundFigures.reachedProjects
		) {
			return;
		}

		let thisRegion = dataRegions.find(d => d.region === thisRegionName);

		if (!thisRegion) {
			thisRegion = {
				region: thisRegionName,
				funds: new Set(),
				budget: 0,
				targeted: 0,
				reached: 0,
				reachedProjects: 0,
			};
			dataRegions.push(thisRegion);
		}

		thisRegion.funds.add(pf);
		thisRegion.targeted += fundFigures.targeted;
		thisRegion.reached += fundFigures.reached;
		thisRegion.reachedProjects += fundFigures.reachedProjects;
	});

	return dataRegions;
}

export default processDataRegions;
