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
	projectStatus: number;
	allocationSource: number;
	organizationType: number;
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

type ThisAdminLevel = 1 | 2 | 3 | 4 | 5 | 6;

type ParentAdminLevel = 0 | 1 | 2 | 3 | 4 | 5;

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
			const locationId = row.LocationBeneficiaryId;
			const compositeKey = `${locationId}|${row.GlobalStandardActivityID}|${row.GlobalClusterId}`;

			if (lists.activitiesPerSector[row.GlobalClusterId]) {
				lists.activitiesPerSector[row.GlobalClusterId].add(
					row.GlobalStandardActivityID,
				);
			} else {
				lists.activitiesPerSector[row.GlobalClusterId] = new Set([
					row.GlobalStandardActivityID,
				]);
			}

			if (!seenActivitySector.has(compositeKey)) {
				seenActivitySector.add(compositeKey);

				if (!activitiesPerLocationId.has(locationId)) {
					activitiesPerLocationId.set(locationId, []);
				}

				activitiesPerLocationId.get(locationId)!.push({
					activity: row.GlobalStandardActivityID,
					sector: row.GlobalClusterId,
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

			let thisAdminLevel: ThisAdminLevel = lastAdminLevel;

			while (
				row[`AdmLoc${thisAdminLevel}`] === null &&
				thisAdminLevel > 0
			) {
				thisAdminLevel = (thisAdminLevel - 1) as ThisAdminLevel;
			}

			const parentAdminLevel: ParentAdminLevel = (thisAdminLevel -
				1) as ParentAdminLevel;

			const coord = row[`AdmLocCord${thisAdminLevel}`];
			const latitude = coord ? +coord.split(",")[0] : null;
			const longitude = coord ? +coord.split(",")[1] : null;

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

			if (!latitude || !longitude) {
				warnProjectNotFound(
					row.PrjCode,
					row,
					"Coordinates not found for any admin level",
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

			if (thisProject && thisActivity && latitude && longitude) {
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

				thisActivity.forEach(activity => {
					const objDatum: Datum = {
						fund: row.PFId,
						year: row.AYr,
						projectCode: row.PrjCode,
						projectStatus:
							projectStatusMapping[thisProject.PrjStsId],
						allocationSource: thisProject.AllSrc,
						organizationType: thisProject.OrgTypeId,
						locationLevel: thisAdminLevel,
						locationName:
							row[`AdmLoc${thisAdminLevel}`] ||
							"Unknown Location Name",
						parentLocationName: parentAdminLevel
							? row[`AdmLoc${parentAdminLevel}`]
							: null,
						latitude: latitude,
						longitude: longitude,
						sector: activity.sector,
						activity: activity.activity,
					};

					data.push(objDatum);
				});
			}
		} else {
			warnInvalidSchema(
				"Project Summary Aggregated",
				row,
				JSON.stringify(parsedRow.error),
			);
		}
	});

	const inDataLists: InDataLists = {
		years: yearsSet,
		sectors: sectorsSet,
		allocationSources: allocationSourcesSet,
		funds: fundsSet,
		organizationTypes: organizationTypesSet,
		projectStatuses: projectStatusesSet,
		activities: activitiesSet,
	};

	return { data, inDataLists };
}

export default processRawData;
