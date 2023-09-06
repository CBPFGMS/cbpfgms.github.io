const processDataSummary: processDataSummary = ({
	rawData,
	reportYear,
	fund,
	allocationSource,
	allocationType,
	year,
}) => {
	const dataSummary: SummaryData[] = [];

	const dataPictogram: PictogramData = {
		reachedBoys: 0,
		reachedGirls: 0,
		reachedMen: 0,
		reachedWomen: 0,
		targetedBoys: 0,
		targetedGirls: 0,
		targetedMen: 0,
		targetedWomen: 0,
	};

	const inSelectionData: InSelectionObject = {
		funds: new Set(),
		allocationSources: new Set(),
		allocationTypes: new Set(),
	};

	const thisYear = rawData.byDisability.find(
		year => year.year === reportYear[0] //Change this logic in case of multiyears
	);

	thisYear?.values.forEach(value => {
		if (
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId)
		) {
			const foundYear = dataSummary.find(
				d => d.year === value.AllocationYear
			);
			if (foundYear) {
				foundYear.allocations += value.Budget;
				foundYear.projects += value.NumbofProjects;
				foundYear.partners += value.TotalNumbPartners;
			} else {
				dataSummary.push({
					year: value.AllocationYear,
					allocations: value.Budget,
					projects: value.NumbofProjects,
					partners: value.TotalNumbPartners,
				});
			}
			if (year === null || year.includes(value.AllocationYear)) {
				dataPictogram.reachedBoys += value.ReachedBoys || 0;
				dataPictogram.reachedGirls += value.ReachedGirls || 0;
				dataPictogram.reachedMen += value.ReachedMen || 0;
				dataPictogram.reachedWomen += value.ReachedWomen || 0;
				dataPictogram.targetedBoys += value.TargetedBoys || 0;
				dataPictogram.targetedGirls += value.TargetedGirls || 0;
				dataPictogram.targetedMen += value.TargetedMen || 0;
				dataPictogram.targetedWomen += value.TargetedWomen || 0;
			}
			// ATTEMPT 1
			// inSelectionData.funds.add(value.PooledFundId);
			// inSelectionData.allocationSources.add(value.AllocationSourceId);
			// inSelectionData.allocationTypes.add(value.AllocationtypeId);
		}
		// ATTEMPT 2
		// fund.includes(value.PooledFundId) &&
		// allocationSource.includes(value.AllocationSourceId) &&
		// allocationType.includes(value.AllocationtypeId)
		//
		// 	if (fund.includes(value.PooledFundId)) {
		// 		inSelectionData.allocationSources.add(value.AllocationSourceId);
		// 		inSelectionData.allocationTypes.add(value.AllocationtypeId);
		// 	}
		// 	if (allocationSource.includes(value.AllocationSourceId)) {
		// 		inSelectionData.funds.add(value.PooledFundId);
		// 		inSelectionData.allocationTypes.add(value.AllocationtypeId);
		// 	}
		// 	if (allocationType.includes(value.AllocationtypeId)) {
		// 		inSelectionData.funds.add(value.PooledFundId);
		// 		inSelectionData.allocationSources.add(value.AllocationSourceId);
		// 	}
		// });

		if (
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId)
		) {
			inSelectionData.allocationTypes.add(value.AllocationtypeId);
		}
		if (
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId)
		) {
			inSelectionData.funds.add(value.PooledFundId);
		}
		if (
			fund.includes(value.PooledFundId) &&
			allocationType.includes(value.AllocationtypeId)
		) {
			inSelectionData.allocationSources.add(value.AllocationSourceId);
		}
	});

	dataSummary.sort((a, b) => b.year - a.year);

	return { dataSummary, dataPictogram, inSelectionData };
};

export default processDataSummary;
