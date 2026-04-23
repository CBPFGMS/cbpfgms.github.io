import {
	type AllocationSourcesMasterObject,
	type OrganizationTypesMasterObject,
	type PooledFundsMasterObject,
	type SectorsMasterObject,
	type ActivitiesMasterObject,
	pooledFundsMasterObjectSchema,
	allocationSourcesMasterObjectSchema,
	organizationTypesMasterObjectSchema,
	sectorsMasterObjectSchema,
	activitiesMasterObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";
import { projectStatusMaster } from "./constants";

type MakeListParams = {
	pooledFundsMaster: PooledFundsMasterObject[];
	allocationSourcesMaster: AllocationSourcesMasterObject[];
	organizationTypesMaster: OrganizationTypesMasterObject[];
	sectorsMaster: SectorsMasterObject[];
	activitiesMaster: ActivitiesMasterObject[];
};

export type ListObj = {
	[key: number]: string;
};

export type ProjectDetails = {
	year: number;
	fund: number;
	allocationSource: number;
	organizationType: number;
	endDate: Date;
	projectStatusId: number;
};

export type List = {
	fundNames: ListObj;
	fundAbbreviatedNames: ListObj;
	fundIsoCodes: ListObj;
	allocationSources: ListObj;
	organizationTypes: ListObj;
	organizations: ListObj;
	sectors: ListObj;
	globalIndicators: ListObj;
	projectDetails: Map<string, ProjectDetails>;
	projectStatus: ListObj;
	activities: ListObj;
	activitiesPerSector: {
		[key: number]: Set<number>;
	};
};

function makeLists({
	pooledFundsMaster,
	allocationSourcesMaster,
	organizationTypesMaster,
	sectorsMaster,
	activitiesMaster,
}: MakeListParams): List {
	const lists: List = {
		fundNames: {},
		fundAbbreviatedNames: {},
		fundIsoCodes: {},
		allocationSources: {},
		organizationTypes: {},
		organizations: {},
		sectors: {},
		globalIndicators: {},
		projectDetails: new Map(),
		projectStatus: projectStatusMaster,
		activities: {},
		activitiesPerSector: {},
	};

	pooledFundsMaster.forEach(d => {
		const parsedFundMaster = pooledFundsMasterObjectSchema.safeParse(d);
		if (parsedFundMaster.success) {
			lists.fundNames[d.PFId] = d.PFName;
			lists.fundAbbreviatedNames[d.PFId] = d.PFAbbrv;
			lists.fundIsoCodes[d.PFId] = d.PFCountryCode;
		} else {
			warnInvalidSchema(
				"PooledFundsMaster",
				d,
				JSON.stringify(parsedFundMaster.error),
			);
		}
	});

	allocationSourcesMaster.forEach(d => {
		const parsedAllocationSourcesMaster =
			allocationSourcesMasterObjectSchema.safeParse(d);
		if (parsedAllocationSourcesMaster.success) {
			lists.allocationSources[d.AllSrcId] = d.AllNm;
		} else {
			warnInvalidSchema(
				"AllocationSourcesMaster",
				d,
				JSON.stringify(parsedAllocationSourcesMaster.error),
			);
		}
	});

	organizationTypesMaster.forEach(d => {
		const parsedOrganizationTypesMaster =
			organizationTypesMasterObjectSchema.safeParse(d);
		if (parsedOrganizationTypesMaster.success) {
			lists.organizationTypes[d.OrgTypeId] = d.OrgTypeNm;
		} else {
			warnInvalidSchema(
				"OrganizationTypesMaster",
				d,
				JSON.stringify(parsedOrganizationTypesMaster.error),
			);
		}
	});

	sectorsMaster.forEach(d => {
		const parsedSectorsMaster = sectorsMasterObjectSchema.safeParse(d);
		if (parsedSectorsMaster.success) {
			lists.sectors[d.ClustId] = d.ClustNm;
		} else {
			warnInvalidSchema(
				"SectorsMaster",
				d,
				JSON.stringify(parsedSectorsMaster.error),
			);
		}
	});

	activitiesMaster.forEach(d => {
		const parsedActivitiesMaster =
			activitiesMasterObjectSchema.safeParse(d);
		if (parsedActivitiesMaster.success) {
			lists.activities[d.ID] = d.ActivityName;
		} else {
			warnInvalidSchema(
				"ActivitiesMaster",
				d,
				JSON.stringify(parsedActivitiesMaster.error),
			);
		}
	});

	return lists;
}

export default makeLists;
