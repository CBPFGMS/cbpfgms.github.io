import type { AllocationsData } from "./processrawdata";
import { max } from "d3";

type ProcessDataPartnersParams = {
	allocationsData: AllocationsData;
	funds: number[];
	sector: number[];
	year: number;
	globalAttribution: number;
};

type SectorDetailsDatum = {
	sector: number;
	budget: number;
	fund: Set<number>;
};
type SectorDetailsDatumProject = {
	sector: number;
	budget: number;
	fund: number;
	project: number;
};

export type PartnersDatum = {
	partner: number;
	sectors: Set<number>;
	budget: number;
	projects: Set<number>;
	funds: Set<number>;
	sectorsDetailsForProjects: SectorDetailsDatumProject[];
	sectorsDetails: SectorDetailsDatum[];
};

function processDataPartners({
	allocationsData,
	funds,
	sector,
	year,
	globalAttribution,
}: ProcessDataPartnersParams): {
	data: PartnersDatum[];
	maxBudgetValue: number;
} {
	const data: PartnersDatum[] = [];

	allocationsData.forEach(datum => {
		const sectors = datum.sectorData.map(d => d.sectorId);
		if (
			funds.includes(datum.fund) &&
			sectors.some(d => sector.includes(d)) &&
			year === datum.year
		) {
			const foundPartner = data.find(
				d => d.partner === datum.organizationId,
			);

			if (foundPartner) {
				datum.sectorData.forEach(d => {
					if (sector.includes(d.sectorId)) {
						const attributedBudget = d.budget * globalAttribution;

						foundPartner.sectors.add(d.sectorId);
						foundPartner.budget += attributedBudget;

						const foundSectorInDetails =
							foundPartner.sectorsDetails.find(
								e => e.sector === d.sectorId,
							);
						if (foundSectorInDetails) {
							foundSectorInDetails.budget += attributedBudget;
							foundSectorInDetails.fund.add(datum.fund);
						} else {
							foundPartner.sectorsDetails.push({
								sector: d.sectorId,
								budget: attributedBudget,
								fund: new Set([datum.fund]),
							});
						}

						const foundSectorInDetailsForProjects =
							foundPartner.sectorsDetailsForProjects.find(
								e =>
									e.sector === d.sectorId &&
									e.project === datum.projectId,
							);
						if (foundSectorInDetailsForProjects) {
							foundSectorInDetailsForProjects.budget +=
								attributedBudget;
							foundSectorInDetailsForProjects.fund = datum.fund;
						} else {
							foundPartner.sectorsDetailsForProjects.push({
								sector: d.sectorId,
								budget: attributedBudget,
								fund: datum.fund,
								project: datum.projectId,
							});
						}
					}
				});
				foundPartner.projects.add(datum.projectId);
				foundPartner.funds.add(datum.fund);
			} else {
				let thisBudget = 0;
				const thisSectors = new Set<number>();
				const thisSectorDetails: SectorDetailsDatum[] = [];
				const thisSectorDetailsForProjects: SectorDetailsDatumProject[] =
					[];
				datum.sectorData.forEach(d => {
					if (sector.includes(d.sectorId)) {
						const attributedBudget = d.budget * globalAttribution;

						thisSectors.add(d.sectorId);
						thisBudget += attributedBudget;

						const foundSectorInDetails = thisSectorDetails.find(
							e => e.sector === d.sectorId,
						);
						if (foundSectorInDetails) {
							foundSectorInDetails.budget += attributedBudget;
							foundSectorInDetails.fund.add(datum.fund);
						} else {
							thisSectorDetails.push({
								sector: d.sectorId,
								budget: attributedBudget,
								fund: new Set([datum.fund]),
							});
						}
						const foundSectorInDetailsForProjects =
							thisSectorDetailsForProjects.find(
								e =>
									e.sector === d.sectorId &&
									e.project === datum.projectId,
							);
						if (foundSectorInDetailsForProjects) {
							foundSectorInDetailsForProjects.budget +=
								attributedBudget;
							foundSectorInDetailsForProjects.fund = datum.fund;
						} else {
							thisSectorDetailsForProjects.push({
								sector: d.sectorId,
								budget: attributedBudget,
								fund: datum.fund,
								project: datum.projectId,
							});
						}
					}
				});
				data.push({
					partner: datum.organizationId,
					sectors: thisSectors,
					budget: thisBudget,
					funds: new Set([datum.fund]),
					projects: new Set([datum.projectId]),
					sectorsDetailsForProjects: thisSectorDetailsForProjects,
					sectorsDetails: thisSectorDetails,
				});
			}
		}
	});

	const maxBudgetValue = max(data, d => d.budget) || 0;

	return { data, maxBudgetValue };
}

export default processDataPartners;
