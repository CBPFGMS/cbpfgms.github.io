import type { Statuses } from "../components/MainContainer";
import type { Data } from "./processrawdata";
import { max } from "d3";

type ProcessDataPartnersParams = {
	data: Data;
	fund: number[];
	status: Statuses[];
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
}: ProcessDataPartnersParams): {
	dataPartners: PartnersDatum[];
	maxBudgetValue: number;
} {
	const dataPartners: PartnersDatum[] = [];

	data.forEach(datum => {
		if (fund.includes(datum.fund) && status.includes(datum.projectStatus)) {
			const foundPartner = dataPartners.find(
				d => d.partner === datum.organizationId,
			);
			const sectors = datum.sectorData.map(d => d.sectorId);
			if (foundPartner) {
				sectors.forEach(d => foundPartner.sectors.add(d));
				foundPartner.budget += datum.budget;
				foundPartner.projects.add(datum.projectId);
				foundPartner.funds.add(datum.fund);
			} else {
				dataPartners.push({
					partner: datum.organizationId,
					sectors: new Set(sectors),
					budget: datum.budget,
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
