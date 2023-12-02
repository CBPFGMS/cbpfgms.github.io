import { MakeListParams, List } from "../types";

function makeLists({
	fundsMaster,
	locationMaster,
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
		locations: {},
		beneficiaryTypes: {},
		allocationTypes: {},
		allocationSources: {},
		organizationTypes: {},
		sectors: {},
	};

	fundsMaster.forEach(d => {
		lists.fundNames[d.id] = d.PooledFundName;
		lists.fundAbbreviatedNames[d.id] = d.PooledFundNameAbbrv;
		lists.fundIsoCodes[d.id] = d.ISO2Code;
	});

	locationMaster.forEach(d => {
		lists.locations[d.LocationID] = {
			coordinates: [d.AdminLocation1Latitude, d.AdminLocation1Longitude],
			locationName: d.AdminLocation1,
		};
	});

	beneficiariesMaster.forEach(d => {
		lists.beneficiaryTypes[d.BeneficiaryTypeId] = d.BeneficiaryType;
	});

	allocationTypeMaster.forEach(d => {
		lists.allocationTypes[d.AllocationtypeId] = d.AllocationType;
	});

	allocationSourcesMaster.forEach(d => {
		lists.allocationSources[d.id] = d.AllocationName;
	});

	organizationTypesMaster.forEach(d => {
		lists.organizationTypes[d.id] = d.OrganizationTypeName;
	});

	sectorsMaster.forEach(d => {
		lists.sectors[d.id] = d.ClustNm;
	});

	return lists;
}

export default makeLists;
