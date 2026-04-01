import type { List } from "./makelists";
import type { AllSectorsDatum } from "./processdataindicators";
import type { Data } from "./processrawdata";

type BaseDownloadDatum = {
	Year: number;
	Fund: string;
	"Allocation Source": string;
	"Allocation Name": string;
	"Project Status": string;
	"Project Code": string;
	Budget?: number;
};

type BeneficiaryDownloadTypes = {
	"Targeted Women": number;
	"Targeted Men": number;
	"Targeted Girls": number;
	"Targeted Boys": number;
	"Reached Women": number;
	"Reached Men": number;
	"Reached Girls": number;
	"Reached Boys": number;
};

type NoValue<T> = {
	[P in keyof T]: T[P] | typeof notApplicable;
};

type IndicatorsDatumDownload = NoValue<BeneficiaryDownloadTypes> & {
	Indicator: string;
	sector: string;
	"Unit of values": "percentage" | string;
	"Targeted Total": number | typeof notApplicable;
	"Reached Total": number | typeof notApplicable;
};

export type PartnersDatumDownload = BaseDownloadDatum & {
	Partner: string;
	Sector: string;
};

export type RegionsDatumDownload = BaseDownloadDatum & {
	Region: string;
	"People Targeted": number;
};

export type SectorsDatumDownload = BaseDownloadDatum & {
	Sector: string;
	Budget: number;
};

type ProcessDownloadParams = {
	data: Data;
	lists: List;
	fund: number[];
	status: number[];
};

type ProcessIndicatorsDownloadParams = {
	allSectorsData: AllSectorsDatum;
	lists: List;
};

const notApplicable = "N/A";

export function processPartnersDownload({
	data,
	lists,
	fund,
	status,
}: ProcessDownloadParams) {
	const partnersDataDownload: PartnersDatumDownload[] = [];

	data.forEach(datum => {
		if (checkRow(datum, fund, status)) {
			const baseDownloadDatum = populateBaseDownloadDatum(datum, lists);
			delete baseDownloadDatum.Budget;
			datum.sectorData.forEach(sectorDatum => {
				partnersDataDownload.push({
					...baseDownloadDatum,
					Partner: lists.organizations[datum.organizationId],
					Sector: lists.sectors[sectorDatum.sectorId],
					Budget: sectorDatum.budget,
				});
			});
		}
	});

	return partnersDataDownload;
}

export function processRegionsDownload({
	data,
	lists,
	fund,
	status,
}: ProcessDownloadParams) {
	const regionsDataDownload: RegionsDatumDownload[] = [];

	data.forEach(datum => {
		if (checkRow(datum, fund, status)) {
			const baseDownloadDatum = populateBaseDownloadDatum(datum, lists);
			const thisRegion = lists.regions.find(d =>
				d.funds.has(datum.fund),
			)?.regionName;
			regionsDataDownload.push({
				...baseDownloadDatum,
				"People Targeted":
					datum.targeted.boys +
					datum.targeted.girls +
					datum.targeted.men +
					datum.targeted.women,
				Region: thisRegion ?? notApplicable,
			});
		}
	});

	return regionsDataDownload;
}

export function processSectorsDownload({
	data,
	lists,
	fund,
	status,
}: ProcessDownloadParams) {
	const sectorsDataDownload: SectorsDatumDownload[] = [];

	data.forEach(datum => {
		if (checkRow(datum, fund, status)) {
			const baseDownloadDatum = populateBaseDownloadDatum(datum, lists);
			delete baseDownloadDatum.Budget;
			datum.sectorData.forEach(sectorDatum => {
				sectorsDataDownload.push({
					...baseDownloadDatum,
					Sector: lists.sectors[sectorDatum.sectorId],
					Budget: sectorDatum.budget,
				});
			});
		}
	});

	return sectorsDataDownload;
}

export function processIndicatorsDownload({
	allSectorsData,
	lists,
}: ProcessIndicatorsDownloadParams): IndicatorsDatumDownload[] {
	const indicatorsDataDownload: IndicatorsDatumDownload[] = [];

	allSectorsData.sectorData.forEach(sector => {
		indicatorsDataDownload.push({
			Indicator: lists.globalIndicators[sector.indicatorId],
			sector: lists.sectors[sector.sector],
			"Unit of values":
				sector.unit === "%" ? "percentage" : sector.unitName,
			"Targeted Women": sector.targeted.women ?? notApplicable,
			"Targeted Men": sector.targeted.men ?? notApplicable,
			"Targeted Girls": sector.targeted.girls ?? notApplicable,
			"Targeted Boys": sector.targeted.boys ?? notApplicable,
			"Targeted Total": sector.targetedTotal ?? notApplicable,
			"Reached Women": sector.reached.women ?? notApplicable,
			"Reached Men": sector.reached.men ?? notApplicable,
			"Reached Girls": sector.reached.girls ?? notApplicable,
			"Reached Boys": sector.reached.boys ?? notApplicable,
			"Reached Total": sector.reachedTotal ?? notApplicable,
		});
	});

	return indicatorsDataDownload;
}

function populateBaseDownloadDatum(
	datum: Data[number],
	lists: List,
): BaseDownloadDatum {
	return {
		Year: datum.year,
		Fund: lists.fundNames[datum.fund],
		"Allocation Source": lists.allocationSources[datum.allocationSource],
		"Allocation Name": lists.allocationTypes[datum.allocationType],
		"Project Status": lists.projectStatus[datum.projectStatus],
		"Project Code": datum.projectCode,
		Budget: datum.budget,
	};
}

function checkRow(
	datum: Data[number],
	fund: number[],
	status: number[],
): boolean {
	return fund.includes(datum.fund) && status.includes(datum.projectStatus);
}
