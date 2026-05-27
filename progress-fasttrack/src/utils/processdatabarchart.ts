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
// import { GenderAndAge } from "./processrawdata";
import { simpleWarn } from "./warninvalid";
import flipObject from "./flipobject";

export type DatumBarChart = {
	type: number;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

export type BeneficiaryTypesList = (typeof beneficiariesSplitOrder)[number];

type ProcessDataBarChartParams = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	inDataLists: InDataLists;
};

// type BeneficiariesEntry = [
// 	key: keyof BeneficiariesObject,
// 	value: BeneficiariesObject[keyof BeneficiariesObject],
// ];

const { beneficiariesSplitOrder, beneficiaryCategories } = constants;

function processDataBarChart({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
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

	beneficiariesSplitOrder.forEach(type => {
		const targeted = beneficiaryCategories.reduce((acc, genderAndAge) => {
			acc[genderAndAge] = 0;
			return acc;
		}, {} as BeneficiariesObject);
		const reached = beneficiaryCategories.reduce((acc, genderAndAge) => {
			acc[genderAndAge] = 0;
			return acc;
		}, {} as BeneficiariesObject);
		const obj: DatumBarChart = { type, targeted, reached };

		dataBeneficiaryByType.push(obj);
	});

	const numericStatuses = flipObject(lists.statuses);

	const statuses = implementationStatus.map(
		implSt => +numericStatuses[implSt as ImplementationStatuses],
	);

	data.forEach(datum => {
		const thisStatus = lists.statuses[
			datum.projectStatusId
		] as ImplementationStatuses;
		if (
			implementationStatus.includes(thisStatus) &&
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			// for (const type in datum.reachedByBeneficiaryType) {
			// 	const foundType = dataBeneficiaryByType.find(
			// 		d => d.type === parseInt(type),
			// 	);
			// 	if (foundType) {
			// 		beneficiaryCategories.forEach(genderAndAge => {
			// 			foundType.reached[genderAndAge] +=
			// 				datum.reachedByBeneficiaryType[
			// 					+type as BeneficiaryTypesList
			// 				][genderAndAge];
			// 		});
			// 	}
			// }
			// for (const type in datum.targetedByBeneficiaryType) {
			// 	const foundType = dataBeneficiaryByType.find(
			// 		d => d.type === parseInt(type),
			// 	);
			// 	if (foundType) {
			// 		beneficiaryCategories.forEach(genderAndAge => {
			// 			foundType.targeted[genderAndAge] +=
			// 				datum.targetedByBeneficiaryType[
			// 					+type as BeneficiaryTypesList
			// 				][genderAndAge];
			// 		});
			// 	}
			// }

			const foundOrganization = dataOrganization.find(
				d => d.type === datum.organizationType,
			);

			if (foundOrganization) {
				// for (const genderAndAge in datum.reached) {
				// 	foundOrganization.reached[genderAndAge as GenderAndAge] +=
				// 		datum.reached[genderAndAge as GenderAndAge];
				// }
				// for (const genderAndAge in datum.targeted) {
				// 	foundOrganization.targeted[genderAndAge as GenderAndAge] +=
				// 		datum.targeted[genderAndAge as GenderAndAge];
				// }
			} else {
				const type = datum.organizationType;
				// const targeted = (
				// 	Object.entries(datum.targeted) as BeneficiariesEntry[]
				// ).reduce((acc, [key, value]) => {
				// 	acc[key] = value;
				// 	return acc;
				// }, {} as BeneficiariesObject);
				// const reached = (
				// 	Object.entries(datum.reached) as BeneficiariesEntry[]
				// ).reduce((acc, [key, value]) => {
				// 	acc[key] = value;
				// 	return acc;
				// }, {} as BeneficiariesObject);
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

				if (foundSector) {
					// for (const genderAndAge in sectorDatum.reached) {
					// 	foundSector.reached[genderAndAge as GenderAndAge] +=
					// 		sectorDatum.reached[genderAndAge as GenderAndAge];
					// }
					// for (const genderAndAge in sectorDatum.targeted) {
					// 	foundSector.targeted[genderAndAge as GenderAndAge] +=
					// 		sectorDatum.targeted[genderAndAge as GenderAndAge];
					// }
				} else {
					const type = sectorDatum.sectorId;
					// const targeted = (
					// 	Object.entries(
					// 		sectorDatum.targeted,
					// 	) as BeneficiariesEntry[]
					// ).reduce((acc, [key, value]) => {
					// 	acc[key] = value;
					// 	return acc;
					// }, {} as BeneficiariesObject);
					// const reached = (
					// 	Object.entries(
					// 		sectorDatum.reached,
					// 	) as BeneficiariesEntry[]
					// ).reduce((acc, [key, value]) => {
					// 	acc[key] = value;
					// 	return acc;
					// }, {} as BeneficiariesObject);
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
		fund.forEach(pf => {
			if (!totalBeneficiariesByPartnerData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data`,
				);
				return;
			}

			const allStatuses = [...inDataLists.statusesPerFund[pf]];
			const fundHasAllStatuses = allStatuses.every(pfStatus =>
				statuses.includes(pfStatus),
			);

			if (fundHasAllStatuses) {
				const foundPartner = totalBeneficiariesByPartnerData[
					pf
				].all.find(totalPartners => totalPartners.partner === org.type);
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
			} else {
				statuses.forEach(st => {
					const foundPartner = totalBeneficiariesByPartnerData[pf][
						st
					]?.find(
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
					}
				});
			}
		});
	});

	dataSector.forEach(sect => {
		fund.forEach(pf => {
			if (!totalBeneficiariesBySectorData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesBySector data`,
				);
				return;
			}

			const allStatuses = [...inDataLists.statusesPerFund[pf]];
			const fundHasAllStatuses = allStatuses.every(pfStatus =>
				statuses.includes(pfStatus),
			);

			if (fundHasAllStatuses) {
				const foundPartner = totalBeneficiariesBySectorData[
					pf
				].all.find(totalPartners => totalPartners.sector === sect.type);
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
			} else {
				statuses.forEach(st => {
					const foundPartner = totalBeneficiariesBySectorData[pf][
						st
					]?.find(
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
					}
				});
			}
		});
	});

	dataBeneficiaryByType.forEach(benType => {
		fund.forEach(pf => {
			if (!totalBeneficiariesByBeneficiaryTypeData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data`,
				);
				return;
			}

			const allStatuses = [...inDataLists.statusesPerFund[pf]];
			const fundHasAllStatuses = allStatuses.every(pfStatus =>
				statuses.includes(pfStatus),
			);

			if (fundHasAllStatuses) {
				const foundPartner = totalBeneficiariesByBeneficiaryTypeData[
					pf
				].all.find(
					totalPartners =>
						totalPartners.beneficiaryType === benType.type,
				);
				if (foundPartner) {
					benType.targeted.girls += foundPartner.girls.targeted;
					benType.targeted.boys += foundPartner.boys.targeted;
					benType.targeted.women += foundPartner.women.targeted;
					benType.targeted.men += foundPartner.men.targeted;
					benType.reached.girls += foundPartner.girls.reached;
					benType.reached.boys += foundPartner.boys.reached;
					benType.reached.women += foundPartner.women.reached;
					benType.reached.men += foundPartner.men.reached;
				} else {
					simpleWarn(
						`Partner ${benType.type} not found in totalBeneficiariesByBeneficiaryType data`,
					);
				}
			} else {
				statuses.forEach(st => {
					const foundPartner =
						totalBeneficiariesByBeneficiaryTypeData[pf][st]?.find(
							totalPartners =>
								totalPartners.beneficiaryType === benType.type,
						);
					if (foundPartner) {
						benType.targeted.girls += foundPartner.girls.targeted;
						benType.targeted.boys += foundPartner.boys.targeted;
						benType.targeted.women += foundPartner.women.targeted;
						benType.targeted.men += foundPartner.men.targeted;
						benType.reached.girls += foundPartner.girls.reached;
						benType.reached.boys += foundPartner.boys.reached;
						benType.reached.women += foundPartner.women.reached;
						benType.reached.men += foundPartner.men.reached;
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
