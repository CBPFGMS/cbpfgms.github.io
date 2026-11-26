import type {
	AllocationsData,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
} from "./processrawdata";
import type { BeneficiariesObject } from "./processrawdata";
import { constants } from "./constants";
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
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	globalAttribution: number;
	hasUS: boolean;
};

const { beneficiaryCategories, USProjectsString, firstNSFTYear } = constants;

function processDataBarChart({
	allocationsData,
	year,
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
		if (year === datum.year) {
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

				const obj: DatumBarChart = {
					type,
					targeted,
					reached,
				};

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
		if (!totalBeneficiariesByPartnerData[year]) {
			simpleWarn(
				`Year ${year} not found in the totalBeneficiariesByPartner data`,
			);
			return;
		}

		const foundPartner = totalBeneficiariesByPartnerData[year].find(
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
		} else {
			simpleWarn(
				`Partner ${org.type} not found in the totalBeneficiariesByPartner data`,
			);
		}
	});

	dataSector.forEach(sect => {
		if (!totalBeneficiariesBySectorData[year]) {
			simpleWarn(
				`Year ${year} not found in the totalBeneficiariesBySector data`,
			);
			return;
		}

		const foundSector = totalBeneficiariesBySectorData[year].find(
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
		} else {
			simpleWarn(
				`Sector ${sect.type} not found in the totalBeneficiariesByPartner data`,
			);
		}
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

	return { dataOrganization, dataSector };
}

export default processDataBarChart;
