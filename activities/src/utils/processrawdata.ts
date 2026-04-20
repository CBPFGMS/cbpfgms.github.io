import {
	type ProjectSummaryObject,
	type ProjectSummaryAggregatedObject,
	type ActivitiesObject,
	projectSummaryObjectSchema,
	projectSummaryAggregatedObjectSchema,
	activitiesObjectSchema,
} from "./schemas";
import type { List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";
import { constants, projectStatusMapping } from "./constants";

export type Datum = {
	fund: number;
	year: number;
	projectCode: string;
	projectId: number;
	projectStatus: number;
	allocationSource: number;
	organizationType: number;
	budget: number;
	locationLevel: number;
	locationName: string;
	latitude: number;
	longitude: number;
	sector: number;
	activity: number;
};

export type Data = Datum[];

export type InDataLists = {
	years: Set<number>;
	sectors: Set<number>;
	allocationSources: Set<number>;
	funds: Set<number>;
	organizationTypes: Set<number>;
	projectStatuses: Set<number>;
	activities: Set<number>;
};

type SetType<T> = {
	[P in keyof T]: T[P] extends Set<infer U> ? U : never;
};

type InDataListsValues = SetType<InDataLists>;

type ProcessRawDataParams = {
	projectSummary: ProjectSummaryObject[];
	projectSummaryAggregated: ProjectSummaryAggregatedObject[];
	activities: ActivitiesObject[];
	lists: List;
};

type ActivitiesPerLocationId = {
	[key: number]: { activity: number; sector: number }[];
};

const { pipeSeparator } = constants;

const seenActivitySector = new Set<string>();

function processRawData({
	projectSummary,
	projectSummaryAggregated,
	activities,
	lists,
}: ProcessRawDataParams): {
	data: Data;
	inDataLists: InDataLists;
} {
	const data: Data = [];

	const activitiesPerLocationId: ActivitiesPerLocationId = {};

	const yearsSet: Set<InDataListsValues["years"]> = new Set();
	const sectorsSet: Set<InDataListsValues["sectors"]> = new Set();
	const allocationSourcesSet: Set<InDataListsValues["allocationSources"]> =
		new Set();
	const fundsSet: Set<InDataListsValues["funds"]> = new Set();
	const organizationTypesSet: Set<InDataListsValues["organizationTypes"]> =
		new Set();
	const projectStatusesSet: Set<InDataListsValues["projectStatuses"]> =
		new Set();
	const activitiesSet: Set<InDataListsValues["activities"]> = new Set();

	activities.forEach(row => {
		const parsedRow = activitiesObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const locationId = row.LocationBeneficiaryId;
			const compositeKey = `${locationId}|${row.GlobalStandardActivityID}|${row.ClusterId}`;

			if (!seenActivitySector.has(compositeKey)) {
				seenActivitySector.add(compositeKey);

				if (!activitiesPerLocationId[locationId]) {
					activitiesPerLocationId[locationId] = [];
				}

				activitiesPerLocationId[locationId].push({
					activity: row.GlobalStandardActivityID,
					sector: row.ClusterId,
				});
			}
		} else {
			warnInvalidSchema(
				"activities",
				row,
				JSON.stringify(parsedRow.error),
			);
		}
	});

	console.log(activitiesPerLocationId);

	projectSummaryAggregated.forEach(row => {
		const parsedRow = projectSummaryAggregatedObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const thisProject = projectSummary.find(
				datum => datum.PrjCode === row.PrjCode,
			);

			const thisActivity = activities.find(
				datum =>
					datum.LocationBeneficiaryId === row.LocationBeneficiaryID,
			);

			if (!thisProject) {
				warnProjectNotFound(
					row.PrjCode,
					row,
					"Project not found in Project Summary",
				);
			}

			if (!thisActivity) {
				warnProjectNotFound(
					row.PrjCode,
					row,
					"Location beneficiary ID not found in Location Activities",
				);
			}

			if (thisProject) {
				lists.projectDetails.set(row.PrjCode, {
					year: row.AYr,
					fund: row.PFId,
					allocationSource: thisProject.AllSrc,
					organizationType: thisProject.OrgTypeId,
					endDate: new Date(thisProject.AEndDt),
					projectStatusId: projectStatusMapping[thisProject.PrjStsId],
				});
			}

			if (thisProject && thisActivity) {
				const sectors: number[] =
					typeof row.ClstAgg === "string"
						? row.ClstAgg.split(pipeSeparator).map(d => +d)
						: [row.ClstAgg];
				yearsSet.add(row.AYr);
				sectors.forEach(s => sectorsSet.add(s));
				fundsSet.add(row.PFId);
				allocationSourcesSet.add(thisProject.AllSrc);
				organizationTypesSet.add(thisProject.OrgTypeId);
				projectStatusesSet.add(
					projectStatusMapping[thisProject.PrjStsId],
				);
				// activitiesSet.add(thisActivity.);

				return;

				const objDatum: Datum = {
					fund: row.PooledFundId,
					year: thisAllocationType.AllocationYear,
					projectCode: row.ChfProjectCode,
					projectId: row.ChfId,
					projectStatus: projectStatusMapping[row.ProcessSTatusID],
					allocationSource: thisAllocationType.AllocationSourceId,
					organizationType: thisOrganization.OrganizationTypeId,
					organizationId: thisOrganization.GlobalOrgId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`,
					),
					allocationTypeId: row.AllocationtypeId,
					endDate: new Date(row.EndDate),
					budget: row.Budget,
					sectorData: thisSectorData.sectors,
					reached: generateBeneficiariesObjectSummary(row, "reached"),
					targeted: generateBeneficiariesObjectSummary(
						row,
						"targeted",
					),
					reportType: row.RptCode ?? 0,
				};

				data.push(objDatum);
			}
		} else {
			warnInvalidSchema(
				"projectSummaryAggregated",
				row,
				JSON.stringify(parsedRow.error),
			);
		}
	});

	setInDataLists(() => ({
		years: yearsSet,
		sectors: sectorsSet,
		allocationTypes: allocationTypesSet,
		allocationSources: allocationSourcesSet,
		funds: fundsSet,
		organizationTypes: organizationTypesSet,
		organizations: organizationsSet,
		projectStatuses: projectStatusesSet,
	}));

	return data;
}

function generateBeneficiariesObjectSummary(
	row: ProjectSummaryObject,
	type: "reached" | "targeted" | "disabledReached" | "disabledTargeted",
): BeneficiariesObject {
	let girls = 0,
		boys = 0,
		women = 0,
		men = 0;

	if (type === "reached") {
		girls = row.AchG || 0;
		boys = row.AchB || 0;
		women = row.AchW || 0;
		men = row.AchM || 0;
	}

	if (type === "targeted") {
		girls = row.BenG || 0;
		boys = row.BenB || 0;
		women = row.BenW || 0;
		men = row.BenM || 0;
	}

	if (type === "disabledReached") {
		girls = row.AchDisabledG || 0;
		boys = row.AchDisabledB || 0;
		women = row.AchDisabledW || 0;
		men = row.AchDisabledM || 0;
	}

	if (type === "disabledTargeted") {
		girls = row.DisabledG || 0;
		boys = row.DisabledB || 0;
		women = row.DisabledW || 0;
		men = row.DisabledM || 0;
	}

	return {
		girls,
		boys,
		women,
		men,
	};
}

export default processRawData;
