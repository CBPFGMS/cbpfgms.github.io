import { Data } from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import constants from "./constants";

type NonNullableImplementationStatuses = Exclude<ImplementationStatuses, null>;

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
	implementationStatus: ImplementationStatuses;
	lists: List;
};

type DatumSummary = {
	year: number;
	allocations: number;
	projects: Set<number>;
	partners: Set<number>;
	underImplementation: number;
};

type DatumPictogram = {
	targetedMen: number;
	targetedWomen: number;
	targetedBoys: number;
	targetedGirls: number;
	reachedMen: number;
	reachedWomen: number;
	reachedBoys: number;
	reachedGirls: number;
};

const currentDate = new Date().getTime();

const { closedStatusNames } = constants;
const closedStatusNamesWide: string[] = [...closedStatusNames];

function processDataSummary({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	lists,
}: ProcessDataSummaryParams): {
	dataSummary: DatumSummary[];
	dataPictogram: DatumPictogram;
	inSelectionData: InSelectionData;
} {
	const dataSummary: DatumSummary[] = [];
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
	const inSelectionData: InSelectionData = {
		years: new Set(),
		funds: new Set(),
		allocationSources: new Set(),
		allocationTypes: new Set(),
	};

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum);
		if (
			implementationStatus === null ||
			thisStatus.includes(implementationStatus)
		) {
			if (
				year.includes(datum.year) &&
				fund.includes(datum.fund) &&
				allocationSource.includes(datum.allocationSource) &&
				allocationType.includes(datum.allocationType)
			) {
				// dataSummary.push({
				// 	year: datum.year,
				// 	allocations: datum.,
				// 	projects: datum.projects,
				// 	partners: datum.partners,
				// 	underImplementation: thisStatus.includes("Under Implementation")
				// 		? 1
				// 		: 0,
				// });
			}
		}
	});

	return { dataSummary, dataPictogram, inSelectionData };

	function calculateStatus(
		datum: Data[number]
	): NonNullableImplementationStatuses[] {
		const status: NonNullableImplementationStatuses[] = [];
		if (datum.endDate.getTime() > currentDate) {
			status.push("Under Implementation");
		} else {
			if (datum.endDate.getTime() < currentDate) {
				if (
					closedStatusNamesWide.includes(
						lists.statuses[datum.projectStatusId]
					)
				) {
					status.push("Under Closure/Closed");
				} else {
					status.push("Implemented");
				}
			}
		}

		return status;
	}
}

export default processDataSummary;
