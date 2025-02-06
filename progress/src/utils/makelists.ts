import {
	AllocationSourcesMasterObject,
	AllocationTypesMasterObject,
	BeneficiaryTypesMasterObject,
	OrganizationMasterObject,
	OrganizationTypesMasterObject,
	PooledFundsMasterObject,
	ProjectStatusMasterObject,
	SectorsMasterObject,
	GlobalIndicatorsMasterObject,
	pooledFundsMasterObjectSchema,
	beneficiaryTypesMasterObjectSchema,
	allocationTypesMasterObjectSchema,
	allocationSourcesMasterObjectSchema,
	organizationTypesMasterObjectSchema,
	sectorsMasterObjectSchema,
	organizationMasterObjectSchema,
	projectStatusMasterObjectSchema,
	globalIndicatorsMasterObjectSchema,
	EmergenciesMasterObject,
	emergenciesMasterObjectSchema,
	CvaMasterObject,
	cvaMasterObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";
import { GenderAndAge, ReportType } from "./processrawdata";

type MakeListParams = {
	allocationTypesMaster: AllocationTypesMasterObject[];
	organizationMaster: OrganizationMasterObject[];
	projectStatusMaster: ProjectStatusMasterObject[];
	beneficiaryTypesMaster: BeneficiaryTypesMasterObject[];
	pooledFundsMaster: PooledFundsMasterObject[];
	allocationSourcesMaster: AllocationSourcesMasterObject[];
	organizationTypesMaster: OrganizationTypesMasterObject[];
	sectorsMaster: SectorsMasterObject[];
	globalIndicatorsMaster: GlobalIndicatorsMasterObject[];
	emergenciesMaster: EmergenciesMasterObject[];
	cvaMaster: CvaMasterObject[];
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

export type GlobalIndicatorsDetails = {
	[K in GenderAndAge]: boolean;
} & {
	unit: GlobalIndicatorsMasterObject["UnitAb"];
	unitName: GlobalIndicatorsMasterObject["UnitNm"];
};

export type ProjectDetails = {
	year: number;
	fund: number;
	allocationSource: number;
	allocationType: number;
	endDate: Date;
	approvalDate: Date;
	projectStatusId: number;
	reportType: ReportType;
};

type EmergencyTypes = {
	[key: number]: {
		emergencyCategory: number;
		emergencyGroup: number;
	};
};

type EmergencyCategories = {
	emergencyTypes: Set<number>;
	emergencyGroup: number;
};

type EmergencyGroups = {
	emergencyTypes: Set<number>;
	emergencyCategories: Set<number>;
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
	globalIndicators: ListObj;
	globalIndicatorsDetails: Map<number, GlobalIndicatorsDetails>;
	projectDetails: Map<number, ProjectDetails>;
	emergencyTypeNames: ListObj;
	emergencyGroupNames: ListObj;
	emergencyCategoryNames: ListObj;
	emergencyDetails: {
		emergencyTypes: EmergencyTypes;
		emergencyGroups: Map<number, EmergencyGroups>;
		emergencyCategories: Map<number, EmergencyCategories>;
	};
	cvaTypeNames: ListObj;
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
	globalIndicatorsMaster,
	emergenciesMaster,
	cvaMaster,
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
		globalIndicators: {},
		globalIndicatorsDetails: new Map(),
		projectDetails: new Map(),
		emergencyTypeNames: {},
		emergencyGroupNames: {},
		emergencyCategoryNames: {},
		emergencyDetails: {
			emergencyTypes: {},
			emergencyGroups: new Map(),
			emergencyCategories: new Map(),
		},
		cvaTypeNames: {},
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

	cvaMaster.forEach(d => {
		const parsedCvaMaster = cvaMasterObjectSchema.safeParse(d);
		if (parsedCvaMaster.success) {
			lists.cvaTypeNames[d.CVAId] = d.CVAName;
		} else {
			warnInvalidSchema(
				"CvaMaster",
				d,
				JSON.stringify(parsedCvaMaster.error)
			);
		}
	});

	globalIndicatorsMaster.forEach(d => {
		const parsedGlobalIndicatorsMaster =
			globalIndicatorsMasterObjectSchema.safeParse(d);
		if (parsedGlobalIndicatorsMaster.success) {
			lists.globalIndicators[d.Id] = d.Name;
			lists.globalIndicatorsDetails.set(d.Id, {
				women: Boolean(d.HasW),
				men: Boolean(d.HasM),
				girls: Boolean(d.HasG),
				boys: Boolean(d.HasB),
				unit: d.UnitAb,
				unitName: d.UnitNm,
			});
		} else {
			warnInvalidSchema(
				"GlobalIndicatorsMaster",
				d,
				JSON.stringify(parsedGlobalIndicatorsMaster.error)
			);
		}
	});

	emergenciesMaster.forEach(d => {
		const parsedEmergenciesMaster =
			emergenciesMasterObjectSchema.safeParse(d);
		if (parsedEmergenciesMaster.success) {
			lists.emergencyTypeNames[d.EmergencyTypeId] = d.EmergencyTypeName;
			lists.emergencyGroupNames[d.EmergencyGroupId] =
				d.EmergencyGroupName;
			lists.emergencyCategoryNames[d.EmergencyCategoryId] =
				d.EmergencyCategoryName;

			if (!lists.emergencyDetails.emergencyTypes[d.EmergencyTypeId]) {
				lists.emergencyDetails.emergencyTypes[d.EmergencyTypeId] = {
					emergencyCategory: d.EmergencyCategoryId,
					emergencyGroup: d.EmergencyGroupId,
				};
			}

			const emergencyGroup = lists.emergencyDetails.emergencyGroups.get(
				d.EmergencyGroupId
			);

			if (!emergencyGroup) {
				lists.emergencyDetails.emergencyGroups.set(d.EmergencyGroupId, {
					emergencyTypes: new Set([d.EmergencyTypeId]),
					emergencyCategories: new Set([d.EmergencyCategoryId]),
				});
			} else {
				emergencyGroup.emergencyTypes.add(d.EmergencyTypeId);
				emergencyGroup.emergencyCategories.add(d.EmergencyCategoryId);
			}

			const emergencyCategory =
				lists.emergencyDetails.emergencyCategories.get(
					d.EmergencyCategoryId
				);

			if (!emergencyCategory) {
				lists.emergencyDetails.emergencyCategories.set(
					d.EmergencyCategoryId,
					{
						emergencyTypes: new Set([d.EmergencyTypeId]),
						emergencyGroup: d.EmergencyGroupId,
					}
				);
			} else {
				emergencyCategory.emergencyTypes.add(d.EmergencyTypeId);
			}
		} else {
			warnInvalidSchema(
				"EmergenciesMaster",
				d,
				JSON.stringify(parsedEmergenciesMaster.error)
			);
		}
	});

	return lists;
}

export default makeLists;
