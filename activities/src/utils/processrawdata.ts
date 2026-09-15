import {
	type ProjectSummaryObject,
	type ProjectSummaryAggregatedObject,
	type ActivitiesObject,
	type TemplatesMasterJson,
	projectSummaryObjectSchema,
	projectSummaryAggregatedObjectSchema,
	activitiesObjectSchema,
	templatesMasterObjectSchema,
} from "./schemas";
import type { List } from "./makelists";
import warnInvalidSchema, {
	warnProjectNotFound,
	simpleWarn,
} from "./warninvalid";
import { constants, projectStatusMapping } from "./constants";
import type { Tranche, TrancheNumbers } from "../components/MainContainer";

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
	tranche: TrancheNumbers;
};

export type Data = Datum[];

export type InDataLists = {
	sectors: Set<number>;
	sectorsPerTranche: { [tranche in TrancheNumbers]: Set<number> };
	projectsPerTranche: { [tranche in TrancheNumbers]: Set<string> };
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
	templatesMaster: TemplatesMasterJson;
};

type ActivitiesPerLocationId = Map<
	number,
	{ activity: number; sector: number }[]
>;

type ThisAdminLevel = 1 | 2 | 3 | 4 | 5 | 6;

type ParentAdminLevel = 0 | 1 | 2 | 3 | 4 | 5;

const seenActivitySector = new Set<string>();

const { lastAdminLevel, tranche1Name, tranche2Name } = constants;

function processRawData({
	projectSummary,
	projectSummaryAggregated,
	activities,
	lists,
	templatesMaster,
}: ProcessRawDataParams): {
	data: Data;
	inDataLists: InDataLists;
} {
	const data: Data = [];

	const activitiesPerLocationId: ActivitiesPerLocationId = new Map();

	const sectorsSet: Set<InDataListsValues["sectors"]> = new Set();
	const sectorsPerTranche: InDataLists["sectorsPerTranche"] = {
		1: new Set(),
		2: new Set(),
	};
	const projectsPerTranche: InDataLists["projectsPerTranche"] = {
		1: new Set(),
		2: new Set(),
	};

	templatesMaster.data.forEach(row => {
		const parsedRow = templatesMasterObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema("templatesMaster", row, parsedRow.error.message);
			return;
		}

		const thisTranche: Tranche = row.GroupNames.includes(tranche1Name)
			? 1
			: row.GroupNames.includes(tranche2Name)
				? 2
				: "all";

		if (thisTranche !== "all") {
			if (projectsPerTranche[thisTranche] === undefined) {
				projectsPerTranche[thisTranche] = new Set(row.ProjectCodes);
			} else {
				row.ProjectCodes.forEach(projectCode => {
					projectsPerTranche[thisTranche].add(projectCode);
				});
			}
		} else {
			simpleWarn(
				`Templates master GroupNames ${row.GroupNames} did not match any known tranche`,
			);
		}
	});

	activities.forEach(row => {
		const parsedRow = activitiesObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const locationId = row.LocationBeneficiaryId;
			const compositeKey = `${locationId}|${row.GlobalStandardActivityID}|${row.GlobalClusterId}`;

			//TODO: REMOVE, TEMPORARY FILTER CHECKING IF THE ACTIVITY ID EXISTS IN THE ACTIVITY MASTER
			if (!lists.activities[row.GlobalStandardActivityID]) {
				simpleWarn(
					`Activity ID ${row.GlobalStandardActivityID} not found in the Activity Master`,
				);
				return;
			}

			const thisTranche = getTrancheForProject(
				row.CHFProjectCode,
				projectsPerTranche,
			);

			if (!thisTranche) {
				simpleWarn(
					`Project code ${row.CHFProjectCode} in activities data did not match any known tranche`,
				);
				return;
			}

			if (lists.activitiesPerSector[row.GlobalClusterId]) {
				lists.activitiesPerSector[row.GlobalClusterId].add(
					row.GlobalStandardActivityID,
				);
			} else {
				lists.activitiesPerSector[row.GlobalClusterId] = new Set([
					row.GlobalStandardActivityID,
				]);
			}

			if (
				lists.activitiesPerTrancheAndSector[thisTranche][
					row.GlobalClusterId
				]
			) {
				lists.activitiesPerTrancheAndSector[thisTranche][
					row.GlobalClusterId
				].add(row.GlobalStandardActivityID);
			} else {
				lists.activitiesPerTrancheAndSector[thisTranche][
					row.GlobalClusterId
				] = new Set([row.GlobalStandardActivityID]);
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
				parsedRow.error.message,
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
			warnInvalidSchema("Project Summary", row, parsedRow.error.message);
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

			const thisTranche = getTrancheForProject(
				row.PrjCode,
				projectsPerTranche,
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

			if (!latitude || !longitude) {
				warnProjectNotFound(
					row.PrjCode,
					row,
					"Coordinates not found for any admin level",
				);
			}

			if (!thisTranche) {
				warnProjectNotFound(
					row.PrjCode,
					row,
					"Project not found in any tranche",
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

			if (
				thisProject &&
				thisActivity &&
				latitude &&
				longitude &&
				thisTranche
			) {
				const sectors = thisActivity.map(a => a.sector);

				sectors.forEach(s => {
					sectorsPerTranche[thisTranche].add(s);
					sectorsSet.add(s);
				});

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
						tranche: thisTranche,
					};

					data.push(objDatum);
				});
			}
		} else {
			warnInvalidSchema(
				"Project Summary Aggregated",
				row,
				parsedRow.error.message,
			);
		}
	});

	const inDataLists: InDataLists = {
		sectors: sectorsSet,
		projectsPerTranche,
		sectorsPerTranche,
	};

	return { data, inDataLists };
}

function getTrancheForProject(
	projectCode: string,
	projectsPerTranche: InDataLists["projectsPerTranche"],
): TrancheNumbers | null {
	if (projectsPerTranche[1].has(projectCode)) {
		return 1;
	} else if (projectsPerTranche[2].has(projectCode)) {
		return 2;
	} else {
		return null;
	}
}

export default processRawData;
