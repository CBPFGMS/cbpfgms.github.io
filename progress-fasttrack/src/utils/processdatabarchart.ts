import {
	Data,
	InDataLists,
	TotalBeneficiariesByBeneficiaryTypeData,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
} from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses, Tranche } from "../components/MainContainer";
import { BeneficiariesObject, GenderAndAge } from "./processrawdata";
import constants from "./constants";
import { sum } from "d3";
import { simpleWarn } from "./warninvalid";
import flipObject from "./flipobject";
import { isAllStatusesSelected, sumStatusesCapped } from "./sumstatuses";

export type DatumBarChart = {
	type: number;
	fundsWithType: Set<number>;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

type ProcessDataBarChartParams = {
	data: Data;
	fund: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	inDataLists: InDataLists;
	tranche: Tranche;
};

const { beneficiaryCategories } = constants;

function processDataBarChart({
	data,
	fund,
	implementationStatus,
	lists,
	totalBeneficiariesByPartnerData,
	totalBeneficiariesBySectorData,
	totalBeneficiariesByBeneficiaryTypeData,
	inDataLists,
	tranche,
}: ProcessDataBarChartParams): {
	dataOrganization: DatumBarChart[];
	dataSector: DatumBarChart[];
	dataBeneficiaryByType: DatumBarChart[];
} {
	const dataBeneficiaryByType: DatumBarChart[] = [];
	const dataOrganization: DatumBarChart[] = [];
	const dataSector: DatumBarChart[] = [];

	const numericStatuses = flipObject(lists.statuses);

	const statuses = implementationStatus.map(
		implSt => +numericStatuses[implSt as ImplementationStatuses],
	);

	const allStatusesSelected = isAllStatusesSelected(implementationStatus);

	const beneficiaryTypes = Object.keys(lists.beneficiaryTypes).map(d => +d);

	beneficiaryTypes.forEach(beneficiaryType => {
		dataBeneficiaryByType.push({
			type: beneficiaryType,
			fundsWithType: new Set(),
			targeted: beneficiaryCategories.reduce((acc, genderAndAge) => {
				acc[genderAndAge] = 0;
				return acc;
			}, {} as BeneficiariesObject),
			reached: beneficiaryCategories.reduce((acc, genderAndAge) => {
				acc[genderAndAge] = 0;
				return acc;
			}, {} as BeneficiariesObject),
		});
	});

	data.forEach(datum => {
		const thisStatus = lists.statuses[
			datum.projectStatusId
		] as ImplementationStatuses;
		if (
			implementationStatus.includes(thisStatus) &&
			fund.includes(datum.fund) &&
			(tranche === "all" ||
				inDataLists.projectsPerTranche[tranche]?.has(datum.projectCode))
		) {
			const foundOrganization = dataOrganization.find(
				d => d.type === datum.organizationType,
			);

			if (foundOrganization) {
				foundOrganization.fundsWithType.add(datum.fund);
			} else {
				const type = datum.organizationType;

				const targeted = beneficiaryCategories.reduce(
					(acc, genderAndAge) => {
						acc[genderAndAge] = 0;
						return acc;
					},
					{} as BeneficiariesObject,
				);
				const reached = beneficiaryCategories.reduce(
					(acc, genderAndAge) => {
						acc[genderAndAge] = 0;
						return acc;
					},
					{} as BeneficiariesObject,
				);

				const obj: DatumBarChart = {
					type,
					targeted,
					reached,
					fundsWithType: new Set([datum.fund]),
				};

				dataOrganization.push(obj);
			}

			datum.sectorData.forEach(sectorDatum => {
				const foundSector = dataSector.find(
					d => d.type === sectorDatum.sectorId,
				);

				if (foundSector) {
					foundSector.fundsWithType.add(datum.fund);
				} else {
					const type = sectorDatum.sectorId;

					const targeted = beneficiaryCategories.reduce(
						(acc, genderAndAge) => {
							acc[genderAndAge] = 0;
							return acc;
						},
						{} as BeneficiariesObject,
					);
					const reached = beneficiaryCategories.reduce(
						(acc, genderAndAge) => {
							acc[genderAndAge] = 0;
							return acc;
						},
						{} as BeneficiariesObject,
					);

					const obj: DatumBarChart = {
						type,
						targeted,
						reached,
						fundsWithType: new Set([datum.fund]),
					};

					dataSector.push(obj);
				}
			});
		}
	});

	dataOrganization.forEach(org => {
		fund.forEach(pf => {
			if (!org.fundsWithType.has(pf)) {
				return;
			}

			if (!totalBeneficiariesByPartnerData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data`,
				);
				return;
			}

			addFundFigures(
				org,
				totalBeneficiariesByPartnerData[pf],
				d => d.partner === org.type,
				statuses,
				allStatusesSelected,
				`Partner ${org.type} not found in totalBeneficiariesByPartner data for fund ${pf}`,
			);
		});
	});

	dataSector.forEach(sect => {
		fund.forEach(pf => {
			if (!sect.fundsWithType.has(pf)) {
				return;
			}

			if (!totalBeneficiariesBySectorData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesBySector data`,
				);
				return;
			}

			addFundFigures(
				sect,
				totalBeneficiariesBySectorData[pf],
				d => d.sector === sect.type,
				statuses,
				allStatusesSelected,
				`Sector ${sect.type} not found in totalBeneficiariesByPartner data for fund ${pf}`,
			);
		});
	});

	dataBeneficiaryByType.forEach(benType => {
		fund.forEach(pf => {
			if (!inDataLists.fundsPerBeneficiaryType[benType.type].has(pf)) {
				return;
			}

			if (!totalBeneficiariesByBeneficiaryTypeData[pf]) {
				simpleWarn(
					`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data`,
				);
				return;
			}

			addFundFigures(
				benType,
				totalBeneficiariesByBeneficiaryTypeData[pf],
				d => d.beneficiaryType === benType.type,
				statuses,
				allStatusesSelected,
				`Beneficiary type ${benType.type} not found in totalBeneficiariesByBeneficiaryType data for fund ${pf}`,
			);
		});
	});

	dataBeneficiaryByType.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);
	dataOrganization.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);
	dataSector.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);

	return { dataBeneficiaryByType, dataOrganization, dataSector };
}

type GenderBreakdown = {
	[key in GenderAndAge]: { targeted: number; reached: number };
};

//adds one fund's figures for one partner/sector/beneficiary type: the unique
//("all") figures when every status is selected, otherwise the sum of the
//selected statuses limited to the unique figures
function addFundFigures<T extends GenderBreakdown>(
	datum: DatumBarChart,
	thisFundData: { [status: number]: T[]; all: T[] },
	matches: (d: T) => boolean,
	statuses: number[],
	allStatusesSelected: boolean,
	warnMessage: string,
): void {
	const allDatum = thisFundData.all.find(matches);

	let fundFigures: GenderBreakdown;

	if (allStatusesSelected) {
		if (!allDatum) {
			simpleWarn(warnMessage);
			return;
		}
		fundFigures = allDatum;
	} else {
		const statusData = statuses.map(st => {
			const found = thisFundData[st]?.find(matches);
			if (!found) simpleWarn(`${warnMessage} and status ${st}`);
			return found;
		});
		fundFigures = sumStatusesCapped(
			statusData,
			allDatum,
			beneficiaryCategories,
		);
	}

	beneficiaryCategories.forEach(key => {
		datum.targeted[key] += fundFigures[key].targeted;
		datum.reached[key] += fundFigures[key].reached;
	});
}

export default processDataBarChart;
