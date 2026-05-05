import {
	Data,
	InDataLists,
	TotalBeneficiariesByPartnerData,
} from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import { BeneficiariesObject } from "./processrawdata";
import constants from "./constants";
import { sum } from "d3";
import { GenderAndAge } from "./processrawdata";
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
	inDataLists: InDataLists;
};

type BeneficiariesEntry = [
	key: keyof BeneficiariesObject,
	value: BeneficiariesObject[keyof BeneficiariesObject],
];

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
			for (const type in datum.reachedByBeneficiaryType) {
				const foundType = dataBeneficiaryByType.find(
					d => d.type === parseInt(type),
				);
				if (foundType) {
					beneficiaryCategories.forEach(genderAndAge => {
						foundType.reached[genderAndAge] +=
							datum.reachedByBeneficiaryType[
								+type as BeneficiaryTypesList
							][genderAndAge];
					});
				}
			}
			for (const type in datum.targetedByBeneficiaryType) {
				const foundType = dataBeneficiaryByType.find(
					d => d.type === parseInt(type),
				);
				if (foundType) {
					beneficiaryCategories.forEach(genderAndAge => {
						foundType.targeted[genderAndAge] +=
							datum.targetedByBeneficiaryType[
								+type as BeneficiaryTypesList
							][genderAndAge];
					});
				}
			}

			const foundOrganization = dataOrganization.find(
				d => d.type === datum.organizationType,
			);

			if (foundOrganization) {
				for (const genderAndAge in datum.reached) {
					foundOrganization.reached[genderAndAge as GenderAndAge] +=
						datum.reached[genderAndAge as GenderAndAge];
				}
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
				const reached = (
					Object.entries(datum.reached) as BeneficiariesEntry[]
				).reduce((acc, [key, value]) => {
					acc[key] = value;
					return acc;
				}, {} as BeneficiariesObject);
				const targeted = beneficiaryCategories.reduce(
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
					for (const genderAndAge in sectorDatum.reached) {
						foundSector.reached[genderAndAge as GenderAndAge] +=
							sectorDatum.reached[genderAndAge as GenderAndAge];
					}
					for (const genderAndAge in sectorDatum.targeted) {
						foundSector.targeted[genderAndAge as GenderAndAge] +=
							sectorDatum.targeted[genderAndAge as GenderAndAge];
					}
				} else {
					const type = sectorDatum.sectorId;
					const targeted = (
						Object.entries(
							sectorDatum.targeted,
						) as BeneficiariesEntry[]
					).reduce((acc, [key, value]) => {
						acc[key] = value;
						return acc;
					}, {} as BeneficiariesObject);
					const reached = (
						Object.entries(
							sectorDatum.reached,
						) as BeneficiariesEntry[]
					).reduce((acc, [key, value]) => {
						acc[key] = value;
						return acc;
					}, {} as BeneficiariesObject);
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
					org.targeted.girls += foundPartner.girls;
					org.targeted.boys += foundPartner.boys;
					org.targeted.women += foundPartner.women;
					org.targeted.men += foundPartner.men;
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
						org.targeted.girls += foundPartner.girls;
						org.targeted.boys += foundPartner.boys;
						org.targeted.women += foundPartner.women;
						org.targeted.men += foundPartner.men;
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
