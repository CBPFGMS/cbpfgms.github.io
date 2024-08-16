import {
	GlobalIndicatorsObject,
	GlobalIndicatorsMasterObject,
} from "./schemas";
import { BeneficiariesObject, GenderAndAge } from "./processrawdata";
import { sum, mean } from "d3";
import constants from "./constants";
import { List, GlobalIndicatorsDetails } from "./makelists";
import { warnProjectNotFound } from "./warninvalid";

export type DatumIndicators = {
	sector: number;
	sectorData: SectorDatum[];
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
	targeted: NullableBeneficiariesObject;
	reached: NullableBeneficiariesObject;
	targetedTotal: number;
	reachedTotal: number;
	targetedTemporary?: NullableBeneficiariesObjectWithArrays;
	reachedTemporary?: NullableBeneficiariesObjectWithArrays;
	targetedTotalTemporary?: number[];
	reachedTotalTemporary?: number[];
};

type ProcessDataIndicatorsParams = {
	data: GlobalIndicatorsObject[];
	lists: List;
};

type StatusKey = "Tgt" | "Ach";

const { beneficiaryCategories, beneficiariesStatuses } = constants;

function processDataIndicators({
	data: rawData,
	lists,
}: ProcessDataIndicatorsParams): DatumIndicators[] {
	const dataIndicators: DatumIndicators[] = [];

	const allSectors: DatumIndicators = {
		sector: 0,
		sectorData: [],
	};

	rawData.forEach(row => {
		const thisIndicator = lists.globalIndicatorsDetails.get(row.GlbIndicId),
			thisSector = thisIndicator?.sector;

		if (!thisSector) {
			warnProjectNotFound(
				row.ChfProjectCode,
				row,
				"Global indicator not found in global indicators master"
			);
			return;
		}

		const foundSector = dataIndicators.find(
			datum => datum.sector === thisSector
		);

		if (foundSector) {
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
				foundIndicator.reachedTotalTemporary!.push(row.AchTotal);
			} else {
				foundSector.sectorData.push({
					indicatorId: row.GlbIndicId,
					unit: thisIndicator.unit,
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
					reachedTotalTemporary: [row.AchTotal],
				});
			}
		} else {
			dataIndicators.push({
				sector: thisSector,
				sectorData: [
					{
						indicatorId: row.GlbIndicId,
						unit: thisIndicator.unit,
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
						reachedTotalTemporary: [row.AchTotal],
					},
				],
			});
		}

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
			foundIndicatorAllSectors.targetedTotalTemporary!.push(row.TgtTotal);
			foundIndicatorAllSectors.reachedTotalTemporary!.push(row.AchTotal);
		} else {
			allSectors.sectorData.push({
				indicatorId: row.GlbIndicId,
				unit: thisIndicator.unit,
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
				reachedTotalTemporary: [row.AchTotal],
			});
		}
	});

	dataIndicators.forEach(sectorDatum => {
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

	dataIndicators.unshift(allSectors);

	return dataIndicators;
}

function processObject(datum: SectorDatum) {
	const operation = datum.unit === "p" ? mean : sum;
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

		//IMPORTANT
		//discuss how to correctly calculate the total when the unit is percentage
		datum[`${status}Total`] =
			datum.unit === "p"
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
