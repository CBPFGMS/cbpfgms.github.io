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

	//total of each region's funds with all statuses (used for the cap)
	const regionAllTotals = new Map<
		RegionsDatum,
		{ targeted: number; reached: number; reachedProjects: number }
	>();

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			return;
		}

		const thisRegion = dataRegions.find(d => d.funds.has(pf));

		if (!thisRegion) {
			simpleWarn(`Pooled fund code ${pf} not found in the regions data`);
			return;
		}

		const allStatuses = [
			...((tranche === "all"
				? inDataLists.statusesPerFund[pf]
				: inDataLists.statusesPerFundPerTranche[tranche]?.[pf]) ?? []),
		];
		const fundHasAllStatuses = allStatuses.every(pfStatus =>
			status.includes(pfStatus),
		);

		const regionAll = regionAllTotals.get(thisRegion) ?? {
			targeted: 0,
			reached: 0,
			reachedProjects: 0,
		};
		regionAll.targeted += totalBeneficiariesData[pf].all.targeted;
		regionAll.reached += totalBeneficiariesData[pf].all.reached;
		regionAll.reachedProjects += totalBeneficiariesData[pf].all.reachedProjects;
		regionAllTotals.set(thisRegion, regionAll);

		if (fundHasAllStatuses) {
			thisRegion.targeted += totalBeneficiariesData[pf].all.targeted;
			thisRegion.reached += totalBeneficiariesData[pf].all.reached;
			thisRegion.reachedProjects +=
				totalBeneficiariesData[pf].all.reachedProjects;
		} else {
			status.forEach(st => {
				thisRegion.targeted +=
					totalBeneficiariesData[pf][st]?.targeted || 0;
				thisRegion.reached +=
					totalBeneficiariesData[pf][st]?.reached || 0;
				thisRegion.reachedProjects +=
					totalBeneficiariesData[pf][st]?.reachedProjects || 0;
			});
		}
	});

	//statuses can overlap (same people in several statuses): a subset
	//of statuses can never be higher than the region total with all statuses
	regionAllTotals.forEach((regionAll, region) => {
		if (regionAll.targeted)
			region.targeted = Math.min(region.targeted, regionAll.targeted);
		if (regionAll.reached)
			region.reached = Math.min(region.reached, regionAll.reached);
		if (regionAll.reachedProjects)
			region.reachedProjects = Math.min(
				region.reachedProjects,
				regionAll.reachedProjects,
			);
	});

	return dataRegions;
}

export default processDataRegions;
