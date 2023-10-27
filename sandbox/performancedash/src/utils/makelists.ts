function makeLists({
	fundsMaster,
	locationMaster,
	beneficiariesMaster,
	allocationTypeMaster,
	allocationSourcesMaster,
	partnerTypesMaster,
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
		partnerTypes: {},
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

	partnerTypesMaster.forEach(d => {
		lists.partnerTypes[d.id] = d.OrganizationTypeName;
	});

	sectorsMaster.forEach(d => {
		lists.sectors[d.id] = d.ClustNm;
	});

	return lists;
}

export default makeLists;
