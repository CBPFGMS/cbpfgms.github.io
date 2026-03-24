import type { Data } from "./processrawdata";
import { max } from "d3";

type ProcessDataPartnersParams = {
	data: Data;
	fund: number[];
	status: number[];
	sector: number[];
};

type SectorDetailsDatum = {
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
	sectorsDetails: SectorDetailsDatum[];
};

function processDataPartners({
	data,
	fund,
	status,
	sector,
}: ProcessDataPartnersParams): {
	dataPartners: PartnersDatum[];
	maxBudgetValue: number;
} {
	const dataPartners: PartnersDatum[] = [];

	data.forEach(datum => {
		const sectors = datum.sectorData.map(d => d.sectorId);
		if (
			fund.includes(datum.fund) &&
			status.includes(datum.projectStatus) &&
			sectors.some(d => sector.includes(d))
		) {
			const foundPartner = dataPartners.find(
				d => d.partner === datum.organizationId,
			);

			if (foundPartner) {
				datum.sectorData.forEach(d => {
					if (sector.includes(d.sectorId)) {
						foundPartner.sectors.add(d.sectorId);
						foundPartner.budget += d.budget;

						const foundSectorInDetails =
							foundPartner.sectorsDetails.find(
								e =>
									e.sector === d.sectorId &&
									e.project === datum.projectId,
							);
						if (foundSectorInDetails) {
							foundSectorInDetails.budget += d.budget;
							foundSectorInDetails.fund = datum.fund;
						} else {
							foundPartner.sectorsDetails.push({
								sector: d.sectorId,
								budget: d.budget,
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
				datum.sectorData.forEach(d => {
					if (sector.includes(d.sectorId)) {
						thisSectors.add(d.sectorId);
						thisBudget += d.budget;
						thisSectorDetails.push({
							sector: d.sectorId,
							budget: d.budget,
							fund: datum.fund,
							project: datum.projectId,
						});
					}
				});
				dataPartners.push({
					partner: datum.organizationId,
					sectors: thisSectors,
					budget: thisBudget,
					funds: new Set([datum.fund]),
					projects: new Set([datum.projectId]),
					sectorsDetails: thisSectorDetails,
				});
			}
		}
	});

	const maxBudgetValue = max(dataPartners, d => d.budget) || 0;

	return { dataPartners, maxBudgetValue };
}

export default processDataPartners;
