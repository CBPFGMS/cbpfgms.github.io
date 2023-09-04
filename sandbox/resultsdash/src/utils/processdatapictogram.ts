const processDataPictogram: ProcessDataPictogram = ({
	rawData,
	reportYear,
	allocationSource,
	allocationType,
	fund,
	year,
}) => {
	const data: PictogramData = {
		reachedBoys: 0,
		reachedGirls: 0,
		reachedMen: 0,
		reachedWomen: 0,
		targetedBoys: 0,
		targetedGirls: 0,
		targetedMen: 0,
		targetedWomen: 0,
	};

	const thisYear = rawData.byDisability.find(
		year => year.year === reportYear[0] //Change this logic in case of multiyears
	);

	thisYear?.values.forEach(value => {
		if (
			(year === null || year.includes(value.AllocationYear)) &&
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId)
		) {
			data.reachedBoys += value.ReachedBoys || 0;
			data.reachedGirls += value.ReachedGirls || 0;
			data.reachedMen += value.ReachedMen || 0;
			data.reachedWomen += value.ReachedWomen || 0;
			data.targetedBoys += value.TargetedBoys || 0;
			data.targetedGirls += value.TargetedGirls || 0;
			data.targetedMen += value.TargetedMen || 0;
			data.targetedWomen += value.TargetedWomen || 0;
		}
	});

	return data;
};

export default processDataPictogram;
