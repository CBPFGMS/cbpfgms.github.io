const processDataSectors: ProcessDataSectors = ({
	allocationSource,
	allocationType,
	fund,
	rawData,
	reportYear,
	year,
}) => {
	const data: SectorsData[] = [];

	const thisYear = rawData.bySector.find(
		year => year.year === reportYear[0] //Change this logic in case of multiyears
	);

	thisYear?.values.forEach(value => {
		if (
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId) &&
			(year === null || year.includes(value.AllocationYear))
		) {
			const foundSector = data.find(d => d.sector === value.ClusterId);
			if (foundSector) {
				foundSector.targeted +=
					(value.TargetedBoys || 0) +
					(value.TargetedGirls || 0) +
					(value.TargetedMen || 0) +
					(value.TargetedWomen || 0);
				foundSector.reached +=
					(value.ReachedBoys || 0) +
					(value.ReachedGirls || 0) +
					(value.ReachedMen || 0) +
					(value.ReachedWomen || 0);
			} else {
				data.push({
					sector: value.ClusterId,
					targeted:
						(value.TargetedBoys || 0) +
						(value.TargetedGirls || 0) +
						(value.TargetedMen || 0) +
						(value.TargetedWomen || 0),
					reached:
						(value.ReachedBoys || 0) +
						(value.ReachedGirls || 0) +
						(value.ReachedMen || 0) +
						(value.ReachedWomen || 0),
				});
			}
		}
	});

	data.sort((a, b) => b.reached - a.reached);

	return data;
};

export default processDataSectors;
