import type { AllocationsData, LocalizationData } from "./processrawdata";
import type { ProjectClusterOneGmsObject } from "./schemas";
import { constants } from "./constants";

export type InSelectionData = {
	funds: Set<number>;
	statuses: Set<number>;
};

type ProcessDataKeyFiguresParams = {
	allocationsData: AllocationsData;
	projectClusterData: ProjectClusterOneGmsObject[];
	localizationDataWithUS: LocalizationData;
	localizationDataWithoutUS: LocalizationData;
	funds: number[];
	globalAttribution: number;
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
	projectClusterData,
	localizationDataWithUS,
	localizationDataWithoutUS,
	funds,
	globalAttribution,
	year,
	hasUS,
}: ProcessDataKeyFiguresParams): DataKeyFigures {
	let totalLocalization = 0,
		totalDisability = 0,
		totalGenderEquality = 0,
		totalGbv = 0,
		totalWlo = 0,
		totalProtection = 0;

	allocationsData.forEach(row => {
		if (!hasUS && row.projectCode.includes(USProjectsString)) {
			return;
		}
		if (funds.includes(row.fund) && row.year === year) {
			if (row.hasWomenLedOrgs) {
				totalWlo += row.budget;
			}
		}
	});

	projectClusterData.forEach(row => {
		if (!hasUS && row.CHFProjectCode.includes(USProjectsString)) {
			return;
		}
		if (funds.includes(row.PooledFundId) && row.AllocationYear === year) {
			totalDisability += row.DisabilityBudgetAmt ?? 0;
			totalGbv += row.GBVBudgetAmt ?? 0;
			totalGenderEquality += row.GenderEqBudgetAmt ?? 0;
			totalProtection += row.ProtectionBudgetAmt ?? 0;
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
