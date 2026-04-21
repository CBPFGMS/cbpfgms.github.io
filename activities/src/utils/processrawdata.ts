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
	parentLocationName: string | null;
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

type ActivitiesPerLocationId = Map<
	number,
	{ activity: number; sector: number }[]
>;

const seenActivitySector = new Set<string>();

const { lastAdminLevel } = constants;

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

	const activitiesPerLocationId: ActivitiesPerLocationId = new Map();

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
			// **********************************
			// IMPORTANT: THIS HAS TO BE THE GLOBAL SECTOR
			// **********************************

			const locationId = row.LocationBeneficiaryId;
			const compositeKey = `${locationId}|${row.GlobalStandardActivityID}|${row.ClusterId}`;

			if (!seenActivitySector.has(compositeKey)) {
				seenActivitySector.add(compositeKey);

				if (!activitiesPerLocationId.has(locationId)) {
					activitiesPerLocationId.set(locationId, []);
				}

				activitiesPerLocationId.get(locationId)!.push({
					activity: row.GlobalStandardActivityID,
					sector: row.ClusterId,
				});
			}
		} else {
			warnInvalidSchema(
				"Location Activities",
				row,
				JSON.stringify(parsedRow.error),
			);
		}
	});

	projectSummary.forEach(row => {
		const parsedRow = projectSummaryObjectSchema.safeParse(row);
		if (parsedRow.success) {
			lists.projectDetails.set(row.PrjCode, {
				year: row.AllYr,
				fund: row.PFId,
				allocationSource: row.AllSrc,
				organizationType: row.OrgTypeId,
				endDate: new Date(row.AEndDt),
				projectStatusId: projectStatusMapping[row.PrjStsId],
			});
		} else {
			warnInvalidSchema(
				"Project Summary",
				row,
				JSON.stringify(parsedRow.error),
			);
		}
	});

	projectSummaryAggregated.forEach(row => {
		const parsedRow = projectSummaryAggregatedObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const thisProject = projectSummary.find(
				datum => datum.PrjCode === row.PrjCode,
			);

			const thisActivity = activitiesPerLocationId.get(
				row.LocationBeneficiaryID,
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
				const sectors = thisActivity.map(a => a.sector);
				const activities = thisActivity.map(a => a.activity);

				yearsSet.add(row.AYr);
				sectors.forEach(s => sectorsSet.add(s));
				fundsSet.add(row.PFId);
				allocationSourcesSet.add(thisProject.AllSrc);
				organizationTypesSet.add(thisProject.OrgTypeId);
				projectStatusesSet.add(
					projectStatusMapping[thisProject.PrjStsId],
				);
				activities.forEach(a => activitiesSet.add(a));

				let thisAdminLevel = lastAdminLevel;

				while (
					row[`AdmLoc${thisAdminLevel}`] === null &&
					thisAdminLevel > 0
				) {
					thisAdminLevel--;
				}

				const objDatum: Datum = {};

				data.push(objDatum);
			}
		} else {
			warnInvalidSchema(
				"Project Summary Aggregated",
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

export default processRawData;
