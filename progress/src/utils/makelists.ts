import {
	AllocationSourcesMasterObject,
	AllocationTypesMasterObject,
	BeneficiaryTypesMasterObject,
	OrganizationMasterObject,
	OrganizationTypesMasterObject,
	PooledFundsMasterObject,
	ProjectStatusMasterObject,
	SectorsMasterObject,
	pooledFundsMasterObjectSchema,
	beneficiaryTypesMasterObjectSchema,
	allocationTypesMasterObjectSchema,
	allocationSourcesMasterObjectSchema,
	organizationTypesMasterObjectSchema,
	sectorsMasterObjectSchema,
	organizationMasterObjectSchema,
	projectStatusMasterObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";

type MakeListParams = {
	allocationTypesMaster: AllocationTypesMasterObject[];
	organizationMaster: OrganizationMasterObject[];
	projectStatusMaster: ProjectStatusMasterObject[];
	beneficiaryTypesMaster: BeneficiaryTypesMasterObject[];
	pooledFundsMaster: PooledFundsMasterObject[];
	allocationSourcesMaster: AllocationSourcesMasterObject[];
	organizationTypesMaster: OrganizationTypesMasterObject[];
	sectorsMaster: SectorsMasterObject[];
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
	statuses: ListObj;
};

function makeLists({
	allocationTypesMaster,
	organizationMaster,
	projectStatusMaster,
	beneficiaryTypesMaster,
	pooledFundsMaster,
	allocationSourcesMaster,
	organizationTypesMaster,
	sectorsMaster,
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
		statuses: {},
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
				JSON.stringify(parsedFundMaster.error)
			);
		}
	});

	beneficiaryTypesMaster.forEach(d => {
		const parsedBeneficiariesMaster =
			beneficiaryTypesMasterObjectSchema.safeParse(d);
		if (parsedBeneficiariesMaster.success) {
			lists.beneficiaryTypes[d.BeneficiaryTypeId] = d.BeneficiaryType;
		} else {
			warnInvalidSchema(
				"BeneficiaryTypesMaster",
				d,
				JSON.stringify(parsedBeneficiariesMaster.error)
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
			lists.organizations[d.GlobalUniqueId] = d.OrganizationName;
			lists.organizationsCompleteList[d.GlobalUniqueId] = d;
		} else {
			warnInvalidSchema(
				"OrganizationMaster",
				d,
				JSON.stringify(parsedOrganizationMaster.error)
			);
		}
	});

	projectStatusMaster.forEach(d => {
		const parsedProjectStatusMaster =
			projectStatusMasterObjectSchema.safeParse(d);
		if (parsedProjectStatusMaster.success) {
			lists.statuses[d.GlobalInstanceStatusId] = d.StatusCode;
		} else {
			warnInvalidSchema(
				"ProjectStatusMaster",
				d,
				JSON.stringify(parsedProjectStatusMaster.error)
			);
		}
	});

	return lists;
}

export default makeLists;
