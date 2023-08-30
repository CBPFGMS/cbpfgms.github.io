const processDataSummary: processDataSummary = ({
	rawData,
	reportYear,
	fund,
	allocationSource,
	allocationType,
}) => {
	const data: SummaryData[] = [];

	const thisYear = rawData.byDisability.find(
		year => year.year === reportYear[0] //Change this logic in case of multiyears
	);

	thisYear?.values.forEach(value => {
		if (
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId)
		) {
			const foundYear = data.find(d => d.year === value.AllocationYear);
			if (foundYear) {
				foundYear.allocations += value.Budget;
				foundYear.projects += value.NumbofProjects;
				foundYear.partners += value.TotalNumbPartners;
			} else {
				data.push({
					year: value.AllocationYear,
					allocations: value.Budget,
					projects: value.NumbofProjects,
					partners: value.TotalNumbPartners,
				});
			}
		}
	});

	data.sort((a, b) => b.year - a.year);

	return data;
};

export default processDataSummary;
