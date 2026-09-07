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
	fundsWithType: Set<number>;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

type ProcessDataBarChartParams = {
	allocationsData: AllocationsData;
	year: number;
	funds: number[];
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	globalAttribution: number;
	hasUS: boolean;
};

const { beneficiaryCategories, USProjectsString, firstNSFTYear } = constants;

function processDataBarChart({
	allocationsData,
	year,
	funds,
	totalBeneficiariesByPartnerData,
	totalBeneficiariesBySectorData,
	globalAttribution,
	hasUS,
}: ProcessDataBarChartParams): {
	dataOrganization: DatumBarChart[];
	dataSector: DatumBarChart[];
} {
	const dataOrganization: DatumBarChart[] = [];
	const dataSector: DatumBarChart[] = [];

	const targetKey =
		year >= firstNSFTYear && !hasUS ? "targetedWithoutUS" : "targeted";
	const reachedKey =
		year >= firstNSFTYear && !hasUS ? "reachedWithoutUS" : "reached";

	allocationsData.forEach(datum => {
		if (!hasUS && datum.projectCode.includes(USProjectsString)) {
			return;
		}
		if (year === datum.year && funds.includes(datum.fund)) {
			const foundOrganization = dataOrganization.find(
				d => d.type === datum.organizationType,
			);

			if (foundOrganization) {
				foundOrganization.fundsWithType.add(datum.fund);
			}

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

				const obj: DatumBarChart = {
					type,
					targeted,
					reached,
					fundsWithType: new Set([datum.fund]),
				};

				dataOrganization.push(obj);
			}

			datum.sectorData.forEach(sectorDatum => {
				const foundSector = dataSector.find(
					d => d.type === sectorDatum.sectorId,
				);

				if (foundSector) {
					foundSector.fundsWithType.add(datum.fund);
				}

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
						fundsWithType: new Set([datum.fund]),
					};

					dataSector.push(obj);
				}
			});
		}
	});

	dataOrganization.forEach(org => {
		funds.forEach(pf => {
			if (!org.fundsWithType.has(pf)) {
				return;
			}

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
				org.targeted.girls += foundPartner.girls[targetKey] || 0;
				org.targeted.boys += foundPartner.boys[targetKey] || 0;
				org.targeted.women += foundPartner.women[targetKey] || 0;
				org.targeted.men += foundPartner.men[targetKey] || 0;
				org.reached.girls += foundPartner.girls[reachedKey] || 0;
				org.reached.boys += foundPartner.boys[reachedKey] || 0;
				org.reached.women += foundPartner.women[reachedKey] || 0;
				org.reached.men += foundPartner.men[reachedKey] || 0;
			}
		});
	});

	dataSector.forEach(sect => {
		funds.forEach(pf => {
			if (!sect.fundsWithType.has(pf)) {
				return;
			}

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

			const foundSector = totalBeneficiariesBySectorData[year][pf].find(
				totalSectors => totalSectors.sector === sect.type,
			);
			
			if (foundSector) {
				sect.targeted.girls += foundSector.girls[targetKey] || 0;
				sect.targeted.boys += foundSector.boys[targetKey] || 0;
				sect.targeted.women += foundSector.women[targetKey] || 0;
				sect.targeted.men += foundSector.men[targetKey] || 0;
				sect.reached.girls += foundSector.girls[reachedKey] || 0;
				sect.reached.boys += foundSector.boys[reachedKey] || 0;
				sect.reached.women += foundSector.women[reachedKey] || 0;
				sect.reached.men += foundSector.men[reachedKey] || 0;
			}
		});
	});

	dataOrganization.forEach(org => {
		org.reached.girls *= globalAttribution;
		org.reached.boys *= globalAttribution;
		org.reached.women *= globalAttribution;
		org.reached.men *= globalAttribution;
		org.targeted.girls *= globalAttribution;
		org.targeted.boys *= globalAttribution;
		org.targeted.women *= globalAttribution;
		org.targeted.men *= globalAttribution;
	});

	dataSector.forEach(sect => {
		sect.reached.girls *= globalAttribution;
		sect.reached.boys *= globalAttribution;
		sect.reached.women *= globalAttribution;
		sect.reached.men *= globalAttribution;
		sect.targeted.girls *= globalAttribution;
		sect.targeted.boys *= globalAttribution;
		sect.targeted.women *= globalAttribution;
		sect.targeted.men *= globalAttribution;
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
