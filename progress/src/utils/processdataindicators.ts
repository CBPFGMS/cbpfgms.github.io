import { GlobalIndicatorsObject } from "./schemas";
import { BeneficiariesObject, GenderAndAge } from "./processrawdata";
import { sum, mean } from "d3";
import constants from "./constants";

export type DatumIndicators = {
	sector: number;
	sectorData: SectorDatum[];
};

export type SectorDatum = {
	outcome: string;
	indicatorId: number;
	unit: GlobalIndicatorsObject["Unit"];
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
	targetedTotal: number;
	reachedTotal: number;
	targetedTemporary?: BeneficiariesObjectWithArrays;
	reachedTemporary?: BeneficiariesObjectWithArrays;
};

type BeneficiariesObjectWithArrays = {
	[K in GenderAndAge]: number[];
};

type ProcessDataIndicatorsParams = {
	data: GlobalIndicatorsObject[];
};

type StatusKey = "Targeted" | "Reached";

const { beneficiaryCategories, beneficiariesStatuses } = constants;

function processDataIndicators({ data: rawData }: ProcessDataIndicatorsParams) {
	const dataIndicators: DatumIndicators[] = [];

	rawData.forEach(row => {
		const foundSector = dataIndicators.find(
			datum => datum.sector === row.Sector
		);

		if (foundSector) {
			const foundIndicator = foundSector.sectorData.find(
				sectorDatum => sectorDatum.indicatorId === row.IndicatorId
			);
			if (foundIndicator) {
				updateTemporaryData(
					foundIndicator.targetedTemporary!,
					row,
					"Targeted"
				);
				updateTemporaryData(
					foundIndicator.reachedTemporary!,
					row,
					"Reached"
				);
			} else {
				foundSector.sectorData.push({
					outcome: row.Outcome,
					indicatorId: row.IndicatorId,
					unit: row.Unit,
					targeted: fillWithZeroes(),
					reached: fillWithZeroes(),
					targetedTotal: 0,
					reachedTotal: 0,
					targetedTemporary: populateTemporaryData(row, "Targeted"),
					reachedTemporary: populateTemporaryData(row, "Reached"),
				});
			}
		} else {
			dataIndicators.push({
				sector: row.Sector,
				sectorData: [
					{
						outcome: row.Outcome,
						indicatorId: row.IndicatorId,
						unit: row.Unit,
						targeted: fillWithZeroes(),
						reached: fillWithZeroes(),
						targetedTotal: 0,
						reachedTotal: 0,
						targetedTemporary: populateTemporaryData(
							row,
							"Targeted"
						),
						reachedTemporary: populateTemporaryData(row, "Reached"),
					},
				],
			});
		}
	});

	dataIndicators.forEach(sectorDatum => {
		sectorDatum.sectorData.forEach(datum => {
			processObject(datum);

			delete datum.targetedTemporary;
			delete datum.reachedTemporary;
		});
	});

	return dataIndicators;
}

function processObject(datum: SectorDatum) {
	const operation = datum.unit === "p" ? mean : sum;
	beneficiariesStatuses.forEach(status => {
		const targetData = datum[status],
			temporaryData = datum[`${status}Temporary`]!;
		for (const key in datum[`${status}Temporary`]) {
			targetData[key as keyof typeof targetData] =
				operation(temporaryData[key as keyof typeof temporaryData]) ??
				0;
			if (datum.unit === "i") {
				datum[`${status}Total`] +=
					targetData[key as keyof typeof targetData];
			}
		}
		if (datum.unit === "p") {
			datum[`${status}Total`] =
				mean(Object.values(targetData) as number[]) ?? 0;
		}
	});
}

function populateTemporaryData(row: GlobalIndicatorsObject, type: StatusKey) {
	const obj = {} as BeneficiariesObjectWithArrays;
	beneficiaryCategories.forEach(beneficiary => {
		obj[beneficiary] = [
			Number(
				row[
					`${type}${
						beneficiary.charAt(0).toUpperCase() +
						beneficiary.slice(1)
					}` as keyof GlobalIndicatorsObject
				]
			) || 0,
		];
	});
	return obj;
}

function updateTemporaryData(
	temporaryObject: BeneficiariesObjectWithArrays,
	row: GlobalIndicatorsObject,
	type: StatusKey
) {
	beneficiaryCategories.forEach(beneficiary => {
		temporaryObject[beneficiary].push(
			Number(
				row[
					`${type}${
						beneficiary.charAt(0).toUpperCase() +
						beneficiary.slice(1)
					}` as keyof GlobalIndicatorsObject
				]
			) || 0
		);
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
