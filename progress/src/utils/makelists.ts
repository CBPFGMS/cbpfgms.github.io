import {
	beneficiariesMasterObjectSchema,
	allocationTypeMasterObjectSchema,
	fundsMasterObjectSchema,
	allocationSourcesMasterObjectSchema,
	organizationTypesMasterObjectSchema,
	sectorsMasterObjectSchema,
	BeneficiariesMaster,
	AllocationTypeMaster,
	FundsMaster,
	AllocationSourcesMaster,
	OrganizationTypesMaster,
	SectorsMaster,
} from "../schemas";
import warnInvalidSchema from "./warninvalid";

type MakeListParams = {
	fundsMaster: FundsMaster;
	beneficiariesMaster: BeneficiariesMaster;
	allocationTypeMaster: AllocationTypeMaster;
	allocationSourcesMaster: AllocationSourcesMaster;
	organizationTypesMaster: OrganizationTypesMaster;
	sectorsMaster: SectorsMaster;
};

type ListObj = {
	[key: number]: string;
};

type MasterFilesNumbers = {
	numberOfFundsInMaster: Set<number>;
	numberOfAllocationTypesInMaster: Set<number>;
	numberOfAllocationSourcesInMaster: Set<number>;
	numberOfOrganizationTypesInMaster: Set<number>;
	numberOfBeneficiaryTypesInMaster: Set<number>;
	numberOfSectorsInMaster: Set<number>;
};

export type List = {
	fundNames: ListObj;
	fundAbbreviatedNames: ListObj;
	fundIsoCodes: ListObj;
	beneficiaryTypes: ListObj;
	allocationTypes: ListObj;
	allocationSources: ListObj;
	organizationTypes: ListObj;
	sectors: ListObj;
	masterFilesNumbers: MasterFilesNumbers;
};

function makeLists({
	fundsMaster,
	beneficiariesMaster,
	allocationTypeMaster,
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
		allocationSources: {},
		organizationTypes: {},
		sectors: {},
		masterFilesNumbers: {
			numberOfFundsInMaster: new Set(),
			numberOfAllocationTypesInMaster: new Set(),
			numberOfAllocationSourcesInMaster: new Set(),
			numberOfOrganizationTypesInMaster: new Set(),
			numberOfBeneficiaryTypesInMaster: new Set(),
			numberOfSectorsInMaster: new Set(),
		},
	};

	fundsMaster.forEach(d => {
		const parsedFundMaster = fundsMasterObjectSchema.safeParse(d);
		if (parsedFundMaster.success) {
			lists.fundNames[d.id] = d.PooledFundName;
			lists.fundAbbreviatedNames[d.id] = d.PooledFundNameAbbrv;
			lists.fundIsoCodes[d.id] = d.ISO2Code;
			lists.masterFilesNumbers.numberOfFundsInMaster.add(d.id);
		} else {
			warnInvalidSchema(
				"FundsMaster",
				d,
				JSON.stringify(parsedFundMaster.error)
			);
		}
	});

	beneficiariesMaster.forEach(d => {
		const parsedBeneficiariesMaster =
			beneficiariesMasterObjectSchema.safeParse(d);
		if (parsedBeneficiariesMaster.success) {
			lists.beneficiaryTypes[d.BeneficiaryTypeId] = d.BeneficiaryType;
			lists.masterFilesNumbers.numberOfBeneficiaryTypesInMaster.add(
				d.BeneficiaryTypeId
			);
		} else {
			warnInvalidSchema(
				"BeneficiariesMaster",
				d,
				JSON.stringify(parsedBeneficiariesMaster.error)
			);
		}
	});

	allocationTypeMaster.forEach(d => {
		const parsedAllocationTypeMaster =
			allocationTypeMasterObjectSchema.safeParse(d);
		if (parsedAllocationTypeMaster.success) {
			lists.allocationTypes[d.AllocationtypeId] = d.AllocationType;
			lists.masterFilesNumbers.numberOfAllocationTypesInMaster.add(
				d.AllocationtypeId
			);
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
			lists.allocationSources[d.id] = d.AllocationName;
			lists.masterFilesNumbers.numberOfAllocationSourcesInMaster.add(
				d.id
			);
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
			lists.organizationTypes[d.id] = d.OrganizationTypeName;
			lists.masterFilesNumbers.numberOfOrganizationTypesInMaster.add(
				d.id
			);
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
			lists.sectors[d.id] = d.ClustNm;
			lists.masterFilesNumbers.numberOfSectorsInMaster.add(d.id);
		} else {
			warnInvalidSchema(
				"SectorsMaster",
				d,
				JSON.stringify(parsedSectorsMaster.error)
			);
		}
	});

	return lists;
}

export default makeLists;
