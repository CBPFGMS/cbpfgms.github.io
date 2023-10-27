function preProcessData({
	bySector,
	byDisability,
	byLocation,
	byType,
	setInDataLists,
}: PreProcessDataParams): PreProcessDataReturn {
	const reportYearsSet = new Set<number>();
	const sectorsSet = new Set<number>();
	const allocationTypesSet = new Set<number>();
	const allocationSourcesSet = new Set<number>();
	const beneficiaryTypesSet = new Set<number>();
	const fundsSet = new Set<number>();

	const bySectorYear: BySectorYear = [];
	const byDisabilityYear: ByDisabilityYear = [];
	const byLocationYear: ByLocationYear = [];
	const byTypeYear: ByTypeYear = [];

	byDisability.forEach(row => {
		fundsSet.add(row.PooledFundId);
		reportYearsSet.add(row.ReportApprovedDate.getFullYear());
		allocationTypesSet.add(row.AllocationtypeId);
		allocationSourcesSet.add(row.AllocationSourceId);
		populateYear<typeof row>(
			row,
			byDisabilityYear,
			row.ReportApprovedDate.getFullYear()
		);
	});

	bySector.forEach(row => {
		sectorsSet.add(row.ClusterId);
		populateYear<typeof row>(
			row,
			bySectorYear,
			row.ReportApprovedDate.getFullYear()
		);
	});

	byLocation.forEach(row => {
		populateYear<typeof row>(
			row,
			byLocationYear,
			row.ApprovedDate.getFullYear()
		);
	});

	byType.forEach(row => {
		beneficiaryTypesSet.add(row.BeneficiaryTypeId);
		populateYear<typeof row>(
			row,
			byTypeYear,
			row.ReportApprovedDate.getFullYear()
		);
	});

	setInDataLists({
		reportYears: reportYearsSet,
		sectors: sectorsSet,
		allocationTypes: allocationTypesSet,
		allocationSources: allocationSourcesSet,
		beneficiaryTypes: beneficiaryTypesSet,
		funds: fundsSet,
	});

	bySectorYear.sort((a, b) => a.year - b.year);
	byDisabilityYear.sort((a, b) => a.year - b.year);
	byLocationYear.sort((a, b) => a.year - b.year);
	byTypeYear.sort((a, b) => a.year - b.year);

	return { bySectorYear, byDisabilityYear, byLocationYear, byTypeYear };
}

function populateYear<TObj>(
	row: TObj,
	dataArray: GenericYear<TObj>,
	yearValue: number
): void {
	const foundYear = dataArray.find(year => year.year === yearValue);
	if (foundYear) {
		foundYear.values.push(row);
	} else {
		dataArray.push({
			year: yearValue,
			values: [row],
		});
	}
}

export default preProcessData;
