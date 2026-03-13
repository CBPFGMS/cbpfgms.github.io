import type { Data } from "./processrawdata";
import { max } from "d3";

type ProcessDataPartnersParams = {
	data: Data;
	fund: number[];
	status: number[];
	sector: number[];
};

export type PartnersDatum = {
	partner: number;
	sectors: Set<number>;
	budget: number;
	projects: Set<number>;
	funds: Set<number>;
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
					}
				});
				foundPartner.projects.add(datum.projectId);
				foundPartner.funds.add(datum.fund);
			} else {
				let thisBudget = 0;
				const thisSectors = new Set<number>();
				datum.sectorData.forEach(d => {
					if (sector.includes(d.sectorId)) {
						thisSectors.add(d.sectorId);
						thisBudget += d.budget;
					}
				});
				dataPartners.push({
					partner: datum.organizationId,
					sectors: thisSectors,
					budget: thisBudget,
					funds: new Set([datum.fund]),
					projects: new Set([datum.projectId]),
				});
			}
		}
	});

	const maxBudgetValue = max(dataPartners, d => d.budget) || 0;

	return { dataPartners, maxBudgetValue };
}

export default processDataPartners;
