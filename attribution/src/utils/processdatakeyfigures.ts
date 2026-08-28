import type { List } from "./makelists";
import type { AllocationsData, LocalizationData } from "./processrawdata";
import { simpleWarn } from "./warninvalid";
import { constants } from "./constants";

export type InSelectionData = {
	funds: Set<number>;
	statuses: Set<number>;
};

type ProcessDataKeyFiguresParams = {
	allocationsData: AllocationsData;
	localizationDataWithUS: LocalizationData;
	localizationDataWithoutUS: LocalizationData;
	funds: number[];
	globalAttribution: number;
	lists: List;
	year: number;
	hasUS: boolean;
};

export type DataKeyFigures = {
	localization: number;
	totalLocalization: number;
	disability: number;
	totalDisability: number;
	genderEquality: number;
	totalGenderEquality: number;
	gbv: number;
	totalGbv: number;
	wlo: number;
	totalWlo: number;
	protection: number;
	totalProtection: number;
};

const { USProjectsString } = constants;

function processDataKeyFigures({
	allocationsData,
	localizationDataWithUS,
	localizationDataWithoutUS,
	funds,
	globalAttribution,
	lists,
	year,
	hasUS,
}: ProcessDataKeyFiguresParams): DataKeyFigures {
	let totalLocalization = 0,
		totalDisability = 0,
		totalGenderEquality = 0,
		totalGbv = 0,
		totalWlo = 0,
		totalProtection = 0;

	const protectionId = +Object.keys(lists.sectors).find(
		key => lists.sectors[+key] === "Protection",
	)!;

	//Check for missing "Protection" sector
	if (isNaN(protectionId)) {
		simpleWarn("Missing 'Protection' sector in the sector master table");
	}

	allocationsData.forEach(row => {
		if (!hasUS && row.projectCode.includes(USProjectsString)) {
			return;
		}
		if (funds.includes(row.fund) && row.year === year) {
			if (row.hasDisabled) {
				totalDisability += row.budget;
			}
			if (row.hasGBV) {
				totalGbv += row.budget;
			}
			if (row.hasGenderEquality) {
				totalGenderEquality += row.budget;
			}
			if (row.hasWomenLedOrgs) {
				totalWlo += row.budget;
			}
			const thisProtection = row.sectorData.find(
				sector => sector.sectorId === protectionId,
			);
			if (thisProtection) {
				totalProtection += thisProtection.percentage * row.budget;
			}
		}
	});

	const localizationData = hasUS
		? localizationDataWithUS
		: localizationDataWithoutUS;

	localizationData.forEach(row => {
		if (funds.includes(row.fund) && row.year === year) {
			totalLocalization += row.budget;
		}
	});

	//multiply by global attribution
	const localization = totalLocalization * globalAttribution;
	const disability = totalDisability * globalAttribution;
	const genderEquality = totalGenderEquality * globalAttribution;
	const gbv = totalGbv * globalAttribution;
	const wlo = totalWlo * globalAttribution;
	const protection = totalProtection * globalAttribution;

	const dataKeyFigures: DataKeyFigures = {
		localization,
		totalLocalization,
		disability,
		totalDisability,
		genderEquality,
		totalGenderEquality,
		gbv,
		totalGbv,
		wlo,
		totalWlo,
		protection,
		totalProtection,
	};

	return dataKeyFigures;
}

export default processDataKeyFigures;
