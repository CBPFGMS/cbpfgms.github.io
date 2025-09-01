import { type Data, type InDataLists } from "./processrawdata";
import { type List } from "./makelists";
import type { TimelineDatum } from "./processdata";

type BaseDownloadDatum = {
	Year: number;
	Fund: string;
	"Allocation Source": string;
	"Allocation Name": string;
	"Project Code": string;
	"Organization Type": string;
	Budget: number;
};

type CvaTypeDatumDownload = BaseDownloadDatum & {
	"CVA type": string;
};

type FundDatumDownload = BaseDownloadDatum & {
	"CVA Budget": number;
};

type TimelineDatumDownload = {
	year: number;
	"Total CVA (%)": number;
	[key: string]: number;
};

type ProcessDownloadParams = {
	data: Data;
	lists: List;
	year: number[];
	fund: number[];
	organizationType: number[];
};

type ProcessTimelineDownloadParams = {
	data: TimelineDatum[];
	lists: List;
	fund: number[];
	inDataLists: InDataLists;
};

export function processCvaTypesDownload({
	data,
	lists,
	year,
	fund,
	organizationType,
}: ProcessDownloadParams): CvaTypeDatumDownload[] {
	const cvaDataDownload: CvaTypeDatumDownload[] = [];

	data.forEach(datum => {
		if (datum.cvaData !== null) {
			if (checkRow(datum, year, fund, organizationType)) {
				const baseDownloadDatum = populateBaseDownloadDatum(
					datum,
					lists
				);

				datum.cvaData.forEach(cva => {
					cvaDataDownload.push({
						...baseDownloadDatum,
						"CVA type": lists.cvaTypeNames[cva.cvaId],
					});
				});
			}
		}
	});

	return cvaDataDownload;
}

export function processFundsDownload({
	data,
	lists,
	year,
	fund,
	organizationType,
}: ProcessDownloadParams): FundDatumDownload[] {
	const fundsDataDownload: FundDatumDownload[] = [];

	data.forEach(datum => {
		if (checkRow(datum, year, fund, organizationType)) {
			const baseDownloadDatum = populateBaseDownloadDatum(datum, lists);

			const cvaBudget =
				datum.cvaData === null
					? 0
					: datum.cvaData.reduce((acc, cva) => acc + cva.budget, 0);

			fundsDataDownload.push({
				...baseDownloadDatum,
				"CVA Budget": cvaBudget,
			});
		}
	});

	return fundsDataDownload;
}

export function processTimelineDownload({
	data,
	lists,
	fund,
	inDataLists,
}: ProcessTimelineDownloadParams): TimelineDatumDownload[] {
	const timelineDataDownload: TimelineDatumDownload[] = [];

	data.forEach(yearDatum => {
		const yearObj: TimelineDatumDownload = {
			year: yearDatum.year,
			"Total CVA (%)": yearDatum.cvaPercentage,
		};

		if (fund.length !== inDataLists.funds.size) {
			fund.forEach(fundId => {
				yearObj[lists.fundNames[fundId] + " (%)"] =
					Math.floor(yearDatum[`${fundId}CvaPercentage`] * 100) / 100;
			});
		}

		timelineDataDownload.push(yearObj);
	});

	return timelineDataDownload;
}

function populateBaseDownloadDatum(
	datum: Data[number],
	lists: List
): BaseDownloadDatum {
	return {
		Year: datum.year,
		Fund: lists.fundNames[datum.fund],
		"Allocation Source": lists.allocationSources[datum.allocationSource],
		"Allocation Name": lists.allocationTypes[datum.allocationType],
		"Project Code": datum.projectCode,
		"Organization Type": lists.organizationTypes[datum.organizationType],
		Budget: datum.budget,
	};
}

function checkRow(
	datum: Data[number],
	year: number[],
	fund: number[],
	organizationType: number[]
): boolean {
	return (
		year.includes(datum.year) &&
		fund.includes(datum.fund) &&
		organizationType.includes(datum.organizationType)
	);
}
