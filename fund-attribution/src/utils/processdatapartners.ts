import type { AllocationsData } from "./processrawdata";
import { max } from "d3";
import { constants } from "./constants";

type ProcessDataPartnersParams = {
	allocationsData: AllocationsData;
	sector: number[];
	year: number;
	globalAttribution: number;
	hasUS: boolean;
};

type SectorDetailsDatum = {
	sector: number;
	budget: number;
};
type SectorDetailsDatumProject = {
	sector: number;
	budget: number;
	project: number;
};

export type PartnersDatum = {
	partner: number;
	sectors: Set<number>;
	budget: number;
	projects: Set<number>;
	sectorsDetailsForProjects: SectorDetailsDatumProject[];
	sectorsDetails: SectorDetailsDatum[];
};

const { USProjectsString } = constants;

function processDataPartners({
	allocationsData,
	sector,
	year,
	globalAttribution,
	hasUS,
}: ProcessDataPartnersParams): {
	data: PartnersDatum[];
	maxBudgetValue: number;
} {
	const data: PartnersDatum[] = [];

	allocationsData.forEach(datum => {
		if (!hasUS && datum.projectCode.includes(USProjectsString)) {
			return;
		}
		const sectors = datum.sectorData.map(d => d.sectorId);
		if (sectors.some(d => sector.includes(d)) && year === datum.year) {
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
						} else {
							foundPartner.sectorsDetails.push({
								sector: d.sectorId,
								budget: attributedBudget,
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
						} else {
							foundPartner.sectorsDetailsForProjects.push({
								sector: d.sectorId,
								budget: attributedBudget,
								project: datum.projectId,
							});
						}
					}
				});
				foundPartner.projects.add(datum.projectId);
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
						} else {
							thisSectorDetails.push({
								sector: d.sectorId,
								budget: attributedBudget,
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
						} else {
							thisSectorDetailsForProjects.push({
								sector: d.sectorId,
								budget: attributedBudget,
								project: datum.projectId,
							});
						}
					}
				});
				data.push({
					partner: datum.organizationId,
					sectors: thisSectors,
					budget: thisBudget,
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
