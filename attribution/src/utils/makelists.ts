import {
	type AllocationSourcesMasterObject,
	type AllocationTypesMasterObject,
	type OrganizationMasterObject,
	type OrganizationTypesMasterObject,
	type PooledFundsMasterObject,
	type SectorsMasterObject,
	type PooledFundsWithRegionMasterObject,
	type DonorsMasterObject,
	pooledFundsMasterObjectSchema,
	allocationTypesMasterObjectSchema,
	allocationSourcesMasterObjectSchema,
	organizationTypesMasterObjectSchema,
	sectorsMasterObjectSchema,
	organizationMasterObjectSchema,
	pooledFundsWithRegionMasterObjectSchema,
	donorsMasterObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";

type MakeListParams = {
	allocationTypesMaster: AllocationTypesMasterObject[];
	organizationMaster: OrganizationMasterObject[];
	pooledFundsMaster: PooledFundsMasterObject[];
	allocationSourcesMaster: AllocationSourcesMasterObject[];
	organizationTypesMaster: OrganizationTypesMasterObject[];
	sectorsMaster: SectorsMasterObject[];
	pooledFundsWithRegionMaster: PooledFundsWithRegionMasterObject[];
	donorsMaster: DonorsMasterObject[];
};

export type ListObj = {
	[key: number]: string;
};

export type AllocationTypeListObj = {
	[key: number]: AllocationTypesMasterObject;
};

type OrganizationListObj = {
	[key: number]: OrganizationMasterObject;
};

export type Regions = {
	regionName: string;
	funds: Set<number>;
};

export type ProjectDetails = {
	year: number;
	fund: number;
	allocationSource: number;
	allocationType: number;
	endDate: Date;
	projectName: string;
};

type NullableListObj = {
	[key: number]: string | null;
};

export type List = {
	fundNames: ListObj;
	fundAbbreviatedNames: ListObj;
	fundIsoCodes: ListObj;
	beneficiaryTypes: ListObj;
	allocationTypes: ListObj;
	allocationTypesCompleteList: AllocationTypeListObj;
	allocationSources: ListObj;
	organizationTypes: ListObj;
	organizations: ListObj;
	organizationsCompleteList: OrganizationListObj;
	sectors: ListObj;
	globalIndicators: ListObj;
	projectDetails: Map<number, ProjectDetails>;
	regions: Regions[];
	donorNonGMSNames: ListObj;
	donorGMSNames: ListObj;
	donorISO2Codes: NullableListObj;
	donorISO3Codes: NullableListObj;
	sectorsSplitOrder: number[];
};

function makeLists({
	allocationTypesMaster,
	organizationMaster,
	pooledFundsMaster,
	allocationSourcesMaster,
	organizationTypesMaster,
	sectorsMaster,
	pooledFundsWithRegionMaster,
	donorsMaster,
}: MakeListParams): List {
	const lists: List = {
		fundNames: {},
		fundAbbreviatedNames: {},
		fundIsoCodes: {},
		beneficiaryTypes: {},
		allocationTypes: {},
		allocationTypesCompleteList: {},
		allocationSources: {},
		organizationTypes: {},
		organizations: {},
		organizationsCompleteList: {},
		sectors: {},
		globalIndicators: {},
		projectDetails: new Map(),
		regions: [],
		donorNonGMSNames: {},
		donorGMSNames: {},
		donorISO2Codes: {},
		donorISO3Codes: {},
		sectorsSplitOrder: [],
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
				parsedFundMaster.error.message,
			);
		}
	});

	pooledFundsWithRegionMaster.forEach(d => {
		const parsedPooledFundsWithRegionMaster =
			pooledFundsWithRegionMasterObjectSchema.safeParse(d);
		if (parsedPooledFundsWithRegionMaster.success) {
			if (typeof d.CBPFId === "number") {
				const foundRegion = lists.regions.find(
					e => e.regionName === d.RegionNameArr,
				);
				if (foundRegion) {
					foundRegion.funds.add(d.CBPFId);
				} else {
					lists.regions.push({
						regionName: d.RegionNameArr,
						funds: new Set([d.CBPFId]),
					});
				}
			}
		} else {
			warnInvalidSchema(
				"PooledFundsWithRegionMaster",
				d,
				parsedPooledFundsWithRegionMaster.error.message,
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
				parsedAllocationTypeMaster.error.message,
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
				parsedAllocationSourcesMaster.error.message,
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
				parsedOrganizationTypesMaster.error.message,
			);
		}
	});

	sectorsMaster.forEach(d => {
		const parsedSectorsMaster = sectorsMasterObjectSchema.safeParse(d);
		if (parsedSectorsMaster.success) {
			lists.sectors[d.ClustId] = d.ClustNm;
			lists.sectorsSplitOrder.push(d.ClustId);
		} else {
			warnInvalidSchema(
				"SectorsMaster",
				d,
				parsedSectorsMaster.error.message,
			);
		}
	});

	organizationMaster.forEach(d => {
		const parsedOrganizationMaster =
			organizationMasterObjectSchema.safeParse(d);
		if (parsedOrganizationMaster.success) {
			lists.organizations[d.GlobalUniqueId] = d.GlobalOrgName;
			lists.organizationsCompleteList[d.GlobalUniqueId] = d;
		} else {
			warnInvalidSchema(
				"OrganizationMaster",
				d,
				parsedOrganizationMaster.error.message,
			);
		}
	});

	donorsMaster.forEach(d => {
		const parsedDonorsMaster = donorsMasterObjectSchema.safeParse(d);
		if (parsedDonorsMaster.success) {
			lists.donorGMSNames[d.DonorID] = d.DonorName;
			lists.donorISO2Codes[d.DonorID] = d.CountryISO2;
			lists.donorISO3Codes[d.DonorID] = d.CountryISO3;
		} else {
			warnInvalidSchema(
				"DonorsMaster",
				d,
				parsedDonorsMaster.error.message,
			);
		}
	});

	return lists;
}

export default makeLists;
