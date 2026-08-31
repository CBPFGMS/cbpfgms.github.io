import {
	Data,
	InDataLists,
	TotalBeneficiariesByBeneficiaryTypeData,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
} from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import { BeneficiariesObject } from "./processrawdata";
import constants from "./constants";
import { sum } from "d3";
import { simpleWarn } from "./warninvalid";
import flipObject from "./flipobject";

export type DatumBarChart = {
	type: number;
	fundsWithType: Set<number>;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

type ProcessDataBarChartParams = {
	data: Data;
	fund: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	inDataLists: InDataLists;
};

const { beneficiaryCategories } = constants;

function processDataBarChart({
	data,
	fund,
	implementationStatus,
	lists,
	totalBeneficiariesByPartnerData,
	totalBeneficiariesBySectorData,
	totalBeneficiariesByBeneficiaryTypeData,
	inDataLists,
}: ProcessDataBarChartParams): {
	dataOrganization: DatumBarChart[];
	dataSector: DatumBarChart[];
	dataBeneficiaryByType: DatumBarChart[];
} {
	const dataBeneficiaryByType: DatumBarChart[] = [];
	const dataOrganization: DatumBarChart[] = [];
	const dataSector: DatumBarChart[] = [];

	const numericStatuses = flipObject(lists.statuses);

	const statuses = implementationStatus.map(
		implSt => +numericStatuses[implSt as ImplementationStatuses],
	);

	const beneficiaryTypes = Object.keys(lists.beneficiaryTypes).map(d => +d);

	beneficiaryTypes.forEach(beneficiaryType => {
		dataBeneficiaryByType.push({
			type: beneficiaryType,
			fundsWithType: new Set(),
			targeted: beneficiaryCategories.reduce((acc, genderAndAge) => {
				acc[genderAndAge] = 0;
				return acc;
			}, {} as BeneficiariesObject),
			reached: beneficiaryCategories.reduce((acc, genderAndAge) => {
				acc[genderAndAge] = 0;
				return acc;
			}, {} as BeneficiariesObject),
		});
	});

	data.forEach(datum => {
		const thisStatus = lists.statuses[
			datum.projectStatusId
		] as ImplementationStatuses;
		if (
			implementationStatus.includes(thisStatus) &&
			fund.includes(datum.fund)
		) {
			const foundOrganization = dataOrganization.find(
				d => d.type === datum.organizationType,
			);

			if (foundOrganization) {
				foundOrganization.fundsWithType.add(datum.fund);
			} else {
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
				} else {
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
		fund.forEach(pf => {
			if (!org.fundsWithType.has(pf)) {
				return;
			}

			if (!totalBeneficiariesByPartnerData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data`,
				);
				return;
			}

			const thisFundData = totalBeneficiariesByPartnerData[pf];

			const allStatuses = [...inDataLists.statusesPerFund[pf]];
			const fundHasAllStatuses = allStatuses.every(pfStatus =>
				statuses.includes(pfStatus),
			);

			if (fundHasAllStatuses) {
				const foundPartner = thisFundData.all.find(
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
						`Partner ${org.type} not found in totalBeneficiariesByPartner data for fund ${pf}`,
					);
				}
			} else {
				statuses.forEach(st => {
					const foundPartner = thisFundData[st]?.find(
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
							`Partner ${org.type} not found in totalBeneficiariesByPartner data for fund ${pf} and status ${st}`,
						);
					}
				});
			}
		});
	});

	dataSector.forEach(sect => {
		fund.forEach(pf => {
			if (!sect.fundsWithType.has(pf)) {
				return;
			}

			if (!totalBeneficiariesBySectorData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesBySector data`,
				);
				return;
			}

			const thisFundData = totalBeneficiariesBySectorData[pf];

			const allStatuses = [...inDataLists.statusesPerFund[pf]];
			const fundHasAllStatuses = allStatuses.every(pfStatus =>
				statuses.includes(pfStatus),
			);

			if (fundHasAllStatuses) {
				const foundSector = thisFundData.all.find(
					totalSectors => totalSectors.sector === sect.type,
				);
				if (foundSector) {
					sect.targeted.girls += foundSector.girls.targeted;
					sect.targeted.boys += foundSector.boys.targeted;
					sect.targeted.women += foundSector.women.targeted;
					sect.targeted.men += foundSector.men.targeted;
					sect.reached.girls += foundSector.girls.reached;
					sect.reached.boys += foundSector.boys.reached;
					sect.reached.women += foundSector.women.reached;
					sect.reached.men += foundSector.men.reached;
				} else {
					simpleWarn(
						`Sector ${sect.type} not found in totalBeneficiariesByPartner data for fund ${pf}`,
					);
				}
			} else {
				statuses.forEach(st => {
					const foundSector = thisFundData[st]?.find(
						totalSectors => totalSectors.sector === sect.type,
					);
					if (foundSector) {
						sect.targeted.girls += foundSector.girls.targeted;
						sect.targeted.boys += foundSector.boys.targeted;
						sect.targeted.women += foundSector.women.targeted;
						sect.targeted.men += foundSector.men.targeted;
						sect.reached.girls += foundSector.girls.reached;
						sect.reached.boys += foundSector.boys.reached;
						sect.reached.women += foundSector.women.reached;
						sect.reached.men += foundSector.men.reached;
					} else {
						simpleWarn(
							`Sector ${sect.type} not found in totalBeneficiariesByPartner data for fund ${pf} and status ${st}`,
						);
					}
				});
			}
		});
	});

	dataBeneficiaryByType.forEach(benType => {
		fund.forEach(pf => {
			if (!inDataLists.fundsPerBeneficiaryType[benType.type].has(pf)) {
				return;
			}

			if (!totalBeneficiariesByBeneficiaryTypeData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data`,
				);
				return;
			}

			const thisFundData = totalBeneficiariesByBeneficiaryTypeData[pf];
			const allStatuses = [...inDataLists.statusesPerFund[pf]];
			const fundHasAllStatuses = allStatuses.every(pfStatus =>
				statuses.includes(pfStatus),
			);

			if (fundHasAllStatuses) {
				const foundBenType = thisFundData.all.find(
					totalBenType =>
						totalBenType.beneficiaryType === benType.type,
				);
				if (foundBenType) {
					benType.targeted.girls += foundBenType.girls.targeted;
					benType.targeted.boys += foundBenType.boys.targeted;
					benType.targeted.women += foundBenType.women.targeted;
					benType.targeted.men += foundBenType.men.targeted;
					benType.reached.girls += foundBenType.girls.reached;
					benType.reached.boys += foundBenType.boys.reached;
					benType.reached.women += foundBenType.women.reached;
					benType.reached.men += foundBenType.men.reached;
				} else {
					simpleWarn(
						`Beneficiary type ${benType.type} not found in totalBeneficiariesByBeneficiaryType data for fund ${pf}`,
					);
				}
			} else {
				statuses.forEach(st => {
					const foundBenType = thisFundData[st]?.find(
						totalBenType =>
							totalBenType.beneficiaryType === benType.type,
					);
					if (foundBenType) {
						benType.targeted.girls += foundBenType.girls.targeted;
						benType.targeted.boys += foundBenType.boys.targeted;
						benType.targeted.women += foundBenType.women.targeted;
						benType.targeted.men += foundBenType.men.targeted;
						benType.reached.girls += foundBenType.girls.reached;
						benType.reached.boys += foundBenType.boys.reached;
						benType.reached.women += foundBenType.women.reached;
						benType.reached.men += foundBenType.men.reached;
					} else {
						simpleWarn(
							`Beneficiary type ${benType.type} not found in totalBeneficiariesByBeneficiaryType data for fund ${pf} and status ${st}`,
						);
					}
				});
			}
		});
	});

	dataBeneficiaryByType.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);
	dataOrganization.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);
	dataSector.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);

	return { dataBeneficiaryByType, dataOrganization, dataSector };
}

export default processDataBarChart;
