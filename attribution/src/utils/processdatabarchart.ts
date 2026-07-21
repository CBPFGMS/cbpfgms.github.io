import type {
	AllocationsData,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
} from "./processrawdata";
import type { BeneficiariesObject } from "./processrawdata";
import { constants } from "./constants";
import { sum } from "d3";
// import { GenderAndAge } from "./processrawdata";
import { simpleWarn } from "./warninvalid";

export type DatumBarChart = {
	type: number;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

type ProcessDataBarChartParams = {
	allocationsData: AllocationsData;
	year: number;
	funds: number[];
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
};

const { beneficiaryCategories } = constants;

function processDataBarChart({
	allocationsData,
	year,
	funds,
	totalBeneficiariesByPartnerData,
	totalBeneficiariesBySectorData,
}: ProcessDataBarChartParams): {
	dataOrganization: DatumBarChart[];
	dataSector: DatumBarChart[];
} {
	const dataOrganization: DatumBarChart[] = [];
	const dataSector: DatumBarChart[] = [];

	allocationsData.forEach(datum => {
		if (year === datum.year && funds.includes(datum.fund)) {
			const foundOrganization = dataOrganization.find(
				d => d.type === datum.organizationType,
			);

			if (!foundOrganization) {
				const type = datum.organizationType;
				const targeted = beneficiaryCategories.reduce(
					(acc, genderAndAge) => {
						acc[genderAndAge] = 0;
						return acc;
					},
					{} as BeneficiariesObject,
				);
				const reached = beneficiaryCategories.reduce(
					(acc, genderAndAge) => {
						acc[genderAndAge] = 0;
						return acc;
					},
					{} as BeneficiariesObject,
				);

				const obj: DatumBarChart = { type, targeted, reached };

				dataOrganization.push(obj);
			}

			datum.sectorData.forEach(sectorDatum => {
				const foundSector = dataSector.find(
					d => d.type === sectorDatum.sectorId,
				);

				if (!foundSector) {
					const type = sectorDatum.sectorId;
					const targeted = beneficiaryCategories.reduce(
						(acc, genderAndAge) => {
							acc[genderAndAge] = 0;
							return acc;
						},
						{} as BeneficiariesObject,
					);
					const reached = beneficiaryCategories.reduce(
						(acc, genderAndAge) => {
							acc[genderAndAge] = 0;
							return acc;
						},
						{} as BeneficiariesObject,
					);

					const obj: DatumBarChart = {
						type,
						targeted,
						reached,
					};

					dataSector.push(obj);
				}
			});
		}
	});

	dataOrganization.forEach(org => {
		funds.forEach(pf => {
			if (!totalBeneficiariesByPartnerData[year]) {
				simpleWarn(
					`Year ${year} not found in the totalBeneficiariesByPartner data`,
				);
				return;
			}

			if (!totalBeneficiariesByPartnerData[year][pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data for year ${year}`,
				);
				return;
			}

			const foundPartner = totalBeneficiariesByPartnerData[year][pf].find(
				totalPartners => totalPartners.partner === org.type,
			);
			if (foundPartner) {
				org.targeted.girls += foundPartner.girls.targeted;
				org.targeted.boys += foundPartner.boys.targeted;
				org.targeted.women += foundPartner.women.targeted;
				org.targeted.men += foundPartner.men.targeted;
				org.reached.girls += foundPartner.girls.reached;
				org.reached.boys += foundPartner.boys.reached;
				org.reached.women += foundPartner.women.reached;
				org.reached.men += foundPartner.men.reached;
			} else {
				simpleWarn(
					`Partner ${org.type} not found in totalBeneficiariesByPartner data`,
				);
			}
		});
	});

	dataSector.forEach(sect => {
		funds.forEach(pf => {
			if (!totalBeneficiariesBySectorData[year]) {
				simpleWarn(
					`Year ${year} not found in the totalBeneficiariesBySector data`,
				);
				return;
			}
			if (!totalBeneficiariesBySectorData[year][pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesBySector data for year ${year}`,
				);
				return;
			}

			const foundPartner = totalBeneficiariesBySectorData[year][pf].find(
				totalPartners => totalPartners.sector === sect.type,
			);
			if (foundPartner) {
				sect.targeted.girls += foundPartner.girls.targeted;
				sect.targeted.boys += foundPartner.boys.targeted;
				sect.targeted.women += foundPartner.women.targeted;
				sect.targeted.men += foundPartner.men.targeted;
				sect.reached.girls += foundPartner.girls.reached;
				sect.reached.boys += foundPartner.boys.reached;
				sect.reached.women += foundPartner.women.reached;
				sect.reached.men += foundPartner.men.reached;
			} else {
				simpleWarn(
					`Sector ${sect.type} not found in totalBeneficiariesBySector data`,
				);
			}
		});
	});

	dataOrganization.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);
	dataSector.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);

	return { dataOrganization, dataSector };
}

export default processDataBarChart;
