import { type Data } from "./processrawdata";
import { type List } from "./makelists";

type BaseDownloadDatum = {
	Year: number;
	Fund: string;
	"Allocation Source": string;
	"Allocation Name": string;
	"Project Code": string;
	Budget: number;
};

type CvaTypeDatumDownload = BaseDownloadDatum & {
	"CVA type": string;
};

type FundDatumDownload = BaseDownloadDatum & {
	"CVA Budget": number;
};

type ProcessDownloadParams = {
	data: Data;
	lists: List;
	year: number[];
	fund: number[];
	allocationSource: number[];
};

export function processCvaTypeDownload({
	data,
	lists,
	year,
	fund,
	allocationSource,
}: ProcessDownloadParams): CvaTypeDatumDownload[] {
	const cvaDataDownload: CvaTypeDatumDownload[] = [];

	data.forEach(datum => {
		if (datum.cvaData !== null) {
			if (checkRow(datum, year, fund, allocationSource)) {
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
	allocationSource,
}: ProcessDownloadParams): FundDatumDownload[] {
	const fundsDataDownload: FundDatumDownload[] = [];

	data.forEach(datum => {
		if (checkRow(datum, year, fund, allocationSource)) {
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
		Budget: datum.budget,
	};
}

function checkRow(
	datum: Data[number],
	year: number[],
	fund: number[],
	allocationSource: number[]
): boolean {
	return (
		year.includes(datum.year) &&
		fund.includes(datum.fund) &&
		allocationSource.includes(datum.allocationSource)
	);
}
