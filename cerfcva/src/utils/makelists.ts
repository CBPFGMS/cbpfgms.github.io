import {
	type AllocationSourcesMasterObject,
	type AllocationTypesMasterObject,
	type OrganizationMasterObject,
	type OrganizationTypesMasterObject,
	type PooledFundsMasterObject,
	type SectorsMasterObject,
	type CvaMasterObject,
	pooledFundsMasterObjectSchema,
	allocationTypesMasterObjectSchema,
	organizationMasterObjectSchema,
	allocationSourcesMasterObjectSchema,
	organizationTypesMasterObjectSchema,
	sectorsMasterObjectSchema,
	cvaMasterObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";

type MakeListParams = {
	allocationTypesMaster: AllocationTypesMasterObject[];
	organizationMaster: OrganizationMasterObject[];
	pooledFundsMaster: PooledFundsMasterObject[];
	allocationSourcesMaster: AllocationSourcesMasterObject[];
	organizationTypesMaster: OrganizationTypesMasterObject[];
	sectorsMaster: SectorsMasterObject[];
	cvaMaster: CvaMasterObject[];
};

export type ListObj = {
	[key: number]: string;
};

type FundCoordinates = {
	[key: number]: { latitude: number; longitude: number };
};

export type AllocationTypeListObj = {
	[key: number]: AllocationTypesMasterObject;
};

type OrganizationListObj = {
	[key: number]: OrganizationMasterObject;
};

export type ProjectDetails = {
	year: number;
	fund: number;
	allocationSource: number;
	allocationType: number;
	endDate: Date;
	approvalDate: Date;
	projectStatusId: number;
};

export type List = {
	fundNames: ListObj;
	fundAbbreviatedNames: ListObj;
	fundCoordinates: FundCoordinates;
	allocationTypes: ListObj;
	allocationTypesCompleteList: AllocationTypeListObj;
	allocationSources: ListObj;
	allocationSourcesAbbreviated: ListObj;
	organizationTypes: ListObj;
	organizations: ListObj;
	organizationsAcronym: ListObj;
	organizationsCompleteList: OrganizationListObj;
	sectors: ListObj;
	statuses: ListObj;
	projectDetails: Map<number, ProjectDetails>;
	cvaTypeNames: ListObj;
};

function makeLists({
	allocationTypesMaster,
	pooledFundsMaster,
	organizationMaster,
	allocationSourcesMaster,
	organizationTypesMaster,
	sectorsMaster,
	cvaMaster,
}: MakeListParams): List {
	const lists: List = {
		fundNames: {},
		fundAbbreviatedNames: {},
		fundCoordinates: {},
		allocationTypes: {},
		allocationTypesCompleteList: {},
		allocationSources: {},
		allocationSourcesAbbreviated: {},
		organizationTypes: {},
		organizationsCompleteList: {},
		organizations: {},
		organizationsAcronym: {},
		sectors: {},
		statuses: {},
		projectDetails: new Map(),
		cvaTypeNames: {},
	};

	pooledFundsMaster.forEach(d => {
		const parsedFundMaster = pooledFundsMasterObjectSchema.safeParse(d);
		if (parsedFundMaster.success) {
			lists.fundNames[d.PFId] = d.PFName;
			lists.fundAbbreviatedNames[d.PFId] = d.PFAbbrv;
			lists.fundCoordinates[d.PFId] = {
				latitude: d.PFLat,
				longitude: d.PFLong,
			};
		} else {
			warnInvalidSchema(
				"PooledFundsMaster",
				d,
				JSON.stringify(parsedFundMaster.error)
			);
		}
	});

	allocationTypesMaster.forEach(d => {
		const parsedAllocationTypeMaster =
			allocationTypesMasterObjectSchema.safeParse(d);
		if (parsedAllocationTypeMaster.success) {
			lists.allocationTypes[
				parseFloat(`${d.PooledFundId}.${d.AllocationTypeId}`)
			] = d.AllocationTitle;
			lists.allocationTypesCompleteList[
				parseFloat(`${d.PooledFundId}.${d.AllocationTypeId}`)
			] = d;
		} else {
			warnInvalidSchema(
				"AllocationTypeMaster",
				d,
				JSON.stringify(parsedAllocationTypeMaster.error)
			);
		}
	});

	allocationSourcesMaster.forEach(d => {
		const parsedAllocationSourcesMaster =
			allocationSourcesMasterObjectSchema.safeParse(d);
		if (parsedAllocationSourcesMaster.success) {
			lists.allocationSources[d.AllSrcId] = d.AllNm;
			lists.allocationSourcesAbbreviated[d.AllSrcId] = d.AllSrcCode;
		} else {
			warnInvalidSchema(
				"AllocationSourcesMaster",
				d,
				JSON.stringify(parsedAllocationSourcesMaster.error)
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
				JSON.stringify(parsedOrganizationTypesMaster.error)
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
				JSON.stringify(parsedSectorsMaster.error)
			);
		}
	});

	organizationMaster.forEach(d => {
		const parsedOrganizationMaster =
			organizationMasterObjectSchema.safeParse(d);
		if (parsedOrganizationMaster.success) {
			lists.organizations[d.GlobalOrgId] = d.OrganizationName;
			lists.organizationsAcronym[d.GlobalOrgId] = d.OrganizationAcronym;
			lists.organizationsCompleteList[d.GlobalUniqueId] = d;
		} else {
			warnInvalidSchema(
				"OrganizationMaster",
				d,
				JSON.stringify(parsedOrganizationMaster.error)
			);
		}
	});

	cvaMaster.forEach(d => {
		const parsedCvaMaster = cvaMasterObjectSchema.safeParse(d);
		if (parsedCvaMaster.success) {
			lists.cvaTypeNames[d.Id] = d.CVATypeName;
		} else {
			warnInvalidSchema(
				"CvaMaster",
				d,
				JSON.stringify(parsedCvaMaster.error)
			);
		}
	});

	return lists;
}

export default makeLists;
