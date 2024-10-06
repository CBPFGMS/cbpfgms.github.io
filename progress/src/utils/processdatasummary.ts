import { Data } from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import calculateStatus from "./calculatestatus";
import constants from "./constants";
import capitalizeString from "./capitalizestring";
import { GenderAndAge } from "./processrawdata";

export type InSelectionData = {
	years: Set<number>;
	funds: Set<number>;
	allocationSources: Set<number>;
	allocationTypes: Set<number>;
};

type ProcessDataSummaryParams = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
	showFinanciallyClosed: boolean;
};

export type DatumSummary = {
	year: number;
	allocations: number;
	projects: Set<number>;
	partners: Set<number>;
	underImplementation: number;
};

export type DatumPictogram = {
	[K in (typeof beneficiariesStatuses)[number] as `${K}${Capitalize<GenderAndAge>}`]: number;
};

export type DatumDisability = {
	[K in (typeof beneficiariesStatuses)[number] as `${K}${Capitalize<GenderAndAge>}`]: number;
} & Report;

export type DatumGBV = {
	allocations: number;
	allocationsGBVPlanned: number;
	allocationsGBVReached: number;
	targeted: number;
	targetedGBV: number;
	reached: number;
	reachedGBV: number;
} & Report;

export type Report = {
	totalReports: number;
	reportsWithData: number;
};

export type DatumEmergency = {
	emergencyType: number;
	emergencyCategory: number;
	emergencyGroup: number;
	allocations: number;
	date: Date;
};

const {
	beneficiariesStatuses,
	beneficiaryCategories,
	reportsForDisability,
	reportsForGBV,
} = constants;

function processDataSummary({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	lists,
	showFinanciallyClosed,
}: ProcessDataSummaryParams): {
	dataSummary: DatumSummary[];
	dataEmergency: DatumEmergency[];
	dataPictogram: DatumPictogram;
	dataDisability: DatumDisability;
	dataGBV: DatumGBV;
	inSelectionData: InSelectionData;
} {
	const dataSummary: DatumSummary[] = [];
	const dataEmergency: DatumEmergency[] = [];
	const dataPictogram: DatumPictogram = {
		targetedMen: 0,
		targetedWomen: 0,
		targetedBoys: 0,
		targetedGirls: 0,
		reachedMen: 0,
		reachedWomen: 0,
		reachedBoys: 0,
		reachedGirls: 0,
	};
	const dataDisability: DatumDisability = {
		targetedMen: 0,
		targetedWomen: 0,
		targetedBoys: 0,
		targetedGirls: 0,
		reachedMen: 0,
		reachedWomen: 0,
		reachedBoys: 0,
		reachedGirls: 0,
		totalReports: 0,
		reportsWithData: 0,
	};
	const dataGBV: DatumGBV = {
		allocations: 0,
		allocationsGBVPlanned: 0,
		allocationsGBVReached: 0,
		targeted: 0,
		targetedGBV: 0,
		reached: 0,
		reachedGBV: 0,
		totalReports: 0,
		reportsWithData: 0,
	};
	const inSelectionData: InSelectionData = {
		years: new Set(),
		funds: new Set(),
		allocationSources: new Set(),
		allocationTypes: new Set(),
	};

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists, showFinanciallyClosed);
		if (
			implementationStatus.includes(thisStatus) &&
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			const foundYear = dataSummary.find(
				summary => summary.year === datum.year
			);
			if (foundYear) {
				foundYear.allocations += datum.budget;
				foundYear.projects.add(datum.projectId);
				foundYear.partners.add(datum.organizationId);
				if (thisStatus.includes("Under Implementation")) {
					foundYear.underImplementation += datum.budget;
				}
			} else {
				dataSummary.push({
					year: datum.year,
					allocations: datum.budget,
					projects: new Set([datum.projectId]),
					partners: new Set([datum.organizationId]),
					underImplementation: thisStatus.includes(
						"Under Implementation"
					)
						? datum.budget
						: 0,
				});
			}

			beneficiariesStatuses.forEach(status => {
				const disabledKey = `disabled${capitalizeString(
					status
				)}` as keyof typeof datum;
				beneficiaryCategories.forEach(category => {
					dataPictogram[
						`${status}${capitalizeString(
							category
						)}` as keyof DatumPictogram
					] += datum[status][category];
					dataDisability[
						`${status}${capitalizeString(
							category
						)}` as keyof DatumDisability
					] += (datum[disabledKey] as Record<GenderAndAge, number>)[
						category
					];
				});
			});
			dataDisability.totalReports += 1;
			if (
				reportsForDisability.includes(
					datum.reportType as (typeof reportsForDisability)[number]
				)
			) {
				dataDisability.reportsWithData += 1;
			}

			dataGBV.allocations += datum.budget;
			dataGBV.allocationsGBVPlanned += datum.budgetGBVPlanned;
			dataGBV.allocationsGBVReached += datum.budgetGBVReached;
			dataGBV.targeted += Object.values(datum.targeted).reduce(
				(acc, curr) => acc + curr,
				0
			);
			dataGBV.targetedGBV += datum.targetedGBV;
			dataGBV.reached += Object.values(datum.reached).reduce(
				(acc, curr) => acc + curr,
				0
			);
			dataGBV.reachedGBV += datum.reachedGBV;
			dataGBV.totalReports += 1;
			if (
				reportsForGBV.includes(
					datum.reportType as (typeof reportsForGBV)[number]
				)
			) {
				dataGBV.reportsWithData += 1;
			}

			datum.emergenciesData.forEach(emergency => {
				const foundEmergency = dataEmergency.find(
					datumEmergency =>
						datumEmergency.emergencyType === emergency.emergencyId
				);
				if (foundEmergency) {
					foundEmergency.allocations +=
						(emergency.percentage / 100) * datum.budget;
				} else {
					dataEmergency.push({
						emergencyType: emergency.emergencyId,
						emergencyCategory:
							lists.emergencyDetails.emergencyTypes[
								emergency.emergencyId
							].emergencyCategory,
						emergencyGroup:
							lists.emergencyDetails.emergencyTypes[
								emergency.emergencyId
							].emergencyGroup,
						allocations:
							(emergency.percentage / 100) * datum.budget,
						date: datum.endDate,
					});
				}
			});
		}

		if (
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource)
		) {
			inSelectionData.allocationTypes.add(datum.allocationType);
		}
		if (
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationType.includes(datum.allocationType)
		) {
			inSelectionData.allocationSources.add(datum.allocationSource);
		}
		if (
			year.includes(datum.year) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			inSelectionData.funds.add(datum.fund);
		}
		if (
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			inSelectionData.years.add(datum.year);
		}
	});

	dataSummary.sort((a, b) => b.year - a.year);
	dataEmergency.sort((a, b) => b.date.getTime() - a.date.getTime());

	return {
		dataSummary,
		dataEmergency,
		dataPictogram,
		dataDisability,
		dataGBV,
		inSelectionData,
	};
}

export default processDataSummary;
