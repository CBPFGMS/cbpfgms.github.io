import { Data } from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import calculateStatus from "./calculatestatus";
import { BeneficiariesObject } from "./processrawdata";
import constants from "./constants";

export type DatumBarChart = {
	type: number;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

export type BeneficiaryTypesList = (typeof beneficiariesSplitOrder)[number];

export type GenderAndAge = (typeof beneficiaryCategories)[number];

type ProcessDataBarChartParams = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
};

type BeneficiariesEntry = [
	key: keyof BeneficiariesObject,
	value: BeneficiariesObject[keyof BeneficiariesObject]
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

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists);
		if (implementationStatus.includes(thisStatus)) {
			if (
				year.includes(datum.year) &&
				fund.includes(datum.fund) &&
				allocationSource.includes(datum.allocationSource) &&
				allocationType.includes(datum.allocationType)
			) {
				for (const type in datum.reachedByBeneficiaryType) {
					const foundType = dataBeneficiaryByType.find(
						d => d.type === parseInt(type)
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
						d => d.type === parseInt(type)
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
					d => d.type === datum.organizationType
				);

				if (foundOrganization) {
					for (const genderAndAge in datum.reached) {
						foundOrganization.reached[
							genderAndAge as GenderAndAge
						] += datum.reached[genderAndAge as GenderAndAge];
					}
					for (const genderAndAge in datum.targeted) {
						foundOrganization.targeted[
							genderAndAge as GenderAndAge
						] += datum.targeted[genderAndAge as GenderAndAge];
					}
				} else {
					const type = datum.organizationType;
					const targeted = (
						Object.entries(datum.targeted) as BeneficiariesEntry[]
					).reduce((acc, [key, value]) => {
						acc[key] = value;
						return acc;
					}, {} as BeneficiariesObject);
					const reached = (
						Object.entries(datum.reached) as BeneficiariesEntry[]
					).reduce((acc, [key, value]) => {
						acc[key] = value;
						return acc;
					}, {} as BeneficiariesObject);
					const obj: DatumBarChart = { type, targeted, reached };

					dataOrganization.push(obj);
				}

				datum.sectorData.forEach(sectorDatum => {
					const foundSector = dataSector.find(
						d => d.type === sectorDatum.sectorId
					);

					if (foundSector) {
						for (const genderAndAge in sectorDatum.reached) {
							foundSector.reached[genderAndAge as GenderAndAge] +=
								sectorDatum.reached[
									genderAndAge as GenderAndAge
								];
						}
						for (const genderAndAge in sectorDatum.targeted) {
							foundSector.targeted[
								genderAndAge as GenderAndAge
							] +=
								sectorDatum.targeted[
									genderAndAge as GenderAndAge
								];
						}
					} else {
						const type = sectorDatum.sectorId;
						const targeted = (
							Object.entries(
								sectorDatum.targeted
							) as BeneficiariesEntry[]
						).reduce((acc, [key, value]) => {
							acc[key] = value;
							return acc;
						}, {} as BeneficiariesObject);
						const reached = (
							Object.entries(
								sectorDatum.reached
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
		}
	});

	return { dataBeneficiaryByType, dataOrganization, dataSector };
}

export default processDataBarChart;
