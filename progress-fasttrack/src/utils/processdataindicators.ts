import {
	GlobalIndicatorsObject,
	GlobalIndicatorsMasterObject,
} from "./schemas";
import { BeneficiariesObject, GenderAndAge } from "./processrawdata";
import { sum, mean } from "d3";
import constants from "./constants";
import { List, GlobalIndicatorsDetails } from "./makelists";
import { warnProjectNotFound } from "./warninvalid";
import { ImplementationStatuses } from "../components/MainContainer";
import calculateStatus from "./calculatestatus";

export type DatumIndicators = {
	sector: number;
	totalProjects: Set<number>;
	sectorData: SectorDatum[];
};

export type AllSectorsDatum = Omit<DatumIndicators, "sectorData"> & {
	sectorData: SectorDatumWithSector[];
};

type Nullable<T> = {
	[P in keyof T]: T[P] | null;
};

type NullableBeneficiariesObject = Nullable<BeneficiariesObject>;

type BeneficiariesObjectWithArrays = {
	[K in GenderAndAge]: number[];
};

type NullableBeneficiariesObjectWithArrays =
	Nullable<BeneficiariesObjectWithArrays>;

export type SectorDatum = {
	indicatorId: number;
	unit: GlobalIndicatorsMasterObject["UnitAb"];
	unitName: GlobalIndicatorsMasterObject["UnitNm"];
	projects: Set<number>;
	targeted: NullableBeneficiariesObject;
	reached: NullableBeneficiariesObject;
	targetedTotal: number;
	reachedTotal: number;
	targetedTemporary?: NullableBeneficiariesObjectWithArrays;
	reachedTemporary?: NullableBeneficiariesObjectWithArrays;
	targetedTotalTemporary?: number[];
	reachedTotalTemporary?: number[];
};

type SectorDatumWithSector = SectorDatum & {
	sector: number;
};

type ProcessDataIndicatorsParams = {
	dataIndicators: GlobalIndicatorsObject[];
	lists: List;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationsStatus: ImplementationStatuses[];
	showFinanciallyClosed: boolean;
};

type StatusKey = "Tgt" | "Ach";

const { beneficiaryCategories, beneficiariesStatuses } = constants;

function processDataIndicators({
	dataIndicators,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationsStatus,
	showFinanciallyClosed,
}: ProcessDataIndicatorsParams): DatumIndicators[] {
	const filteredDataIndicators: DatumIndicators[] = [];

	const allSectors: AllSectorsDatum = {
		sector: 0,
		totalProjects: new Set(),
		sectorData: [],
	};

	dataIndicators.forEach(row => {
		const thisIndicator = lists.globalIndicatorsDetails.get(row.GlbIndicId);
		const thisProjectDetails = lists.projectDetails.get(row.CHFId);

		if (!thisIndicator) {
			warnProjectNotFound(
				row.CHFProjectCode,
				row,
				"Global indicator not found in global indicators master"
			);
			return;
		}

		if (!thisProjectDetails) {
			warnProjectNotFound(
				row.CHFProjectCode,
				row,
				"Global indicator without corresponding project ID"
			);
			return;
		}

		const thisStatus = calculateStatus(
			thisProjectDetails,
			lists,
			showFinanciallyClosed
		);

		if (
			year.includes(thisProjectDetails.year) &&
			fund.includes(thisProjectDetails.fund) &&
			allocationSource.includes(thisProjectDetails.allocationSource) &&
			allocationType.includes(thisProjectDetails.allocationType) &&
			implementationsStatus.includes(thisStatus)
		) {
			const foundSector = filteredDataIndicators.find(
				datum => datum.sector === row.GlbClstrId
			);

			if (foundSector) {
				foundSector.totalProjects.add(row.CHFId);
				const foundIndicator = foundSector.sectorData.find(
					sectorDatum => sectorDatum.indicatorId === row.GlbIndicId
				);
				if (foundIndicator) {
					updateTemporaryData(
						foundIndicator.targetedTemporary!,
						row,
						thisIndicator,
						"Tgt"
					);
					updateTemporaryData(
						foundIndicator.reachedTemporary!,
						row,
						thisIndicator,
						"Ach"
					);
					foundIndicator.targetedTotalTemporary!.push(row.TgtTotal);
					foundIndicator.reachedTotalTemporary!.push(
						row.AchTotal ?? 0
					);
					foundIndicator.projects.add(row.CHFId);
				} else {
					foundSector.sectorData.push({
						indicatorId: row.GlbIndicId,
						unit: thisIndicator.unit,
						unitName: thisIndicator.unitName,
						projects: new Set([row.CHFId]),
						targeted: fillWithZeroes(),
						reached: fillWithZeroes(),
						targetedTotal: 0,
						reachedTotal: 0,
						targetedTemporary: populateTemporaryData(
							row,
							thisIndicator,
							"Tgt"
						),
						reachedTemporary: populateTemporaryData(
							row,
							thisIndicator,
							"Ach"
						),
						targetedTotalTemporary: [row.TgtTotal],
						reachedTotalTemporary: [row.AchTotal ?? 0],
					});
				}
			} else {
				filteredDataIndicators.push({
					sector: row.GlbClstrId,
					totalProjects: new Set([row.CHFId]),
					sectorData: [
						{
							indicatorId: row.GlbIndicId,
							unit: thisIndicator.unit,
							unitName: thisIndicator.unitName,
							projects: new Set([row.CHFId]),
							targeted: fillWithZeroes(),
							reached: fillWithZeroes(),
							targetedTotal: 0,
							reachedTotal: 0,
							targetedTemporary: populateTemporaryData(
								row,
								thisIndicator,
								"Tgt"
							),
							reachedTemporary: populateTemporaryData(
								row,
								thisIndicator,
								"Ach"
							),
							targetedTotalTemporary: [row.TgtTotal],
							reachedTotalTemporary: [row.AchTotal ?? 0],
						},
					],
				});
			}

			allSectors.totalProjects.add(row.CHFId);

			const foundIndicatorAllSectors = allSectors.sectorData.find(
				sectorDatum => sectorDatum.indicatorId === row.GlbIndicId
			);

			if (foundIndicatorAllSectors) {
				updateTemporaryData(
					foundIndicatorAllSectors.targetedTemporary!,
					row,
					thisIndicator,
					"Tgt"
				);
				updateTemporaryData(
					foundIndicatorAllSectors.reachedTemporary!,
					row,
					thisIndicator,
					"Ach"
				);
				foundIndicatorAllSectors.targetedTotalTemporary!.push(
					row.TgtTotal
				);
				foundIndicatorAllSectors.reachedTotalTemporary!.push(
					row.AchTotal ?? 0
				);
				foundIndicatorAllSectors.projects.add(row.CHFId);
			} else {
				allSectors.sectorData.push({
					indicatorId: row.GlbIndicId,
					sector: row.GlbClstrId,
					unit: thisIndicator.unit,
					unitName: thisIndicator.unitName,
					projects: new Set([row.CHFId]),
					targeted: fillWithZeroes(),
					reached: fillWithZeroes(),
					targetedTotal: 0,
					reachedTotal: 0,
					targetedTemporary: populateTemporaryData(
						row,
						thisIndicator,
						"Tgt"
					),
					reachedTemporary: populateTemporaryData(
						row,
						thisIndicator,
						"Ach"
					),
					targetedTotalTemporary: [row.TgtTotal],
					reachedTotalTemporary: [row.AchTotal ?? 0],
				});
			}
		}
	});

	filteredDataIndicators.forEach(sectorDatum => {
		sectorDatum.sectorData.forEach(datum => {
			processObject(datum);

			delete datum.targetedTemporary;
			delete datum.reachedTemporary;
			delete datum.targetedTotalTemporary;
			delete datum.reachedTotalTemporary;
		});
	});

	allSectors.sectorData.forEach(datum => {
		processObject(datum);

		delete datum.targetedTemporary;
		delete datum.reachedTemporary;
		delete datum.targetedTotalTemporary;
		delete datum.reachedTotalTemporary;
	});

	if (filteredDataIndicators.length)
		filteredDataIndicators.unshift(allSectors);

	return filteredDataIndicators;
}

function processObject(datum: SectorDatum) {
	const operation = datum.unit === "%" ? mean : sum;
	beneficiariesStatuses.forEach(status => {
		const targetData = datum[status],
			temporaryData = datum[`${status}Temporary`]!;

		for (const key in datum[`${status}Temporary`]) {
			const tempDataValue =
				temporaryData[key as keyof typeof temporaryData];

			if (tempDataValue) {
				targetData[key as keyof typeof targetData] =
					operation(tempDataValue) ?? 0;
			} else {
				targetData[key as keyof typeof targetData] = null;
			}
		}

		datum[`${status}Total`] =
			datum.unit === "%"
				? mean(datum[`${status}TotalTemporary`] as number[]) ?? 0
				: sum(datum[`${status}TotalTemporary`] as number[]) ?? 0;
	});
}

function populateTemporaryData(
	row: GlobalIndicatorsObject,
	thisIndicator: GlobalIndicatorsDetails,
	type: StatusKey
) {
	const obj = {} as NullableBeneficiariesObjectWithArrays;
	beneficiaryCategories.forEach(beneficiary => {
		obj[beneficiary] = thisIndicator[beneficiary]
			? [
					Number(
						row[
							`${type}${beneficiary
								.charAt(0)
								.toUpperCase()}` as keyof GlobalIndicatorsObject
						]
					) || 0,
			  ]
			: null;
	});
	return obj;
}

function updateTemporaryData(
	temporaryObject: NullableBeneficiariesObjectWithArrays,
	row: GlobalIndicatorsObject,
	thisIndicator: GlobalIndicatorsDetails,
	type: StatusKey
) {
	beneficiaryCategories.forEach(beneficiary => {
		if (thisIndicator[beneficiary]) {
			temporaryObject[beneficiary]!.push(
				Number(
					row[
						`${type}${beneficiary
							.charAt(0)
							.toUpperCase()}` as keyof GlobalIndicatorsObject
					]
				) || 0
			);
		} else {
			temporaryObject[beneficiary] = null;
		}
	});
}

function fillWithZeroes(): BeneficiariesObject {
	const obj = {} as BeneficiariesObject;
	for (const key of beneficiaryCategories) {
		obj[key] = 0;
	}
	return obj;
}

export default processDataIndicators;
