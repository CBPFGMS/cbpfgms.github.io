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
				//in the future, do foundYear.partners += value.NumbofPartners;
			} else {
				data.push({
					year: value.AllocationYear,
					allocations: value.Budget,
					projects: value.NumbofProjects,
					partners: 0,
				});
			}
		}
	});

	data.sort((a, b) => b.year - a.year);

	return data;
};

export default processDataSummary;
