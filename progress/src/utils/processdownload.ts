import { BeneficiariesObject, Data } from "./processrawdata";
import { ImplementationStatuses } from "../components/MainContainer";
import { List } from "./makelists";
import calculateStatus from "./calculatestatus";
import constants from "./constants";
import { AllSectorsDatum } from "./processdataindicators";

const { beneficiariesSplitOrder } = constants;

type BaseDownloadDatum = {
	Year: number;
	Fund: string;
	"Allocation Source": string;
	"Allocation Name": string;
	"Implementation Status": ImplementationStatuses;
	"Project Code": string;
	Budget: number;
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

type SummaryDatumDownload = BaseDownloadDatum & {
	Partner: string;
};

type PictogramDatumDownload = BaseDownloadDatum & BeneficiaryDownloadTypes;

type BeneficiaryTypesDatumDownload = BaseDownloadDatum &
	BeneficiaryDownloadTypes & {
		"Beneficiary Type": string;
	};

type SectorsDatumDownload = BaseDownloadDatum &
	BeneficiaryDownloadTypes & {
		Sector: string;
	};

type OrganizationsDatumDownload = BaseDownloadDatum &
	BeneficiaryDownloadTypes & {
		Organization: string;
	};

type DisabilityDatumDownload = BaseDownloadDatum & BeneficiaryDownloadTypes;

type GBVDatumDownload = BaseDownloadDatum & {
	"GBV budget planned": number;
	"GBV budget reached": number;
	"GBV targeted people": number;
	"GBV reached people": number;
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

type ProcessDownloadParams = {
	data: Data;
	lists: List;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	showFinanciallyClosed: boolean;
};

type ProcessIndicatorsDownloadParams = {
	allSectorsData: AllSectorsDatum;
	lists: List;
};

const notApplicable = "N/A";

export function processSummaryDownload({
	data,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: ProcessDownloadParams): SummaryDatumDownload[] {
	const summaryDataDownload: SummaryDatumDownload[] = [];

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists, showFinanciallyClosed);
		if (
			checkRow(
				thisStatus,
				datum,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus
			)
		) {
			const baseDownloadDatum = populateBaseDownloadDatum(
				datum,
				lists,
				thisStatus
			);

			summaryDataDownload.push({
				...baseDownloadDatum,
				Partner: lists.organizations[datum.organizationId],
			});
		}
	});

	return summaryDataDownload;
}

export function processPictogramDownload({
	data,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: ProcessDownloadParams): PictogramDatumDownload[] {
	const pictogramDataDownload: PictogramDatumDownload[] = [];

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists, showFinanciallyClosed);
		if (
			checkRow(
				thisStatus,
				datum,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus
			)
		) {
			const baseDownloadDatum = populateBaseDownloadDatum(
				datum,
				lists,
				thisStatus
			);

			pictogramDataDownload.push({
				...baseDownloadDatum,
				"Targeted Women": datum.targeted.women,
				"Targeted Men": datum.targeted.men,
				"Targeted Girls": datum.targeted.girls,
				"Targeted Boys": datum.targeted.boys,
				"Reached Women": datum.reached.women,
				"Reached Men": datum.reached.men,
				"Reached Girls": datum.reached.girls,
				"Reached Boys": datum.reached.boys,
			});
		}
	});

	return pictogramDataDownload;
}

export function processDisabilityDownload({
	data,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: ProcessDownloadParams): DisabilityDatumDownload[] {
	const disabilityDataDownload: DisabilityDatumDownload[] = [];

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists, showFinanciallyClosed);
		if (
			checkRow(
				thisStatus,
				datum,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus
			)
		) {
			const baseDownloadDatum = populateBaseDownloadDatum(
				datum,
				lists,
				thisStatus
			);

			disabilityDataDownload.push({
				...baseDownloadDatum,
				"Targeted Women": datum.disabledTargeted.women,
				"Targeted Men": datum.disabledTargeted.men,
				"Targeted Girls": datum.disabledTargeted.girls,
				"Targeted Boys": datum.disabledTargeted.boys,
				"Reached Women": datum.disabledReached.women,
				"Reached Men": datum.disabledReached.men,
				"Reached Girls": datum.disabledReached.girls,
				"Reached Boys": datum.disabledReached.boys,
			});
		}
	});

	return disabilityDataDownload;
}

export function processGBVDownload({
	data,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: ProcessDownloadParams): GBVDatumDownload[] {
	const gbvDataDownload: GBVDatumDownload[] = [];

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists, showFinanciallyClosed);
		if (
			checkRow(
				thisStatus,
				datum,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus
			)
		) {
			const baseDownloadDatum = populateBaseDownloadDatum(
				datum,
				lists,
				thisStatus
			);

			gbvDataDownload.push({
				...baseDownloadDatum,
				"GBV budget planned": datum.budgetGBVPlanned,
				"GBV budget reached": datum.budgetGBVReached,
				"GBV targeted people": datum.targetedGBV,
				"GBV reached people": datum.reachedGBV,
			});
		}
	});

	return gbvDataDownload;
}

export function processBeneficiaryTypesDownload({
	data,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: ProcessDownloadParams): BeneficiaryTypesDatumDownload[] {
	const beneficiaryTypesDataDownload: BeneficiaryTypesDatumDownload[] = [];

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists, showFinanciallyClosed);
		if (
			checkRow(
				thisStatus,
				datum,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus
			)
		) {
			const baseDownloadDatum = populateBaseDownloadDatum(
				datum,
				lists,
				thisStatus
			);

			beneficiariesSplitOrder.forEach(beneficiaryTypeAsNumber => {
				if (
					checkIfNonZero(
						datum.targetedByBeneficiaryType[beneficiaryTypeAsNumber]
					) ||
					checkIfNonZero(
						datum.reachedByBeneficiaryType[beneficiaryTypeAsNumber]
					)
				) {
					beneficiaryTypesDataDownload.push({
						...baseDownloadDatum,
						"Beneficiary Type":
							lists.beneficiaryTypes[beneficiaryTypeAsNumber],
						"Targeted Women":
							datum.targetedByBeneficiaryType[
								beneficiaryTypeAsNumber
							].women,
						"Targeted Men":
							datum.targetedByBeneficiaryType[
								beneficiaryTypeAsNumber
							].men,
						"Targeted Girls":
							datum.targetedByBeneficiaryType[
								beneficiaryTypeAsNumber
							].girls,
						"Targeted Boys":
							datum.targetedByBeneficiaryType[
								beneficiaryTypeAsNumber
							].boys,
						"Reached Women":
							datum.reachedByBeneficiaryType[
								beneficiaryTypeAsNumber
							].women,
						"Reached Men":
							datum.reachedByBeneficiaryType[
								beneficiaryTypeAsNumber
							].men,
						"Reached Girls":
							datum.reachedByBeneficiaryType[
								beneficiaryTypeAsNumber
							].girls,
						"Reached Boys":
							datum.reachedByBeneficiaryType[
								beneficiaryTypeAsNumber
							].boys,
					});
				}
			});
		}
	});

	return beneficiaryTypesDataDownload;
}

export function processSectorsDownload({
	data,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: ProcessDownloadParams): SectorsDatumDownload[] {
	const sectorsDataDownload: SectorsDatumDownload[] = [];

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists, showFinanciallyClosed);
		if (
			checkRow(
				thisStatus,
				datum,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus
			)
		) {
			const baseDownloadDatum = populateBaseDownloadDatum(
				datum,
				lists,
				thisStatus
			);

			datum.sectorData.forEach(sector => {
				sectorsDataDownload.push({
					...baseDownloadDatum,
					Sector: lists.sectors[sector.sectorId],
					"Targeted Women": sector.targeted.women,
					"Targeted Men": sector.targeted.men,
					"Targeted Girls": sector.targeted.girls,
					"Targeted Boys": sector.targeted.boys,
					"Reached Women": sector.reached.women,
					"Reached Men": sector.reached.men,
					"Reached Girls": sector.reached.girls,
					"Reached Boys": sector.reached.boys,
				});
			});
		}
	});

	return sectorsDataDownload;
}

export function processOrganizationsDownload({
	data,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: ProcessDownloadParams): OrganizationsDatumDownload[] {
	const organizationsDataDownload: OrganizationsDatumDownload[] = [];

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists, showFinanciallyClosed);
		if (
			checkRow(
				thisStatus,
				datum,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus
			)
		) {
			const baseDownloadDatum = populateBaseDownloadDatum(
				datum,
				lists,
				thisStatus
			);

			organizationsDataDownload.push({
				...baseDownloadDatum,
				Organization: lists.organizations[datum.organizationId],
				"Targeted Women": datum.targeted.women,
				"Targeted Men": datum.targeted.men,
				"Targeted Girls": datum.targeted.girls,
				"Targeted Boys": datum.targeted.boys,
				"Reached Women": datum.reached.women,
				"Reached Men": datum.reached.men,
				"Reached Girls": datum.reached.girls,
				"Reached Boys": datum.reached.boys,
			});
		}
	});

	return organizationsDataDownload;
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

function checkIfNonZero(obj: BeneficiariesObject): boolean {
	return Object.values(obj).some(value => value > 0);
}

function populateBaseDownloadDatum(
	datum: Data[number],
	lists: List,
	thisStatus: ImplementationStatuses
): BaseDownloadDatum {
	return {
		Year: datum.year,
		Fund: lists.fundNames[datum.fund],
		"Allocation Source": lists.allocationSources[datum.allocationSource],
		"Allocation Name": lists.allocationTypes[datum.allocationType],
		"Implementation Status": thisStatus,
		"Project Code": datum.projectCode,
		Budget: datum.budget,
	};
}

function checkRow(
	thisStatus: ImplementationStatuses,
	datum: Data[number],
	year: number[],
	fund: number[],
	allocationSource: number[],
	allocationType: number[],
	implementationStatus: ImplementationStatuses[]
): boolean {
	return (
		implementationStatus.includes(thisStatus) &&
		year.includes(datum.year) &&
		fund.includes(datum.fund) &&
		allocationSource.includes(datum.allocationSource) &&
		allocationType.includes(datum.allocationType)
	);
}
